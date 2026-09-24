-- =============================================
-- TRADE COIN MARKETPLACE MIGRATION
-- Implements a three-tier trade coin system with dynamic pricing
-- =============================================

-- =============================================
-- TRADE COIN PRICING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS trade_coin_pricing (
    id SERIAL PRIMARY KEY,
    coin_type VARCHAR(20) NOT NULL, -- 'STC', 'DTC', 'GTC'
    coin_name VARCHAR(100) NOT NULL, -- 'Silver Trade Coin', 'Diamond Trade Coin', 'Gold Trade Coin'
    base_price_per_hour DECIMAL(10,2) NOT NULL, -- Price in Naira per hour
    trade_fee DECIMAL(10,2) DEFAULT 50.00, -- Transaction fee in Naira
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_coin_type CHECK (coin_type IN ('STC', 'DTC', 'GTC')),
    CONSTRAINT valid_base_price CHECK (base_price_per_hour > 0),
    CONSTRAINT valid_trade_fee CHECK (trade_fee >= 0),
    UNIQUE(coin_type)
);

-- Insert default pricing
INSERT INTO trade_coin_pricing (coin_type, coin_name, base_price_per_hour, trade_fee, description, sort_order) VALUES
('STC', 'Silver Trade Coin', 1450.00, 50.00, 'Entry-level trade coin perfect for small transactions', 1),
('DTC', 'Diamond Trade Coin', 3450.00, 50.00, 'Premium trade coin for medium to large transactions', 2),
('GTC', 'Gold Trade Coin', 5450.00, 50.00, 'Elite trade coin for high-value transactions', 3)
ON CONFLICT (coin_type) DO NOTHING;

-- =============================================
-- TRADE COIN MARKETPLACE ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS trade_coin_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_type VARCHAR(20) NOT NULL, -- 'buy', 'sell'
    coin_type VARCHAR(20) NOT NULL, -- 'STC', 'DTC', 'GTC'
    hours DECIMAL(6,2) NOT NULL, -- Number of hours
    price_per_hour DECIMAL(10,2) NOT NULL, -- Price at time of order
    trade_fee DECIMAL(10,2) NOT NULL, -- Fee at time of order
    total_amount DECIMAL(10,2) NOT NULL, -- Total in Naira (hours * price_per_hour + trade_fee)
    trade_coins INTEGER NOT NULL, -- Number of trade coins (hours * 100 for conversion)
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    payment_method VARCHAR(50), -- 'bank_transfer', 'card', 'wallet', etc.
    payment_reference TEXT,
    payment_details JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    metadata JSONB,
    base_amount NUMERIC(12,2),
    service_fee NUMERIC(12,2) DEFAULT 0,
    flutterwave_charge NUMERIC(12,2) DEFAULT 0,
    flutterwave_vat NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_order_type CHECK (order_type IN ('buy', 'sell')),
    CONSTRAINT valid_coin_type CHECK (coin_type IN ('STC', 'DTC', 'GTC')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_hours CHECK (hours > 0),
    CONSTRAINT valid_price CHECK (price_per_hour > 0),
    CONSTRAINT valid_total CHECK (total_amount > 0),
    CONSTRAINT valid_trade_coins CHECK (trade_coins > 0)
);

-- =============================================
-- TRADE COIN WALLET TABLE (Enhanced)
-- =============================================
-- Add columns to profiles table for trade coin wallet
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trade_coin_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trade_coin_stc INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trade_coin_dtc INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trade_coin_gtc INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS valid_trade_coin_balance CHECK (trade_coin_balance >= 0),
ADD CONSTRAINT IF NOT EXISTS valid_trade_coin_stc CHECK (trade_coin_stc >= 0),
ADD CONSTRAINT IF NOT EXISTS valid_trade_coin_dtc CHECK (trade_coin_dtc >= 0),
ADD CONSTRAINT IF NOT EXISTS valid_trade_coin_gtc CHECK (trade_coin_gtc >= 0);

-- =============================================
-- TRADE COIN TRANSACTIONS TABLE (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS trade_coin_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'buy', 'sell', 'earned', 'spent', 'transfer_in', 'transfer_out'
    coin_type VARCHAR(20), -- 'STC', 'DTC', 'GTC', NULL for legacy
    amount INTEGER NOT NULL, -- Number of trade coins
    naira_value DECIMAL(10,2), -- Value in Naira at time of transaction
    order_id UUID REFERENCES trade_coin_orders(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('buy', 'sell', 'earned', 'spent', 'transfer_in', 'transfer_out', 'received', 'sent')),
    CONSTRAINT valid_coin_type_tx CHECK (coin_type IS NULL OR coin_type IN ('STC', 'DTC', 'GTC')),
    CONSTRAINT valid_amount CHECK (amount > 0)
);

