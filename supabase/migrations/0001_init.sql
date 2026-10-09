-- ===========================================================================
-- Sailors Football Academy — initial schema for Supabase Postgres
--
-- Run this in the Supabase SQL Editor (or via `supabase db push`) on a fresh
-- project. It is the canonical database definition; `prisma/schema.prisma`
-- mirrors it for the Prisma Client only.
--
-- Auth model: Supabase Auth owns identity in `auth.users`. Every auth user
-- gets a row in `public.profiles` via the `on_auth_user_created` trigger
-- below, and `profiles.id` is always the auth user's UUID. Application data
-- (players, invoices, payments, orders, ...) hangs off `profiles`.
--
-- Security: Row Level Security is enabled on every public table. The Next.js
-- app accesses the database through Prisma with the Postgres connection
-- string (owner role, which bypasses RLS), so no anon/authenticated policies
-- are needed except on `cart_items`, where authenticated users are allowed to
-- touch only their own rows as defense-in-depth.
-- ===========================================================================

CREATE SCHEMA IF NOT EXISTS "public";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE "Role" AS ENUM ('PARENT', 'ADMIN');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PlanType" AS ENUM ('FULL', 'SIBLING_2', 'SIBLING_3', 'SPONSORED');
CREATE TYPE "Programme" AS ENUM ('FOUNDATION', 'ADVANCE', 'PERFORMANCE');
CREATE TYPE "PaymentType" AS ENUM ('REGISTRATION', 'MONTHLY_FEE', 'STORE_ORDER');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');
CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'PARTIAL', 'SETTLED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELLED');
CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- ---------------------------------------------------------------------------
-- Users & auth
-- ---------------------------------------------------------------------------

-- One row per Supabase Auth user (mirrors auth.users; created by trigger).
CREATE TABLE "profiles" (
    "id"        TEXT NOT NULL,             -- auth.users UUID, never app-generated
    "name"      TEXT,
    "email"     TEXT NOT NULL,
    "phone"     TEXT,
    "address"   TEXT,
    "role"      "Role" NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- Emailed single-use tokens (set-password links after application approval).
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "expires"    TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- Mirror every new auth user into public.profiles. name/phone arrive via
-- user_metadata on sign-up or admin provisioning.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public."profiles" ("id", "name", "email", "phone", "role")
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
        NEW.email,
        NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
        'PARENT'
    )
    ON CONFLICT ("id") DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Enrolment
-- ---------------------------------------------------------------------------

