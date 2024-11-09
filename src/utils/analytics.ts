import { BetaAnalyticsDataClient } from '@google-analytics/data';

// initialize analytics client with better error handling
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'),
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

// helper to get current month date range
function getCurrentMonthDates() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  };
}

async function safeAnalyticsQuery<T>(queryFn: () => Promise<T>): Promise<T | {
  totalTraffic: number;
  paidTraffic: number;
  trafficHistory: never[];
  events: {
    chats: {
      yesClicks: number;
      visitorChats: number;
    };
    calls: number;
  };
}> {
  try {
    return await queryFn();
  } catch (error: unknown) {
    console.error('Analytics query error:', error);
    // return default values on error
    return {
      totalTraffic: 0,
      paidTraffic: 0,
      trafficHistory: [],
      events: {
        chats: {
          yesClicks: 0,
          visitorChats: 0
        },
        calls: 0
      }
    };
  }
}

export async function getTrafficMetrics() {
  const { startDate, endDate } = getCurrentMonthDates();
  
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'sessions' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
  });

  // parse total and paid traffic
  const metrics = {
    totalTraffic: 0,
    paidTraffic: 0,
  };

  response.rows?.forEach(row => {
    const count = Number(row.metricValues?.[0].value) || 0;
    metrics.totalTraffic += count;
    
    // Check for Paid Search channel
    if (row.dimensionValues?.[0].value === 'Paid Search') {
      metrics.paidTraffic += count;
    }
  });

  return metrics;
}

export async function getAverageMonthlyTraffic() {
  // get last 6 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }],
    metrics: [{ name: 'sessions' }],
    dimensions: [{ name: 'month' }],
  });

  const totalTraffic = response.rows?.reduce((sum, row) => 
    sum + Number(row.metricValues?.[0].value || 0), 0) || 0;
  
  return Math.round(totalTraffic / 6);
}

export async function getCustomEvents() {
  const { startDate, endDate } = getCurrentMonthDates();

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'eventCount' }],
    dimensions: [{ name: 'eventName' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: {
          values: ['ngage_yes_click', 'ngage_visitor_chats', 'tel']
        }
      }
    }
  });

  // parse events
  const events = {
    chats: {
      yesClicks: 0,
      visitorChats: 0
    },
    calls: 0,
  };

  response.rows?.forEach(row => {
    const count = Number(row.metricValues?.[0].value) || 0;
    const eventName = row.dimensionValues?.[0].value;

    if (eventName === 'ngage_yes_click') {
      events.chats.yesClicks += count;
    } else if (eventName === 'ngage_visitor_chats') {
      events.chats.visitorChats += count;
    } else if (eventName === 'tel') {
      events.calls += count;
    }
  });

  return events;
}

// helper function to add ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export async function getTrafficHistory() {
  return safeAnalyticsQuery(async () => {
    const { startDate, endDate } = getCurrentMonthDates();
    
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{
        startDate,
        endDate,
      }],
      metrics: [
        { name: 'sessions' }
      ],
      dimensions: [
        { name: 'date' },
        { name: 'sessionDefaultChannelGroup' }
      ],
      orderBys: [
        { dimension: { dimensionName: 'date' } }
      ]
    });

    const dailyData: { [key: string]: { total: number; paid: number } } = {};
    
    response.rows?.forEach(row => {
      const rawDate = row.dimensionValues![0].value!;
      const year = rawDate.substring(0, 4);
      const month = rawDate.substring(4, 6);
      const day = rawDate.substring(6, 8);
      
      const dateKey = `${year}-${month}-${day}`;
      const channel = row.dimensionValues![1].value;
      const sessions = Number(row.metricValues![0].value) || 0;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { total: 0, paid: 0 };
      }
      
      dailyData[dateKey].total += sessions;
      if (channel === 'Paid Search') {
        dailyData[dateKey].paid += sessions;
      }
    });

    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr]) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        return {
          date: `${day}${getOrdinalSuffix(day)}`,
          total: dailyData[dateStr].total,
          paid: dailyData[dateStr].paid
        };
      });
  });
}