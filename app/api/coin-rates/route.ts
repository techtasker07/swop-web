import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key (if available) or anon key
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey);
};

/**
 * GET /api/coin-rates
 * Fetch current coin rates from database
 * Returns: { tradeCoinNairaRate: 1000, serviceCoinNairaRate: 800, updatedAt: "..." }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Fetch coin rates from database
    const { data, error } = await supabase
      .from('coin_rate_settings')
      .select('trade_coin_naira_rate, service_coin_naira_rate, updated_at')
      .eq('id', 'default')
      .single();

    if (error) {
      console.warn('Error fetching coin rates:', error);
      // Return defaults on error
      return NextResponse.json(
        {
          tradeCoinNairaRate: 1000,
          serviceCoinNairaRate: 800,
          updatedAt: new Date().toISOString(),
          source: 'default',
        },
        { status: 200 }
      );
    }

    if (!data) {
      // Return defaults if no data found
      return NextResponse.json(
        {
          tradeCoinNairaRate: 1000,
          serviceCoinNairaRate: 800,
          updatedAt: new Date().toISOString(),
          source: 'default',
        },
        { status: 200 }
      );
    }

    console.log('📊 Coin rates fetched:', data);

    return NextResponse.json(
      {
        tradeCoinNairaRate: data.trade_coin_naira_rate || 1000,
        serviceCoinNairaRate: data.service_coin_naira_rate || 800,
        updatedAt: data.updated_at,
        source: 'database',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in GET /api/coin-rates:', error);
    // Return defaults on any error
    return NextResponse.json(
      {
        tradeCoinNairaRate: 1000,
        serviceCoinNairaRate: 800,
        updatedAt: new Date().toISOString(),
        source: 'default',
        error: 'Using default rates due to error',
      },
      { status: 200 }
    );
  }
}

/**
 * POST /api/coin-rates
 * Update coin rates (admin only)
 * Body: { tradeCoinNairaRate: 1000, serviceCoinNairaRate: 800 }
 */
export async function POST(request: NextRequest) {
  try {
    // Note: In a real app, you'd verify admin authentication here
    // For now, we'll just allow the POST but this should be protected

    const body = await request.json();
    const { tradeCoinNairaRate, serviceCoinNairaRate } = body;

    // Validate input
    if (!tradeCoinNairaRate || !serviceCoinNairaRate || tradeCoinNairaRate <= 0 || serviceCoinNairaRate <= 0) {
      return NextResponse.json(
        { error: 'Invalid coin rates. Rates must be greater than 0.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update or insert coin rates
    const { data, error } = await supabase
      .from('coin_rate_settings')
      .upsert(
        {
          id: 'default',
          trade_coin_naira_rate: tradeCoinNairaRate,
          service_coin_naira_rate: serviceCoinNairaRate,
          updated_at: new Date().toISOString(),
          updated_by: 'api',
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating coin rates:', error);
      return NextResponse.json(
        { error: `Failed to update coin rates: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Coin rates updated:', data);

    return NextResponse.json(
      {
        success: true,
        message: 'Coin rates updated successfully',
        tradeCoinNairaRate: data.trade_coin_naira_rate,
        serviceCoinNairaRate: data.service_coin_naira_rate,
        updatedAt: data.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in POST /api/coin-rates:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