CREATE TABLE "Application" (
    "id"              TEXT NOT NULL,
    "status"          "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "playerName"      TEXT NOT NULL,
    "dob"             TIMESTAMP(3) NOT NULL,
    "gender"          TEXT NOT NULL,
    "school"          TEXT,
    "position"        TEXT,
    "experience"      TEXT,
    "guardianName"    TEXT NOT NULL,
    "guardianIc"      TEXT,
    "guardianPhone"   TEXT NOT NULL,
    "guardianEmail"   TEXT NOT NULL,
    "address"         TEXT NOT NULL,
    "emergencyName"   TEXT NOT NULL,
    "emergencyPhone"  TEXT NOT NULL,
    "medicalNotes"    TEXT,
    "photoConsent"    BOOLEAN NOT NULL,
    "submittedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt"      TIMESTAMP(3),
    "reviewedById"    TEXT,
    "rejectionReason" TEXT,
    "playerId"        TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Players, fees & payments
-- ---------------------------------------------------------------------------

CREATE TABLE "Player" (
    "id"               TEXT NOT NULL,
    "memberCode"       TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "dob"              TIMESTAMP(3) NOT NULL,
    "ageGroup"         TEXT NOT NULL,
    "programme"        "Programme" NOT NULL,
    "plan"             "PlanType" NOT NULL DEFAULT 'FULL',
    "monthlyFee"       INTEGER NOT NULL,
    "registrationPaid" BOOLEAN NOT NULL DEFAULT false,
    "guardianId"       TEXT NOT NULL,
    "active"           BOOLEAN NOT NULL DEFAULT true,
    "joinedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes"            TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
    "id"          TEXT NOT NULL,
    "playerId"    TEXT NOT NULL,
    "type"        "PaymentType" NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear"  INTEGER NOT NULL,
    "amountDue"   INTEGER NOT NULL,
    "amountPaid"  INTEGER NOT NULL DEFAULT 0,
    "dueDate"     TIMESTAMP(3) NOT NULL,
    "status"      "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
    "id"            TEXT NOT NULL,
    "playerId"      TEXT,
    "orderId"       TEXT,
    "type"          "PaymentType" NOT NULL,
    "amount"        INTEGER NOT NULL,
    "status"        "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "billplzBillId" TEXT NOT NULL,
    "billplzUrl"    TEXT NOT NULL,
    "paidAt"        TIMESTAMP(3),
    "payerName"     TEXT NOT NULL,
    "payerEmail"    TEXT NOT NULL,
    "receiptNo"     TEXT,
    "receiptSentAt" TIMESTAMP(3),
    "rawCallback"   JSONB,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentAllocation" (
    "id"        TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountSen" INTEGER NOT NULL,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Store — products, variants, cart, orders
-- ---------------------------------------------------------------------------

CREATE TABLE "Product" (
    "id"          TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "priceSen"    INTEGER NOT NULL,
    "images"      TEXT[],
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariant" (
    "id"               TEXT NOT NULL,
    "productId"        TEXT NOT NULL,
    "label"            TEXT NOT NULL,
    "sku"              TEXT NOT NULL,
    "stock"            INTEGER NOT NULL DEFAULT 0,
    "priceOverrideSen" INTEGER,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- Signed-in users' carts. Guests shop from localStorage and merge into this
-- table on login (server-side via Prisma).
CREATE TABLE "cart_items" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "qty"       INTEGER NOT NULL,
    "addedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
    "id"             TEXT NOT NULL,
    "orderNo"        TEXT NOT NULL,
    "userId"         TEXT,
    "customerName"   TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "phone"          TEXT NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'PICKUP',
    "address"        JSONB,
    "subtotalSen"    INTEGER NOT NULL,
    "shippingSen"    INTEGER NOT NULL,
    "totalSen"       INTEGER NOT NULL,
    "status"         "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "billplzBillId"  TEXT,
    "billplzUrl"     TEXT,
    "paidAt"         TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
    "id"           TEXT NOT NULL,
    "orderId"      TEXT NOT NULL,
    "variantId"    TEXT NOT NULL,
    "productName"  TEXT NOT NULL,
    "variantLabel" TEXT NOT NULL,
    "qty"          INTEGER NOT NULL,
    "unitPriceSen" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Content & config
-- ---------------------------------------------------------------------------

CREATE TABLE "SuccessStory" (
    "id"         TEXT NOT NULL,
    "slug"       TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "ageGroup"   TEXT NOT NULL,
    "quote"      TEXT NOT NULL,
    "body"       TEXT NOT NULL,
    "image"      TEXT NOT NULL,
    "published"  BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Setting" (
    "key"   TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX "Application_playerId_key" ON "Application"("playerId");
CREATE INDEX "Application_status_idx" ON "Application"("status");

CREATE UNIQUE INDEX "Player_memberCode_key" ON "Player"("memberCode");
CREATE INDEX "Player_guardianId_idx" ON "Player"("guardianId");

CREATE UNIQUE INDEX "Invoice_playerId_type_periodMonth_periodYear_key" ON "Invoice"("playerId", "type", "periodMonth", "periodYear");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

CREATE UNIQUE INDEX "Payment_billplzBillId_key" ON "Payment"("billplzBillId");
CREATE UNIQUE INDEX "Payment_receiptNo_key" ON "Payment"("receiptNo");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

CREATE INDEX "PaymentAllocation_paymentId_idx" ON "PaymentAllocation"("paymentId");
CREATE INDEX "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

CREATE UNIQUE INDEX "cart_items_userId_variantId_key" ON "cart_items"("userId", "variantId");
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");

CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");
CREATE INDEX "Order_status_idx" ON "Order"("status");

CREATE UNIQUE INDEX "SuccessStory_slug_key" ON "SuccessStory"("slug");

-- ---------------------------------------------------------------------------
-- Foreign keys
-- ---------------------------------------------------------------------------

ALTER TABLE "Application" ADD CONSTRAINT "Application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Player" ADD CONSTRAINT "Player_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- The app talks to the database exclusively through Prisma with the Postgres
-- connection string (owner role, RLS bypass), so the default-deny posture for
-- anon/authenticated is intentional. cart_items additionally exposes
-- per-user policies so that, even if a client-side key were ever used, a
-- user can only ever see or modify their own cart.

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentAllocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SuccessStory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own" ON "cart_items"
    FOR SELECT TO authenticated
    USING (auth.uid()::text = "userId");

CREATE POLICY "cart_items_insert_own" ON "cart_items"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "cart_items_update_own" ON "cart_items"
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = "userId")
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "cart_items_delete_own" ON "cart_items"
    FOR DELETE TO authenticated
    USING (auth.uid()::text = "userId");
