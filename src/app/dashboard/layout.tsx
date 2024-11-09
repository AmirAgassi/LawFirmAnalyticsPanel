import { headers } from 'next/headers';

// force dynamic rendering for this route segment
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ensure headers are accessed to make route dynamic
  headers();
  return children;
} 