-- Swopify coin value/payment restructure
-- Apply this in Supabase after the existing trade/service coin migrations.
-- Rules implemented:
-- 1 TC = NGN 1000, buy-only, no categories exposed to users.
-- 1 SC = NGN 1000, time-based (1 hour = 1 SC), buy and payout/sell enabled.
-- Service fee, Flutterwave charge, and VAT are stored per order for auditability.

ALTER TABLE trade_coin_orders
  ADD COLUMN IF NOT EXISTS base_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS service_fee numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flutterwave_charge numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flutterwave_vat numeric(12,2) DEFAULT 0;

ALTER TABLE service_coin_orders
  ADD COLUMN IF NOT EXISTS service_fee numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flutterwave_charge numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flutterwave_vat numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_payout numeric(12,2),
  ADD COLUMN IF NOT EXISTS payout_details jsonb,
  ADD COLUMN IF NOT EXISTS transfer_reference text;

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

CREATE OR REPLACE FUNCTION create_service_coin_value_buy_order(
  user_id_param uuid,
  hours_param numeric,
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
    RAISE EXCEPTION 'Minimum Service Coin purchase is NGN 1000';
  END IF;

  INSERT INTO service_coin_orders(
    user_id, coin_type, order_type, hours, amount_naira, status,
    service_fee, flutterwave_charge, flutterwave_vat, payout_details
  ) VALUES (
    user_id_param, 'BSC', 'buy', hours_param, total_payable_param, 'pending',
    service_fee_param, flutterwave_charge_param, flutterwave_vat_param,
    jsonb_build_object('display_coin_type', 'SC', 'coin_value_ngn', 1000, 'coins', coins_param)
  ) RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_service_coin_payout_order(
  user_id_param uuid,
  hours_param numeric,
  coins_param int,
  base_amount_param numeric,
  service_fee_param numeric,
  flutterwave_charge_param numeric,
  net_payout_param numeric,
  payout_details_param jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  order_id uuid;
  available int;
BEGIN
  SELECT COALESCE(bsc_balance, 0) INTO available
  FROM service_coin_balances
  WHERE user_id = user_id_param;

  IF COALESCE(available, 0) < coins_param THEN
    RAISE EXCEPTION 'Insufficient Service Coin balance';
  END IF;

  UPDATE service_coin_balances
  SET bsc_balance = bsc_balance - coins_param,
      updated_at = now()
  WHERE user_id = user_id_param;

  INSERT INTO service_coin_orders(
    user_id, coin_type, order_type, hours, amount_naira, status,
    service_fee, flutterwave_charge, net_payout, payout_details
  ) VALUES (
    user_id_param, 'BSC', 'sell', hours_param, base_amount_param, 'pending_payout',
    service_fee_param, flutterwave_charge_param, net_payout_param,
    payout_details_param || jsonb_build_object('display_coin_type', 'SC', 'coin_value_ngn', 1000, 'coins', coins_param)
  ) RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_service_coin_payout_processing(
  order_id_param uuid,
  transfer_reference_param text DEFAULT NULL
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE service_coin_orders
  SET status = 'processing_payout',
      transfer_reference = transfer_reference_param,
      payment_reference = COALESCE(transfer_reference_param, payment_reference),
      updated_at = now()
  WHERE id = order_id_param;
$$;

CREATE OR REPLACE FUNCTION mark_service_coin_payout_paid(
  order_id_param uuid,
  transfer_reference_param text DEFAULT NULL
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE service_coin_orders
  SET status = 'paid',
      transfer_reference = COALESCE(transfer_reference_param, transfer_reference),
      payment_reference = COALESCE(transfer_reference_param, payment_reference),
      updated_at = now()
  WHERE id = order_id_param;
$$;
CREATE OR REPLACE FUNCTION complete_service_coin_buy_order(
  order_id_param uuid,
  payment_reference_param text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  rec service_coin_orders%ROWTYPE;
  coins int;
BEGIN
  SELECT * INTO rec FROM service_coin_orders WHERE id = order_id_param;
  coins := COALESCE((rec.payout_details->>'coins')::int, GREATEST((rec.hours * 100)::int, 1));

  UPDATE service_coin_orders
  SET status = 'completed',
      payment_reference = payment_reference_param,
      updated_at = now()
  WHERE id = order_id_param;

  INSERT INTO service_coin_balances(user_id, bsc_balance, ssc_balance, gsc_balance)
  VALUES (rec.user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE service_coin_balances
  SET bsc_balance = bsc_balance + coins,
      updated_at = now()
  WHERE user_id = rec.user_id;
END;
$$;
-- Web parity helper: merge legacy service coin category balances into the single SC bucket.
UPDATE service_coin_balances
SET bsc_balance = COALESCE(bsc_balance, 0) + COALESCE(ssc_balance, 0) + COALESCE(gsc_balance, 0),
    ssc_balance = 0,
    gsc_balance = 0,
    updated_at = now()
WHERE COALESCE(ssc_balance, 0) > 0 OR COALESCE(gsc_balance, 0) > 0;

CREATE OR REPLACE FUNCTION cancel_service_coin_payout_order(
  order_id_param uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  rec service_coin_orders%ROWTYPE;
  coins int;
BEGIN
  SELECT * INTO rec FROM service_coin_orders WHERE id = order_id_param;
  IF rec.id IS NULL OR rec.status NOT IN ('pending_payout', 'processing_payout') THEN
    RETURN;
  END IF;

  coins := COALESCE((rec.payout_details->>'coins')::int, GREATEST((rec.hours)::int, 1));

  INSERT INTO service_coin_balances(user_id, bsc_balance, ssc_balance, gsc_balance)
  VALUES (rec.user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE service_coin_balances
  SET bsc_balance = bsc_balance + coins,
      updated_at = now()
  WHERE user_id = rec.user_id;

  UPDATE service_coin_orders
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = order_id_param;
END;
$$;