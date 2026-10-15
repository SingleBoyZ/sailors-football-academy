import type {
  User,
  Player,
  Invoice,
  Payment,
  PaymentAllocation,
  Application,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  CartItem,
  SuccessStory,
  Role,
  PlanType,
  Programme,
  PaymentType,
  PaymentStatus,
  InvoiceStatus,
  OrderStatus,
  DeliveryMethod,
  ApplicationStatus,
} from "@prisma/client";

export type {
  User,
  Player,
  Invoice,
  Payment,
  PaymentAllocation,
  Application,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  CartItem,
  SuccessStory,
  Role,
  PlanType,
  Programme,
  PaymentType,
  PaymentStatus,
  InvoiceStatus,
  OrderStatus,
  DeliveryMethod,
  ApplicationStatus,
};

// ---------------------------------------------------------------------------
// Composed "with relations" shapes — the repository implementation returns
// plain objects conforming to these, so callers never care how they were
// fetched.
// ---------------------------------------------------------------------------

export type PlayerWithPayments = Player & { payments: Payment[] };
export type PlayerDetail = Player & { guardian: User; payments: Payment[]; invoices: Invoice[] };
export type PaymentWithRelations = Payment & { player: Player | null; order: Order | null };
export type PaymentWithAllocations = Payment & {
  player: (Player & { guardian: User }) | null;
  allocations: (PaymentAllocation & { invoice: Invoice })[];
};
export type InvoiceWithPlayer = Invoice & { player: Player };
export type ProductWithVariants = Product & { variants: ProductVariant[] };
export type ProductWithVariantCount = Product & { variantCount: number };
export type OrderWithItems = Order & { items: OrderItem[] };

// ---------------------------------------------------------------------------
// Input / result shapes for domain operations that don't map 1:1 onto a
// single model — these mirror what the consuming Server Actions need.
// ---------------------------------------------------------------------------

export type PlayerPaymentSummary = {
  playerId: string;
  name: string;
  memberCode: string;
  programme: string;
  ageGroup: string;
  monthlyFeeSen: number;
  outstandingSen: number;
  guardianEmail: string;
};

export type CreateApplicationInput = Omit<Application, "id" | "submittedAt" | "reviewedAt" | "reviewedById" | "rejectionReason" | "playerId" | "status">;

export type ApproveApplicationInput = {
  applicationId: string;
  programme: Programme;
  ageGroup: string;
  plan: PlanType;
  adminUserId: string;
};

export type ApproveApplicationResult =
  | { ok: true; player: Player; isNewGuardian: boolean; guardianEmail: string; guardianName: string; playerName: string; registrationFeeSen: number }
  | { ok: false; error: string };

export type RejectApplicationInput = { applicationId: string; reason?: string; adminUserId: string };
export type RejectApplicationResult = { ok: true; guardianEmail: string; guardianName: string; playerName: string } | { ok: false; error: string };

export type CreateFeePaymentInput = { playerId: string; amountSen: number; payerName: string; payerEmail: string };
export type CreateFeePaymentResult = { ok: true; billUrl: string; paymentId: string } | { ok: false; error: string };

export type CartItemInput = { variantId: string; qty: number };
export type CreateOrderAddress = { line1: string; line2?: string; city: string; state: string; postcode: string };
export type CreateOrderInput = {
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: CreateOrderAddress;
  items: CartItemInput[];
  /** Signed-in customer, when the order is placed from a logged-in session. */
  userId?: string;
};
export type CreateOrderResult = { ok: true; billUrl: string; orderId: string } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Cart — `cart_items` rows carry only (userId, variantId, qty); display data
// (name/label/price/image) is derived from the product tables on read so the
// cart always reflects current pricing.
// ---------------------------------------------------------------------------

export type CartDisplayItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  priceSen: number;
  image: string;
};

export type ConfirmPaymentOutcome =
  | { kind: "fee"; paymentId: string }
  | { kind: "order"; order: OrderWithItems }
  | { kind: "noop" };

export type DashboardStats = {
  pendingApplications: number;
  activePlayers: number;
  thisMonthCollectedSen: number;
  outstandingTotalSen: number;
  recentPayments: PaymentWithRelations[];
  chartData: { month: string; totalSen: number }[];
};

export type SettingsMap = {
  sponsoredMonthlyFeeSen: number;
  shippingSen: number;
  whatsappNumber: string;
  bannerText: string;
};

export type ProductInputData = { name: string; slug?: string; description: string; category: string; priceSen: number; active: boolean };
export type VariantInputData = { label: string; sku: string; stock: number; priceOverrideSen: number | null };
export type SuccessStoryInputData = { playerName: string; slug: string; ageGroup: string; quote: string; body: string; published: boolean };
