import type {
  User,
  Player,
  Invoice,
  Application,
  ApplicationStatus,
  Product,
  Order,
  CartItem,
  SuccessStory,
  PaymentStatus,
  PlanType,
  PlayerWithPayments,
  PlayerDetail,
  PaymentWithRelations,
  PaymentWithAllocations,
  InvoiceWithPlayer,
  ProductWithVariants,
  ProductWithVariantCount,
  OrderWithItems,
  PlayerPaymentSummary,
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
} from "./types";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/**
 * Every server action and page reads/writes data through this interface —
 * never through `@/lib/prisma` directly. The implementation is backed by
 * Prisma on the Supabase Postgres database (see ./prisma.ts).
 */
export interface DataRepository {
  // Users & auth --------------------------------------------------------------
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateUserProfile(userId: string, input: { name: string; phone: string; address: string }): Promise<void>;
  getAdminEmails(): Promise<string[]>;
  createSetPasswordToken(email: string): Promise<string>;
  consumeSetPasswordToken(email: string, token: string): Promise<boolean>;

  // Applications --------------------------------------------------------------
  getApplications(filter?: { status?: ApplicationStatus }): Promise<Application[]>;
  getApplicationById(id: string): Promise<Application | null>;
  getPendingApplicationsForGuardianEmail(email: string): Promise<Application[]>;
  createApplication(input: CreateApplicationInput): Promise<Application>;
  approveApplication(input: ApproveApplicationInput): Promise<ApproveApplicationResult>;
  rejectApplication(input: RejectApplicationInput): Promise<RejectApplicationResult>;

  // Players -------------------------------------------------------------------
  getPlayersForUser(guardianId: string): Promise<PlayerWithPayments[]>;
  getPlayerByCode(memberCode: string): Promise<PlayerDetail | null>;
  getPlayerById(id: string): Promise<PlayerDetail | null>;
  getAllPlayers(): Promise<Player[]>;
  findPlayerForPayment(query: string): Promise<PlayerPaymentSummary | null>;
  updatePlayerPlan(playerId: string, plan: PlanType, monthlyFee: number): Promise<void>;
  updatePlayerNotes(playerId: string, notes: string | null): Promise<void>;
  togglePlayerActive(playerId: string, active: boolean): Promise<void>;
  getOutstandingForPlayer(playerId: string): Promise<number>;
  getOutstandingForPlayers(playerIds: string[]): Promise<Map<string, number>>;

  // Invoices --------------------------------------------------------------------
  getInvoicesForPlayer(playerId: string): Promise<Invoice[]>;
  getAllInvoices(): Promise<InvoiceWithPlayer[]>;
  generateMonthlyInvoices(month: number, year: number): Promise<{ created: number; skipped: number }>;

  // Payments ----------------------------------------------------------------------
  getPayments(filter?: { status?: PaymentStatus }): Promise<PaymentWithRelations[]>;
  getPaymentById(id: string): Promise<PaymentWithAllocations | null>;
  getPaymentByBillId(billId: string): Promise<PaymentWithRelations | null>;
  createFeePayment(input: CreateFeePaymentInput): Promise<CreateFeePaymentResult>;
  /** `rawPayload` is the raw Billplz webhook body — only ever passed by the real callback route, stored for audit; the dev-only mock gateway calls this without it. */
  confirmPaymentByBillId(billId: string, paid: boolean, rawPayload?: Record<string, string>): Promise<ConfirmPaymentOutcome>;
  resendReceipt(paymentId: string): Promise<void>;

  // Store — products ------------------------------------------------------------------
  getProducts(filter?: { active?: boolean }): Promise<Product[]>;
  getFeaturedProducts(limit: number): Promise<Product[]>;
  getProduct(slug: string): Promise<ProductWithVariants | null>;
  getProductById(id: string): Promise<ProductWithVariants | null>;
  getAllProductsForAdmin(): Promise<ProductWithVariantCount[]>;
  createProduct(input: ProductInputData): Promise<ActionResult<{ id: string }>>;
  updateProduct(id: string, input: ProductInputData): Promise<ActionResult>;
  addProductImage(id: string, url: string): Promise<void>;
  removeProductImage(id: string, url: string): Promise<void>;
  addVariant(productId: string, input: VariantInputData): Promise<ActionResult>;
  updateVariant(variantId: string, input: VariantInputData): Promise<ActionResult<{ productId: string }>>;
  deleteVariant(variantId: string): Promise<ActionResult<{ productId: string }>>;

  // Store — orders ----------------------------------------------------------------------
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<OrderWithItems | null>;
  getOrderByBillId(billId: string): Promise<OrderWithItems | null>;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  markOrderFulfilled(orderId: string): Promise<void>;

  // Store — cart --------------------------------------------------------------------------------
  getCartItems(userId: string): Promise<CartItem[]>;
  /** Atomically replaces the user's cart with the given (variantId, qty) rows. */
  replaceCartItems(userId: string, items: CartItemInput[]): Promise<void>;
  /** Joins variant/product data onto variant ids for cart display — always current pricing. */
  getCartDisplayItems(variantIds: string[]): Promise<CartDisplayItem[]>;

  // Success stories --------------------------------------------------------------------------
  getSuccessStories(filter?: { published?: boolean }): Promise<SuccessStory[]>;
  getFeaturedSuccessStory(): Promise<SuccessStory | null>;
  getSuccessStory(slug: string): Promise<SuccessStory | null>;
  getSuccessStoryById(id: string): Promise<SuccessStory | null>;
  createSuccessStory(input: SuccessStoryInputData): Promise<ActionResult<{ id: string }>>;
  updateSuccessStory(id: string, input: SuccessStoryInputData): Promise<ActionResult>;
  setSuccessStoryImage(id: string, url: string): Promise<void>;
  deleteSuccessStory(id: string): Promise<void>;

  // Settings ------------------------------------------------------------------------------------
  getSetting<K extends keyof SettingsMap>(key: K, fallback: SettingsMap[K]): Promise<SettingsMap[K]>;
  updateSettings(input: SettingsMap): Promise<void>;

  // Admin dashboard -------------------------------------------------------------------------------
  getDashboardStats(): Promise<DashboardStats>;

  // Sitemap ---------------------------------------------------------------------------------------
  getPublishedProductSlugs(): Promise<string[]>;
  getPublishedStorySlugs(): Promise<string[]>;
}