-- =============================================
-- INDEXES
-- =============================================

-- Trade coin pricing indexes
CREATE INDEX IF NOT EXISTS idx_trade_coin_pricing_active ON trade_coin_pricing(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_trade_coin_pricing_type ON trade_coin_pricing(coin_type);

-- Trade coin orders indexes
CREATE INDEX IF NOT EXISTS idx_trade_coin_orders_user ON trade_coin_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_coin_orders_status ON trade_coin_orders(status);
CREATE INDEX IF NOT EXISTS idx_trade_coin_orders_type ON trade_coin_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_trade_coin_orders_coin_type ON trade_coin_orders(coin_type);
CREATE INDEX IF NOT EXISTS idx_trade_coin_orders_created ON trade_coin_orders(created_at DESC);

-- Trade coin transactions indexes
CREATE INDEX IF NOT EXISTS idx_trade_coin_transactions_user ON trade_coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_coin_transactions_type ON trade_coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_trade_coin_transactions_coin_type ON trade_coin_transactions(coin_type);
CREATE INDEX IF NOT EXISTS idx_trade_coin_transactions_order ON trade_coin_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_trade_coin_transactions_created ON trade_coin_transactions(created_at DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get current trade coin pricing
CREATE OR REPLACE FUNCTION get_trade_coin_pricing()
RETURNS TABLE(
    coin_type VARCHAR,
    coin_name VARCHAR,
    base_price_per_hour DECIMAL,
    trade_fee DECIMAL,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tcp.coin_type,
        tcp.coin_name,
        tcp.base_price_per_hour,
        tcp.trade_fee,
        tcp.description
    FROM trade_coin_pricing tcp
    WHERE tcp.is_active = TRUE
    ORDER BY tcp.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate trade coin order total
CREATE OR REPLACE FUNCTION calculate_trade_coin_order_total(
    coin_type_param VARCHAR,
    hours_param DECIMAL
)
RETURNS TABLE(
    price_per_hour DECIMAL,
    trade_fee DECIMAL,
    subtotal DECIMAL,
    total DECIMAL,
    trade_coins INTEGER
) AS $$
DECLARE
    pricing_record RECORD;
BEGIN
    -- Get current pricing
    SELECT 
        tcp.base_price_per_hour,
        tcp.trade_fee
    INTO pricing_record
    FROM trade_coin_pricing tcp
    WHERE tcp.coin_type = coin_type_param AND tcp.is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid coin type or pricing not available';
    END IF;
    
    -- Calculate totals
    RETURN QUERY
    SELECT 
        pricing_record.base_price_per_hour,
        pricing_record.trade_fee,
        (pricing_record.base_price_per_hour * hours_param)::DECIMAL(10,2) as subtotal,
        ((pricing_record.base_price_per_hour * hours_param) + pricing_record.trade_fee)::DECIMAL(10,2) as total,
        (hours_param * 100)::INTEGER as trade_coins; -- 1 hour = 100 trade coins
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create trade coin buy order
CREATE OR REPLACE FUNCTION create_trade_coin_buy_order(
    user_id_param UUID,
    coin_type_param VARCHAR,
    hours_param DECIMAL,
    payment_method_param VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
    pricing_record RECORD;
    calc_record RECORD;
BEGIN
    -- Get pricing and calculate totals
    SELECT * INTO calc_record
    FROM calculate_trade_coin_order_total(coin_type_param, hours_param);
    
    -- Create order
    INSERT INTO trade_coin_orders (
        user_id,
        order_type,
        coin_type,
        hours,
        price_per_hour,
        trade_fee,
        total_amount,
        trade_coins,
        payment_method,
        status
    ) VALUES (
        user_id_param,
        'buy',
        coin_type_param,
        hours_param,
        calc_record.price_per_hour,
        calc_record.trade_fee,
        calc_record.total,
        calc_record.trade_coins,
        payment_method_param,
        'pending'
    )
    RETURNING id INTO order_id;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create trade coin value-based buy order
CREATE OR REPLACE FUNCTION create_trade_coin_value_buy_order(
  user_id_param uuid,
  coins_param int,
  base_amount_param numeric,
  service_fee_param numeric,
  flutterwave_charge_param numeric,
  flutterwave_vat_param numeric,
  total_payable_param numeric,
  payment_method_param text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  order_id uuid;
BEGIN
  IF coins_param < 1 OR base_amount_param < 1000 THEN
    RAISE EXCEPTION 'Minimum Trade Coin purchase is NGN 1000';
  END IF;

  INSERT INTO trade_coin_orders(
    user_id, order_type, coin_type, hours, price_per_hour, trade_fee,
    total_amount, trade_coins, payment_method, status, base_amount,
    service_fee, flutterwave_charge, flutterwave_vat, metadata
  ) VALUES (
    user_id_param, 'buy', 'STC', GREATEST(coins_param::numeric / 100, 0.01),
    1000, service_fee_param, total_payable_param, coins_param,
    payment_method_param, 'pending', base_amount_param, service_fee_param,
    flutterwave_charge_param, flutterwave_vat_param,
    jsonb_build_object('display_coin_type', 'TC', 'coin_value_ngn', 1000)
  ) RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

-- Function to complete trade coin buy order
CREATE OR REPLACE FUNCTION complete_trade_coin_buy_order(
    p_order_id UUID,
    p_payment_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    order_record RECORD;
BEGIN
    -- Get order details
    SELECT * INTO order_record
    FROM trade_coin_orders
    WHERE id = p_order_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or already processed';
    END IF;
    
    -- Update order status
    UPDATE trade_coin_orders
    SET status = 'completed',
        completed_at = NOW(),
        payment_reference = p_payment_reference,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Update user's trade coin balance
    UPDATE profiles
    SET trade_coin_balance = trade_coin_balance + order_record.trade_coins,
        trade_coin_stc = CASE WHEN order_record.coin_type = 'STC' THEN trade_coin_stc + order_record.trade_coins ELSE trade_coin_stc END,
        trade_coin_dtc = CASE WHEN order_record.coin_type = 'DTC' THEN trade_coin_dtc + order_record.trade_coins ELSE trade_coin_dtc END,
        trade_coin_gtc = CASE WHEN order_record.coin_type = 'GTC' THEN trade_coin_gtc + order_record.trade_coins ELSE trade_coin_gtc END,
        updated_at = NOW()
    WHERE id = order_record.user_id;
    
    -- Create transaction record
    INSERT INTO trade_coin_transactions (
        user_id,
        transaction_type,
        coin_type,
        amount,
        naira_value,
        order_id,
        description
    ) VALUES (
        order_record.user_id,
        'buy',
        order_record.coin_type,
        order_record.trade_coins,
        order_record.total_amount,
        p_order_id,
        'Purchased ' || order_record.hours || ' hours of ' || order_record.coin_type
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create trade coin sell order
CREATE OR REPLACE FUNCTION create_trade_coin_sell_order(
    p_user_id UUID,
    p_coin_type VARCHAR,
    p_hours DECIMAL
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
    calc_record RECORD;
    user_balance INTEGER;
    required_coins INTEGER;
BEGIN
    -- Calculate required coins
    required_coins := (p_hours * 100)::INTEGER;
    
    -- Check user balance
    SELECT 
        CASE 
            WHEN p_coin_type = 'STC' THEN trade_coin_stc
            WHEN p_coin_type = 'DTC' THEN trade_coin_dtc
            WHEN p_coin_type = 'GTC' THEN trade_coin_gtc
            ELSE 0
        END INTO user_balance
    FROM profiles
    WHERE id = p_user_id;
    
    IF user_balance < required_coins THEN
        RAISE EXCEPTION 'Insufficient trade coin balance';
    END IF;
    
    -- Get pricing and calculate totals
    SELECT * INTO calc_record
    FROM calculate_trade_coin_order_total(p_coin_type, p_hours);
    
    -- Create order (sell orders get total minus fee)
    INSERT INTO trade_coin_orders (
        user_id,
        order_type,
        coin_type,
        hours,
        price_per_hour,
        trade_fee,
        total_amount,
        trade_coins,
        status
    ) VALUES (
        p_user_id,
        'sell',
        p_coin_type,
        p_hours,
        calc_record.price_per_hour,
        calc_record.trade_fee,
        calc_record.subtotal - calc_record.trade_fee, -- User receives subtotal minus fee
        calc_record.trade_coins,
        'pending'
    )
    RETURNING id INTO order_id;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete trade coin sell order
CREATE OR REPLACE FUNCTION complete_trade_coin_sell_order(
    p_order_id UUID,
    p_payment_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    order_record RECORD;
BEGIN
    -- Get order details
    SELECT * INTO order_record
    FROM trade_coin_orders
    WHERE id = p_order_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or already processed';
    END IF;
    
    -- Update order status
    UPDATE trade_coin_orders
    SET status = 'completed',
        completed_at = NOW(),
        payment_reference = p_payment_reference,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Deduct user's trade coin balance
    UPDATE profiles
    SET trade_coin_balance = trade_coin_balance - order_record.trade_coins,
        trade_coin_stc = CASE WHEN order_record.coin_type = 'STC' THEN trade_coin_stc - order_record.trade_coins ELSE trade_coin_stc END,
        trade_coin_dtc = CASE WHEN order_record.coin_type = 'DTC' THEN trade_coin_dtc - order_record.trade_coins ELSE trade_coin_dtc END,
        trade_coin_gtc = CASE WHEN order_record.coin_type = 'GTC' THEN trade_coin_gtc - order_record.trade_coins ELSE trade_coin_gtc END,
        updated_at = NOW()
    WHERE id = order_record.user_id;
    
    -- Create transaction record
    INSERT INTO trade_coin_transactions (
        user_id,
        transaction_type,
        coin_type,
        amount,
        naira_value,
        order_id,
        description
    ) VALUES (
        order_record.user_id,
        'sell',
        order_record.coin_type,
        order_record.trade_coins,
        order_record.total_amount,
        p_order_id,
        'Sold ' || order_record.hours || ' hours of ' || order_record.coin_type
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user trade coin balance
CREATE OR REPLACE FUNCTION get_user_trade_coin_balance(user_id_param UUID)
RETURNS TABLE(
    total_balance INTEGER,
    stc_balance INTEGER,
    dtc_balance INTEGER,
    gtc_balance INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.trade_coin_balance, 0) as total_balance,
        COALESCE(p.trade_coin_stc, 0) as stc_balance,
        COALESCE(p.trade_coin_dtc, 0) as dtc_balance,
        COALESCE(p.trade_coin_gtc, 0) as gtc_balance
    FROM profiles p
    WHERE p.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hold trade coins in escrow
CREATE OR REPLACE FUNCTION hold_trade_coins_in_escrow(
  p_trade_id uuid,
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_coin_type varchar,
  p_amount int
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  escrow_id uuid;
BEGIN
  INSERT INTO trade_coin_escrow(trade_id, from_user_id, to_user_id, coin_type, amount)
  VALUES (p_trade_id, p_from_user_id, p_to_user_id, p_coin_type, p_amount)
  RETURNING id INTO escrow_id;
  RETURN escrow_id;
END;
$$;

-- Release trade coins from escrow
CREATE OR REPLACE FUNCTION release_trade_coins_from_escrow(p_escrow_id uuid) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE trade_coin_escrow SET status = 'released', updated_at = now() WHERE id = p_escrow_id;
END;
$$;

-- Refund trade coins from escrow
CREATE OR REPLACE FUNCTION refund_trade_coins_from_escrow(p_escrow_id uuid) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE trade_coin_escrow SET status = 'refunded', updated_at = now() WHERE id = p_escrow_id;
END;
$$;

-- =============================================
-- TRADE COIN ESCROW TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS trade_coin_escrow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL,
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coin_type VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'held',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_escrow_status CHECK (status IN ('held', 'released', 'refunded'))
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at trigger for trade coin pricing
CREATE TRIGGER IF NOT EXISTS update_trade_coin_pricing_updated_at 
BEFORE UPDATE ON trade_coin_pricing 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for trade coin orders
CREATE TRIGGER IF NOT EXISTS update_trade_coin_orders_updated_at 
BEFORE UPDATE ON trade_coin_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE trade_coin_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_coin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_coin_transactions ENABLE ROW LEVEL SECURITY;

-- Trade coin pricing policies (public read)
CREATE POLICY IF NOT EXISTS "Anyone can view active trade coin pricing" 
ON trade_coin_pricing FOR SELECT 
USING (is_active = TRUE);

-- Trade coin orders policies
CREATE POLICY IF NOT EXISTS "Users can view own orders" 
ON trade_coin_orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own orders" 
ON trade_coin_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own pending orders" 
ON trade_coin_orders FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Trade coin transactions policies
CREATE POLICY IF NOT EXISTS "Users can view own transactions" 
ON trade_coin_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE trade_coin_pricing IS 'Dynamic pricing for three-tier trade coin system (STC, DTC, GTC)';
COMMENT ON TABLE trade_coin_orders IS 'Buy and sell orders for trade coins';
COMMENT ON TABLE trade_coin_transactions IS 'Transaction history for trade coin activities';

COMMENT ON COLUMN trade_coin_pricing.coin_type IS 'STC = Silver, DTC = Diamond, GTC = Gold';
COMMENT ON COLUMN trade_coin_pricing.base_price_per_hour IS 'Base price in Naira per hour';
COMMENT ON COLUMN trade_coin_orders.hours IS 'Number of hours (1 hour = 100 trade coins)';
COMMENT ON COLUMN trade_coin_orders.trade_coins IS 'Actual trade coins (hours * 100)';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
