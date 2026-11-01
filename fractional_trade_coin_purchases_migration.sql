-- Allow exact-value Trade Coin purchases (for example NGN 2,250 = 2.25 TC).
-- Apply this migration to Supabase before deploying the updated web app.

ALTER TABLE public.profiles
  ALTER COLUMN trade_coin_balance TYPE numeric(14,2) USING trade_coin_balance::numeric(14,2),
  ALTER COLUMN trade_coin_stc TYPE numeric(14,2) USING trade_coin_stc::numeric(14,2),
  ALTER COLUMN trade_coin_dtc TYPE numeric(14,2) USING trade_coin_dtc::numeric(14,2),
  ALTER COLUMN trade_coin_gtc TYPE numeric(14,2) USING trade_coin_gtc::numeric(14,2);

ALTER TABLE public.trade_coin_orders
  ALTER COLUMN trade_coins TYPE numeric(14,2) USING trade_coins::numeric(14,2);

ALTER TABLE public.trade_coin_transactions
  ALTER COLUMN amount TYPE numeric(14,2) USING amount::numeric(14,2);

CREATE OR REPLACE FUNCTION public.create_trade_coin_value_buy_order_v2(
  user_id_param uuid,
  coins_param numeric,
  base_amount_param numeric,
  service_fee_param numeric,
  flutterwave_charge_param numeric,
  flutterwave_vat_param numeric,
  total_payable_param numeric,
  payment_method_param text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_id uuid;
  exact_coins numeric(14,2);
BEGIN
  IF auth.uid() IS DISTINCT FROM user_id_param THEN
    RAISE EXCEPTION 'You can only create a Trade Coin order for your own account';
  END IF;

  IF base_amount_param < 1000 OR base_amount_param <> round(base_amount_param, 0) THEN
    RAISE EXCEPTION 'Minimum Trade Coin purchase is NGN 1000 and must use whole Naira';
  END IF;

  exact_coins := round(base_amount_param / 1000, 2);
  IF coins_param <> exact_coins THEN
    RAISE EXCEPTION 'Coin amount does not match the purchase value';
  END IF;

  INSERT INTO public.trade_coin_orders(
    user_id, order_type, coin_type, hours, price_per_hour, trade_fee,
    total_amount, trade_coins, payment_method, status, base_amount,
    service_fee, flutterwave_charge, flutterwave_vat, metadata
  ) VALUES (
    user_id_param, 'buy', 'STC', exact_coins / 100,
    1000, service_fee_param, total_payable_param, exact_coins,
    payment_method_param, 'pending', base_amount_param, service_fee_param,
    flutterwave_charge_param, flutterwave_vat_param,
    jsonb_build_object('display_coin_type', 'TC', 'coin_value_ngn', 1000, 'coins', exact_coins)
  ) RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_trade_coin_value_buy_order_v2(uuid, numeric, numeric, numeric, numeric, numeric, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_trade_coin_value_buy_order_v2(uuid, numeric, numeric, numeric, numeric, numeric, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_trade_coin_buy_order(
  order_id_param uuid,
  payment_reference_param text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record public.trade_coin_orders%ROWTYPE;
BEGIN
  SELECT * INTO order_record
  FROM public.trade_coin_orders
  WHERE id = order_id_param AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or already processed';
  END IF;

  IF auth.uid() IS DISTINCT FROM order_record.user_id THEN
    RAISE EXCEPTION 'You can only complete your own Trade Coin order';
  END IF;

  UPDATE public.trade_coin_orders
  SET status = 'completed',
      completed_at = now(),
      payment_reference = payment_reference_param,
      updated_at = now()
  WHERE id = order_id_param;

  UPDATE public.profiles
  SET trade_coin_balance = COALESCE(trade_coin_balance, 0) + order_record.trade_coins,
      trade_coin_stc = COALESCE(trade_coin_stc, 0) + order_record.trade_coins,
      updated_at = now()
  WHERE id = order_record.user_id;

  INSERT INTO public.trade_coin_transactions(
    user_id, transaction_type, coin_type, amount, naira_value, order_id, description
  ) VALUES (
    order_record.user_id, 'buy', order_record.coin_type, order_record.trade_coins,
    order_record.total_amount, order_id_param,
    'Purchased ' || order_record.trade_coins || ' TC'
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_trade_coin_buy_order(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_trade_coin_buy_order(uuid, text) TO authenticated;
