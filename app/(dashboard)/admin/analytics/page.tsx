import { getAdminAnalyticsAction } from "@/src/actions/stats.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLineChart } from "@/components/dashboard/AdminLineChart";
import { AdminPieChart } from "@/components/dashboard/AdminPieChart";   
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  // 1. Database se poora platform ka trend mangwayein 
  const response = await getAdminAnalyticsAction();

  if (!response.success) {
     if (response.code === "UNAUTHORIZED") redirect("/login");
     throw new Error("Analytics failed to load");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground text-sm">Visual breakdown of TalentaSync performance.</p>
      </div>

      {/*  ASLI CHARTS SECTION  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend (Line Chart) */}
        <Card className="rounded-[2rem] border-border shadow-sm bg-card">
          <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">User vs Job Growth</CardTitle></CardHeader>
          <CardContent>
             <AdminLineChart data={response.growthData || []} />
          </CardContent>
        </Card>

        {/* User Distribution (Pie Chart) */}
        <Card className="rounded-[2rem] border-border shadow-sm bg-card">
          <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">User Type Distribution</CardTitle></CardHeader>
          <CardContent>
             <AdminPieChart data={response.distributionData || []} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}