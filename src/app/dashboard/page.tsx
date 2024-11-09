import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Analytics from "@/components/Analytics";

export default async function Dashboard() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50/20 dark:from-gray-900 dark:to-gray-900/95">
      <Analytics />
    </div>
  );
} 