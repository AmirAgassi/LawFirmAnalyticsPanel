import { getTrafficMetrics, getAverageMonthlyTraffic, getCustomEvents, getTrafficHistory } from '@/utils/analytics';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [traffic, avgTraffic, events, trafficHistory] = await Promise.all([
      getTrafficMetrics(),
      getAverageMonthlyTraffic(),
      getCustomEvents(),
      getTrafficHistory(),
    ]);

    return NextResponse.json({
      traffic,
      avgTraffic,
      events,
      trafficHistory,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 