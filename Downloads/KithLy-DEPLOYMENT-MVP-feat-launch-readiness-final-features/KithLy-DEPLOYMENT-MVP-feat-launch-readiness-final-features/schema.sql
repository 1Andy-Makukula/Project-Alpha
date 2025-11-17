-- 1. Users (MODIFIED for Google Login)
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    -- password_hash is null if logging in via Google
    password_hash TEXT,
    -- New: Google unique ID
    google_id TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMPTZ DEFAULT now(),
    reset_token TEXT,
    reset_token_expiry TIMESTAMPTZ
);

-- 2. Shops (MODIFIED for Payout Details)
CREATE TABLE Shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES Users(id),
    shop_name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    image_url TEXT,
    is_open BOOLEAN DEFAULT true,
    -- New: Shop's bank account details for Flutterwave Payouts
    bank_name TEXT,
    account_number TEXT,
    -- New: The current commission rate (e.g., 0.00 for 0%)
    commission_rate NUMERIC(3, 2) DEFAULT 0.00,
    -- New: The date when commission rate changes (e.g., after 3 months)
    commission_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Orders (MODIFIED for Payout Tracking)
CREATE TABLE Orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_user_id UUID NOT NULL REFERENCES Users(id),
    shop_id UUID NOT NULL REFERENCES Shops(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total_price_in_cents INT NOT NULL,
    pickup_code TEXT NOT NULL UNIQUE,
    -- New: To track if funds have been transferred to the shop
    is_paid_out BOOLEAN DEFAULT false,
    -- New: Net amount KithLy receives (our margin/commission)
    kithly_fee_in_cents INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ... OrderItems table remains the same ...
CREATE TABLE OrderItems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES Orders(id),
    product_id UUID NOT NULL REFERENCES Products(id),
    quantity INT NOT NULL,
    price_at_purchase_in_cents INT NOT NULL
);
