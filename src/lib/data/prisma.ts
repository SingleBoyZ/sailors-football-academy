import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { createBillWithDevFallback } from "@/lib/billplz";
import { provisionGuardian } from "@/lib/auth/provision";
import { generateOrderNo } from "@/lib/codes";
import { monthlyFeeForPlan } from "@/lib/plan";
import { sendEmail } from "@/lib/email/send";
import { allocateAmountToInvoices, outstandingForInvoices, invoiceDescription, type AllocatableInvoice } from "@/lib/payments/allocate";
import { FEES } from "@/content/schedule";
import { SITE } from "@/content/site";
import FeeReceipt from "@/emails/FeeReceipt";
import OrderConfirmation from "@/emails/OrderConfirmation";
import type { DataRepository, ActionResult } from "./repository";
import type {
  CreateApplicationInput,
  ApproveApplicationInput,
  ApproveApplicationResult,
  RejectApplicationInput,
  RejectApplicationResult,
  CreateFeePaymentInput,
  CreateFeePaymentResult,
  CartItemInput,
  CartDisplayItem,
  CreateOrderInput,
  CreateOrderResult,
  ConfirmPaymentOutcome,
  DashboardStats,
  SettingsMap,
  ProductInputData,
  VariantInputData,
  SuccessStoryInputData,
  PlayerPaymentSummary,
  InvoiceWithPlayer,
  PlayerWithPayments,
  PlayerDetail,
  PaymentWithRelations,
  PaymentWithAllocations,
  ProductWithVariants,
  ProductWithVariantCount,
  OrderWithItems,
} from "./types";

function toRow(inv: { id: string; type: string; periodMonth: number; periodYear: number; amountDue: number; amountPaid: number }): AllocatableInvoice {
  return inv;
}

