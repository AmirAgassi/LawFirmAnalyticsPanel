"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FiUsers, FiMessageSquare, FiPhoneCall, FiTrendingUp } from "react-icons/fi";
import Image from "next/image";

type AnalyticsData = {
  traffic: {
    totalTraffic: number;
    paidTraffic: number;
  };
  avgTraffic: number;
  events: {
    chats: {
      yesClicks: number;
      visitorChats: number;
    };
    calls: number;
  };
  trafficHistory: {
    date: string;
    total: number;
    paid: number;
  }[];
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  subLabel?: string;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateRange(
      `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    );

    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-8 p-8">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Analytics Overview
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {dateRange}
            </p>
          </div>
          <Image
            src="/company-logo.png"
            alt="Company logo"
            width={340}
            height={200}
            className="object-contain"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Traffic"
            value={data.traffic.totalTraffic}
            icon={<FiUsers className="w-5 h-5" />}
            description="All website visitors"
          />
          <MetricCard
            label="Paid Traffic"
            value={data.traffic.paidTraffic}
            icon={<FiTrendingUp className="w-5 h-5" />}
            description="From paid campaigns"
          />
          <MetricCard
            label="Chat Interactions"
            value={data.events.chats.yesClicks}
            icon={<FiMessageSquare className="w-5 h-5" />}
            description="Total chat engagements"
            subLabel={data.events.chats.visitorChats.toLocaleString()}
          />
          <MetricCard
            label="Phone Calls"
            value={data.events.calls}
            icon={<FiPhoneCall className="w-5 h-5" />}
            description="Total call clicks"
          />
        </div>

        <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Traffic Trends</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
            Daily traffic distribution for {dateRange}
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={data.trafficHistory} 
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
            >
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tick={{ fill: '#6B7280' }}
                dy={10}
              />
              <YAxis 
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#totalGradient)"
                name="Total Traffic"
              />
              <Area
                type="monotone"
                dataKey="paid"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#paidGradient)"
                name="Paid Traffic"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, description, subLabel }: MetricCardProps) {
  return (
    <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
          {subLabel && (
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">
              ({subLabel})
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
      </div>
    </div>
  );
} 