async function generateReceiptNoTx(tx: Prisma.TransactionClient, date: Date): Promise<string> {
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `SFA-R-${yyyymm}-`;
  const count = await tx.payment.count({ where: { receiptNo: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

async function generateMemberCodeTx(tx: Prisma.TransactionClient, date: Date): Promise<string> {
  const year = date.getFullYear();
  const prefix = `SFA-${year}-`;
  const count = await tx.player.count({ where: { memberCode: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

/** Renders + emails a PDF receipt for an already-PAID, already-allocated fee Payment. Best-effort. */
async function sendFeeReceiptEmail(paymentId: string): Promise<void> {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { player: { include: { guardian: true } }, allocations: { include: { invoice: true } } },
  });
  if (!payment || !payment.player || payment.status !== "PAID" || !payment.receiptNo) return;

  try {
    // Loaded lazily so the PDF library is never pulled into pages that only
    // need the data layer (e.g. /portal) — it crashed serverless on Vercel.
    const { renderReceiptPdf } = await import("@/lib/pdf/receipt");

    const pendingBalance = await outstandingForPlayerId(payment.player.id);
    const pdf = await renderReceiptPdf({
      receiptNo: payment.receiptNo,
      paidAt: payment.paidAt ?? payment.createdAt,
      memberName: payment.player.name,
      memberCode: payment.player.memberCode,
      guardianName: payment.player.guardian.name ?? "",
      guardianEmail: payment.player.guardian.email,
      allocations: payment.allocations.map((a) => ({
        description: invoiceDescription(a.invoice.type, a.invoice.periodMonth, a.invoice.periodYear),
        amountSen: a.amountSen,
      })),
      amountPaidSen: payment.amount,
      pendingBalanceSen: pendingBalance,
      billplzBillId: payment.billplzBillId,
    });

    await sendEmail({
      to: payment.player.guardian.email,
      subject: `Receipt ${payment.receiptNo} — payment received`,
      react: FeeReceipt({
        guardianName: payment.player.guardian.name ?? "",
        memberName: payment.player.name,
        amountPaidSen: payment.amount,
        pendingBalanceSen: pendingBalance,
        receiptNo: payment.receiptNo,
      }),
      attachments: [{ filename: `${payment.receiptNo}.pdf`, content: pdf }],
    });

    await prisma.payment.update({ where: { id: payment.id }, data: { receiptSentAt: new Date() } });
  } catch (error) {
    console.error(`sendFeeReceiptEmail: failed for payment ${payment.id}`, error);
  }
}

async function outstandingForPlayerId(playerId: string): Promise<number> {
  const prisma = getPrisma();
  const invoices = await prisma.invoice.findMany({
    where: { playerId, status: { not: "SETTLED" } },
    select: { id: true, type: true, periodMonth: true, periodYear: true, amountDue: true, amountPaid: true },
  });
  return outstandingForInvoices(invoices.map(toRow));
}

export const prismaRepo: DataRepository = {
  // Users & auth ------------------------------------------------------------------
  async getUserByEmail(email) {
    return getPrisma().user.findUnique({ where: { email } });
  },
  async getUserById(id) {
    return getPrisma().user.findUnique({ where: { id } });
  },
  async updateUserProfile(userId, input) {
    await getPrisma().user.update({ where: { id: userId }, data: { name: input.name, phone: input.phone, address: input.address || null } });
  },
  async getAdminEmails() {
    const admins = await getPrisma()
      .user.findMany({ where: { role: "ADMIN" }, select: { email: true } })
      .catch(() => []);
    if (admins.length > 0) return admins.map((a) => a.email);
    return process.env.ADMIN_SEED_EMAIL ? [process.env.ADMIN_SEED_EMAIL] : [];
  },
  async createSetPasswordToken(email) {
    const crypto = await import("node:crypto");
    const token = crypto.randomBytes(24).toString("hex");
    await getPrisma().verificationToken.create({
      data: { identifier: `set-password:${email}`, token, expires: new Date(Date.now() + 1000 * 60 * 60 * 48) },
    });
    return token;
  },
  async consumeSetPasswordToken(email, token) {
    const prisma = getPrisma();
    const identifier = `set-password:${email}`;
    const record = await prisma.verificationToken.findUnique({ where: { identifier_token: { identifier, token } } });
    if (!record || record.expires < new Date()) return false;
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } });
    return true;
  },

  // Applications ------------------------------------------------------------------------
  async getApplications(filter) {
    return getPrisma().application.findMany({ where: filter?.status ? { status: filter.status } : undefined, orderBy: { submittedAt: "desc" } });
  },
  async getApplicationById(id) {
    return getPrisma().application.findUnique({ where: { id } });
  },
  async getPendingApplicationsForGuardianEmail(email) {
    return getPrisma().application.findMany({ where: { guardianEmail: email, status: "PENDING" }, orderBy: { submittedAt: "desc" } });
  },
  async createApplication(input: CreateApplicationInput) {
    return getPrisma().application.create({ data: { ...input, status: "PENDING" } });
  },
  async approveApplication(input: ApproveApplicationInput): Promise<ApproveApplicationResult> {
    const prisma = getPrisma();
    const application = await prisma.application.findUnique({ where: { id: input.applicationId } });
    if (!application) return { ok: false, error: "Application not found." };
    if (application.status !== "PENDING") return { ok: false, error: "This application has already been reviewed." };

    const sponsoredRow = await prisma.setting.findUnique({ where: { key: "sponsoredMonthlyFeeSen" } }).catch(() => null);
    const sponsoredFeeSen = typeof sponsoredRow?.value === "number" ? sponsoredRow.value : FEES.sponsoredSen;
    const monthlyFee = monthlyFeeForPlan(input.plan, sponsoredFeeSen);

    let guardian = await prisma.user.findUnique({ where: { email: application.guardianEmail } });
    const isNewGuardian = !guardian;
    if (!guardian) {
      // Provision the guardian in Supabase Auth — the on_auth_user_created
      // trigger materialises their public.profiles row. They set a password
      // later via the emailed set-password link.
      const guardianId = await provisionGuardian({
        name: application.guardianName,
        email: application.guardianEmail,
        phone: application.guardianPhone,
      });
      guardian = await prisma.user.findUnique({ where: { id: guardianId } });
      if (!guardian) return { ok: false, error: "Could not provision the guardian account — please try again." };
    }

    const now = new Date();
    const player = await prisma.$transaction(async (tx) => {
      const memberCode = await generateMemberCodeTx(tx, now);
      const newPlayer = await tx.player.create({
        data: {
          memberCode, name: application.playerName, dob: application.dob, ageGroup: input.ageGroup, programme: input.programme,
          plan: input.plan, monthlyFee, guardianId: guardian!.id, notes: application.medicalNotes,
        },
      });

      await tx.application.update({
        where: { id: application.id },
        data: { status: "APPROVED", reviewedAt: now, reviewedById: input.adminUserId, playerId: newPlayer.id },
      });

      await tx.invoice.create({
        data: { playerId: newPlayer.id, type: "REGISTRATION", periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), amountDue: FEES.registrationSen, dueDate: now },
      });
      await tx.invoice.create({
        data: { playerId: newPlayer.id, type: "MONTHLY_FEE", periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), amountDue: monthlyFee, dueDate: now },
      });

      return newPlayer;
    });

    return {
      ok: true, player, isNewGuardian, guardianEmail: application.guardianEmail, guardianName: application.guardianName,
      playerName: application.playerName, registrationFeeSen: FEES.registrationSen,
    };
  },
  async rejectApplication(input: RejectApplicationInput): Promise<RejectApplicationResult> {
    const prisma = getPrisma();
    const application = await prisma.application.findUnique({ where: { id: input.applicationId } });
    if (!application) return { ok: false, error: "Application not found." };
    if (application.status !== "PENDING") return { ok: false, error: "This application has already been reviewed." };

    await prisma.application.update({
      where: { id: application.id },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: input.adminUserId, rejectionReason: input.reason || null },
    });

    return { ok: true, guardianEmail: application.guardianEmail, guardianName: application.guardianName, playerName: application.playerName };
  },

  // Players ---------------------------------------------------------------------------------
  async getPlayersForUser(guardianId): Promise<PlayerWithPayments[]> {
    return getPrisma().player.findMany({ where: { guardianId }, include: { payments: { orderBy: { createdAt: "desc" } } }, orderBy: { joinedAt: "desc" } });
  },
  async getPlayerByCode(memberCode): Promise<PlayerDetail | null> {
    return getPrisma().player.findFirst({
      where: { memberCode: { equals: memberCode, mode: "insensitive" } },
      include: { guardian: true, payments: { orderBy: { createdAt: "desc" } }, invoices: { orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] } },
    });
  },
  async getPlayerById(id): Promise<PlayerDetail | null> {
    return getPrisma().player.findUnique({
      where: { id },
      include: { guardian: true, payments: { orderBy: { createdAt: "desc" } }, invoices: { orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] } },
    });
  },
  async getAllPlayers() {
    return getPrisma().player.findMany({ orderBy: { joinedAt: "desc" } });
  },
  async findPlayerForPayment(query): Promise<PlayerPaymentSummary | null> {
    const player = await getPrisma()
      .player.findFirst({
        where: { active: true, OR: [{ memberCode: { equals: query, mode: "insensitive" } }, { guardian: { email: { equals: query, mode: "insensitive" } } }] },
        include: { guardian: true },
      })
      .catch((error: unknown) => {
        console.error("findPlayerForPayment: query failed", error);
        return null;
      });
    if (!player) return null;

    const outstandingSen = await outstandingForPlayerId(player.id);
    return {
      playerId: player.id, name: player.name, memberCode: player.memberCode, programme: player.programme,
      ageGroup: player.ageGroup, monthlyFeeSen: player.monthlyFee, outstandingSen, guardianEmail: player.guardian.email,
    };
  },
  async updatePlayerPlan(playerId, plan, monthlyFee) {
    await getPrisma().player.update({ where: { id: playerId }, data: { plan, monthlyFee } });
  },
  async updatePlayerNotes(playerId, notes) {
    await getPrisma().player.update({ where: { id: playerId }, data: { notes: notes || null } });
  },
  async togglePlayerActive(playerId, active) {
    await getPrisma().player.update({ where: { id: playerId }, data: { active } });
  },
  async getOutstandingForPlayer(playerId) {
    return outstandingForPlayerId(playerId);
  },
  async getOutstandingForPlayers(playerIds) {
    if (!playerIds || playerIds.length === 0) {
      return new Map<string, number>();
    }
    const groups = await getPrisma().invoice.groupBy({
      by: ["playerId"],
      where: { playerId: { in: playerIds }, status: { not: "SETTLED" } },
      _sum: { amountDue: true, amountPaid: true },
    });
    const map = new Map<string, number>();
    for (const id of playerIds) map.set(id, 0);
    for (const group of groups) {
      map.set(group.playerId, (group._sum.amountDue ?? 0) - (group._sum.amountPaid ?? 0));
    }
    return map;
  },

  // Invoices -------------------------------------------------------------------------------------
  async getInvoicesForPlayer(playerId) {
    return getPrisma().invoice.findMany({ where: { playerId }, orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] });
  },
  async getAllInvoices(): Promise<InvoiceWithPlayer[]> {
    return getPrisma().invoice.findMany({ orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }], include: { player: true }, take: 500 });
  },
  async generateMonthlyInvoices(month, year) {
    const prisma = getPrisma();
    const players = await prisma.player.findMany({ where: { active: true } });
    const dueDate = new Date(year, month - 1, 1);
    let created = 0;
    let skipped = 0;

    for (const player of players) {
      const existing = await prisma.invoice.findUnique({
        where: { playerId_type_periodMonth_periodYear: { playerId: player.id, type: "MONTHLY_FEE", periodMonth: month, periodYear: year } },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      await prisma.invoice.create({ data: { playerId: player.id, type: "MONTHLY_FEE", periodMonth: month, periodYear: year, amountDue: player.monthlyFee, dueDate } });
      created += 1;
    }
    return { created, skipped };
  },

  // Payments ------------------------------------------------------------------------------------------
  async getPayments(filter): Promise<PaymentWithRelations[]> {
    return getPrisma().payment.findMany({ where: filter?.status ? { status: filter.status } : undefined, orderBy: { createdAt: "desc" }, include: { player: true, order: true }, take: 500 });
  },
  async getPaymentById(id): Promise<PaymentWithAllocations | null> {
    return getPrisma().payment.findUnique({
      where: { id },
      include: { player: { include: { guardian: true } }, allocations: { include: { invoice: true } } },
    });
  },
  async getPaymentByBillId(billId): Promise<PaymentWithRelations | null> {
    return getPrisma().payment.findUnique({ where: { billplzBillId: billId }, include: { player: true, order: true } });
  },
  async createFeePayment(input: CreateFeePaymentInput): Promise<CreateFeePaymentResult> {
    const prisma = getPrisma();
    const player = await prisma.player.findUnique({ where: { id: input.playerId } });
    if (!player || !player.active) return { ok: false, error: "This player could not be found." };

    const outstanding = await outstandingForPlayerId(player.id);
    if (outstanding <= 0) return { ok: false, error: "This account has no outstanding balance." };
    const amountSen = Math.min(input.amountSen, outstanding);

    const collectionId = process.env.BILLPLZ_COLLECTION_ID_FEES;
    if (!collectionId) return { ok: false, error: "Fee payments are not configured yet. Please contact the academy directly." };

    const hasUnpaidRegistration = !player.registrationPaid;

    let bill;
    try {
      bill = await createBillWithDevFallback({
        collectionId, email: input.payerEmail, name: input.payerName, amountSen,
        description: `Sailors FA fees — ${player.name} (${player.memberCode})`,
        callbackUrl: `${SITE.url}/api/billplz/callback`, redirectUrl: `${SITE.url}/pay/result`,
        referenceLabel: "Member Code", referenceValue: player.memberCode,
        mockPath: "/pay/mock-gateway",
      });
    } catch (error) {
      console.error("createFeePayment: Billplz bill creation failed", error);
      return { ok: false, error: "Could not start payment. Please try again in a moment." };
    }

    const payment = await prisma.payment.create({
      data: {
        playerId: player.id, type: hasUnpaidRegistration ? "REGISTRATION" : "MONTHLY_FEE", amount: amountSen, status: "PENDING",
        billplzBillId: bill.id, billplzUrl: bill.url, payerName: input.payerName, payerEmail: input.payerEmail,
      },
    });

    return { ok: true, billUrl: bill.url, paymentId: payment.id };
  },
  async confirmPaymentByBillId(billId, paid, rawPayload): Promise<ConfirmPaymentOutcome> {
    const prisma = getPrisma();
    const outcome = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { billplzBillId: billId } });
      if (!payment || payment.status !== "PENDING") return null;

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: paid ? "PAID" : "FAILED", paidAt: paid ? new Date() : undefined, rawCallback: rawPayload as Prisma.InputJsonValue | undefined },
      });

      if (!paid) return null;

      if (payment.type === "STORE_ORDER" && payment.orderId) {
        const order = await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAID", paidAt: new Date() }, include: { items: true } });
        for (const item of order.items) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.qty } } });
        }
        return { kind: "order" as const, order };
      }

      if (payment.playerId) {
        const invoices = await tx.invoice.findMany({ where: { playerId: payment.playerId, status: { not: "SETTLED" } } });
        const result = allocateAmountToInvoices(invoices.map(toRow), payment.amount);

        for (const alloc of result.allocations) {
          await tx.paymentAllocation.create({ data: { paymentId: payment.id, invoiceId: alloc.invoiceId, amountSen: alloc.amountSen } });
        }
        for (const update of result.invoiceUpdates) {
          await tx.invoice.update({ where: { id: update.invoiceId }, data: { amountPaid: update.amountPaid, status: update.status } });
        }
        if (invoices.some((i) => i.type === "REGISTRATION")) {
          await tx.player.update({ where: { id: payment.playerId }, data: { registrationPaid: true } });
        }

        const receiptNo = await generateReceiptNoTx(tx, payment.paidAt ?? new Date());
        await tx.payment.update({ where: { id: payment.id }, data: { receiptNo } });

        return { kind: "fee" as const, paymentId: payment.id };
      }

      return null;
    });

    if (outcome?.kind === "order") {
      await sendEmail({
        to: outcome.order.email,
        subject: `Order confirmed — ${outcome.order.orderNo}`,
        react: OrderConfirmation({
          orderNo: outcome.order.orderNo, customerName: outcome.order.customerName, items: outcome.order.items,
          subtotalSen: outcome.order.subtotalSen, shippingSen: outcome.order.shippingSen, totalSen: outcome.order.totalSen, deliveryMethod: outcome.order.deliveryMethod,
        }),
      });
      return { kind: "order", order: outcome.order };
    }

    if (outcome?.kind === "fee") {
      await sendFeeReceiptEmail(outcome.paymentId);
      return { kind: "fee", paymentId: outcome.paymentId };
    }

    return { kind: "noop" };
  },
  async resendReceipt(paymentId) {
    await sendFeeReceiptEmail(paymentId);
  },

  // Store — products --------------------------------------------------------------------------------------
  async getProducts(filter) {
    return getPrisma().product.findMany({ where: filter?.active === undefined ? undefined : { active: filter.active }, orderBy: { createdAt: "desc" } });
  },
  async getFeaturedProducts(limit) {
    return getPrisma().product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: limit });
  },
  async getProduct(slug): Promise<ProductWithVariants | null> {
    return getPrisma().product.findUnique({ where: { slug }, include: { variants: { orderBy: { label: "asc" } } } });
  },
  async getProductById(id): Promise<ProductWithVariants | null> {
    return getPrisma().product.findUnique({ where: { id }, include: { variants: { orderBy: { label: "asc" } } } });
  },
  async getAllProductsForAdmin(): Promise<ProductWithVariantCount[]> {
    const products = await getPrisma().product.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { variants: true } } } });
    return products.map((p) => ({ ...p, variantCount: p._count.variants }));
  },
  async createProduct(input: ProductInputData): Promise<ActionResult<{ id: string }>> {
    const prisma = getPrisma();
    const slug = input.slug || input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return { ok: false, error: `A product with slug "${slug}" already exists.` };

    const product = await prisma.product.create({
      data: { name: input.name, slug, description: input.description, category: input.category, priceSen: input.priceSen, active: input.active, images: [] },
    });
    return { ok: true, data: { id: product.id } };
  },
  async updateProduct(id, input: ProductInputData): Promise<ActionResult> {
    await getPrisma().product.update({
      where: { id }, data: { name: input.name, description: input.description, category: input.category, priceSen: input.priceSen, active: input.active },
    });
    return { ok: true };
  },
  async addProductImage(id, url) {
    const prisma = getPrisma();
    const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });
    await prisma.product.update({ where: { id }, data: { images: [...(product?.images ?? []), url] } });
  },
  async removeProductImage(id, url) {
    const prisma = getPrisma();
    const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });
    await prisma.product.update({ where: { id }, data: { images: (product?.images ?? []).filter((i) => i !== url) } });
  },
  async addVariant(productId, input: VariantInputData): Promise<ActionResult> {
    const prisma = getPrisma();
    const existingSku = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
    if (existingSku) return { ok: false, error: `SKU "${input.sku}" is already in use.` };
    await prisma.productVariant.create({ data: { ...input, productId } });
    return { ok: true };
  },
  async updateVariant(variantId, input: VariantInputData): Promise<ActionResult<{ productId: string }>> {
    const variant = await getPrisma().productVariant.update({ where: { id: variantId }, data: input });
    return { ok: true, data: { productId: variant.productId } };
  },
  async deleteVariant(variantId): Promise<ActionResult<{ productId: string }>> {
    const prisma = getPrisma();
    const orderItemCount = await prisma.orderItem.count({ where: { variantId } });
    if (orderItemCount > 0) return { ok: false, error: "This variant has order history and can't be deleted — deactivate the product instead." };
    const variant = await prisma.productVariant.delete({ where: { id: variantId } });
    return { ok: true, data: { productId: variant.productId } };
  },

  // Store — orders -----------------------------------------------------------------------------------------------
  async getOrders() {
    return getPrisma().order.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  },
  async getOrderById(id): Promise<OrderWithItems | null> {
    return getPrisma().order.findUnique({ where: { id }, include: { items: true } });
  },
  async getOrderByBillId(billId): Promise<OrderWithItems | null> {
    return getPrisma().order.findFirst({ where: { billplzBillId: billId }, include: { items: true } });
  },
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const prisma = getPrisma();
    const variantIds = input.items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({ where: { id: { in: variantIds } }, include: { product: true } });
    if (variants.length !== variantIds.length) return { ok: false, error: "One or more items in your cart are no longer available." };

    for (const item of input.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.product.active) return { ok: false, error: "One or more items in your cart are no longer available." };
      if (variant.stock < item.qty) return { ok: false, error: `Only ${variant.stock} left of "${variant.product.name} (${variant.label})".` };
    }

    const subtotalSen = input.items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + (variant.priceOverrideSen ?? variant.product.priceSen) * item.qty;
    }, 0);

    const shippingRow = await prisma.setting.findUnique({ where: { key: "shippingSen" } }).catch(() => null);
    const shippingSen = input.deliveryMethod === "DELIVERY" ? (typeof shippingRow?.value === "number" ? shippingRow.value : 800) : 0;
    const totalSen = subtotalSen + shippingSen;

    const collectionId = process.env.BILLPLZ_COLLECTION_ID_STORE;
    if (!collectionId) return { ok: false, error: "Store payments are not configured yet. Please contact the academy directly." };

    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        orderNo, customerName: input.customerName, email: input.email, phone: input.phone, deliveryMethod: input.deliveryMethod,
        userId: input.userId ?? null,
        address: input.deliveryMethod === "DELIVERY" ? input.address : undefined, subtotalSen, shippingSen, totalSen, status: "PENDING",
        items: {
          create: input.items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            return { variantId: variant.id, productName: variant.product.name, variantLabel: variant.label, qty: item.qty, unitPriceSen: variant.priceOverrideSen ?? variant.product.priceSen };
          }),
        },
      },
    });

    let bill;
    try {
      bill = await createBillWithDevFallback({
        collectionId, email: input.email, name: input.customerName, amountSen: totalSen, description: `Sailors FA store order ${orderNo}`,
        callbackUrl: `${SITE.url}/api/billplz/callback`, redirectUrl: `${SITE.url}/checkout/success`, referenceLabel: "Order No", referenceValue: orderNo,
        mockPath: "/checkout/mock-gateway",
      });
    } catch (error) {
      console.error("createOrder: Billplz bill creation failed", error);
      return { ok: false, error: "Could not start payment. Please try again in a moment." };
    }

    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { billplzBillId: bill.id, billplzUrl: bill.url } }),
      prisma.payment.create({
        data: { orderId: order.id, type: "STORE_ORDER", amount: totalSen, status: "PENDING", billplzBillId: bill.id, billplzUrl: bill.url, payerName: input.customerName, payerEmail: input.email },
      }),
    ]);

    return { ok: true, billUrl: bill.url, orderId: order.id };
  },
  async markOrderFulfilled(orderId) {
    await getPrisma().order.update({ where: { id: orderId }, data: { status: "FULFILLED" } });
  },

  // Store — cart -------------------------------------------------------------------------------------------------------
  async getCartItems(userId) {
    return getPrisma().cartItem.findMany({ where: { userId }, orderBy: { addedAt: "asc" } });
  },
  async replaceCartItems(userId, items: CartItemInput[]) {
    const prisma = getPrisma();
    const variantIds = items.map((i) => i.variantId);
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId, NOT: { variantId: { in: variantIds } } } }),
      ...items.map((item) =>
        prisma.cartItem.upsert({
          where: { userId_variantId: { userId, variantId: item.variantId } },
          update: { qty: item.qty },
          create: { userId, variantId: item.variantId, qty: item.qty },
        }),
      ),
    ]);
  },
  async getCartDisplayItems(variantIds): Promise<CartDisplayItem[]> {
    if (variantIds.length === 0) return [];
    const variants = await getPrisma().productVariant.findMany({
      where: { id: { in: variantIds }, product: { active: true } },
      include: { product: true },
    });
    return variants.map((variant) => ({
      variantId: variant.id,
      productSlug: variant.product.slug,
      productName: variant.product.name,
      variantLabel: variant.label,
      priceSen: variant.priceOverrideSen ?? variant.product.priceSen,
      image: variant.product.images[0] ?? "",
    }));
  },

  // Success stories -------------------------------------------------------------------------------------------------
  async getSuccessStories(filter) {
    return getPrisma().successStory.findMany({ where: filter?.published === undefined ? undefined : { published: filter.published }, orderBy: { createdAt: "desc" } });
  },
  async getFeaturedSuccessStory() {
    return getPrisma().successStory.findFirst({ where: { published: true }, orderBy: { createdAt: "desc" } });
  },
  async getSuccessStory(slug) {
    return getPrisma().successStory.findUnique({ where: { slug } });
  },
  async getSuccessStoryById(id) {
    return getPrisma().successStory.findUnique({ where: { id } });
  },
  async createSuccessStory(input: SuccessStoryInputData): Promise<ActionResult<{ id: string }>> {
    const prisma = getPrisma();
    const existing = await prisma.successStory.findUnique({ where: { slug: input.slug } });
    if (existing) return { ok: false, error: `A story with slug "${input.slug}" already exists.` };
    const story = await prisma.successStory.create({ data: { ...input, image: "/placeholders/success-story-1.svg" } });
    return { ok: true, data: { id: story.id } };
  },
  async updateSuccessStory(id, input: SuccessStoryInputData): Promise<ActionResult> {
    await getPrisma().successStory.update({ where: { id }, data: input });
    return { ok: true };
  },
  async setSuccessStoryImage(id, url) {
    await getPrisma().successStory.update({ where: { id }, data: { image: url } });
  },
  async deleteSuccessStory(id) {
    await getPrisma().successStory.delete({ where: { id } });
  },

  // Settings ----------------------------------------------------------------------------------------------------------
  async getSetting(key, fallback) {
    try {
      const row = await getPrisma().setting.findUnique({ where: { key } });
      return row ? (row.value as never) : fallback;
    } catch (error) {
      console.error(`getSetting(${key}): failed`, error);
      return fallback;
    }
  },
  async updateSettings(input: SettingsMap) {
    const prisma = getPrisma();
    await prisma.$transaction(
      Object.entries(input).map(([key, value]) => prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })),
    );
  },

  // Admin dashboard -----------------------------------------------------------------------------------------------------
  async getDashboardStats(): Promise<DashboardStats> {
    const prisma = getPrisma();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [pendingApplications, activePlayers, monthPayments, openInvoices, recentPayments, chartPayments] = await Promise.all([
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.player.count({ where: { active: true } }),
      prisma.payment.findMany({ where: { status: "PAID", paidAt: { gte: monthStart } }, select: { amount: true } }),
      prisma.invoice.findMany({ where: { status: { not: "SETTLED" } }, select: { amountDue: true, amountPaid: true } }),
      prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { player: true, order: true } }),
      prisma.payment.findMany({ where: { status: "PAID", paidAt: { gte: sixMonthsAgo } }, select: { amount: true, paidAt: true } }),
    ]);

    const thisMonthCollectedSen = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingTotalSen = openInvoices.reduce((sum, inv) => sum + (inv.amountDue - inv.amountPaid), 0);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      chartMap.set(`${dt.getFullYear()}-${dt.getMonth()}`, 0);
    }
    for (const p of chartPayments) {
      if (!p.paidAt) continue;
      const key = `${p.paidAt.getFullYear()}-${p.paidAt.getMonth()}`;
      if (chartMap.has(key)) chartMap.set(key, (chartMap.get(key) ?? 0) + p.amount);
    }
    const chartData = Array.from(chartMap.entries()).map(([key, totalSen]) => ({ month: MONTH_NAMES[Number(key.split("-")[1])], totalSen }));

    return { pendingApplications, activePlayers, thisMonthCollectedSen, outstandingTotalSen, recentPayments, chartData };
  },

  // Sitemap -----------------------------------------------------------------------------------------------------------------
  async getPublishedProductSlugs() {
    const rows = await getPrisma()
      .product.findMany({ where: { active: true }, select: { slug: true } })
      .catch(() => []);
    return rows.map((r) => r.slug);
  },
  async getPublishedStorySlugs() {
    const rows = await getPrisma()
      .successStory.findMany({ where: { published: true }, select: { slug: true } })
      .catch(() => []);
    return rows.map((r) => r.slug);
  },
};