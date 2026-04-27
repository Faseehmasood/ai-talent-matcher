import { getMyScheduleAction } from "@/src/actions/interview.actions";
import { InterviewActionMenu } from "@/components/dashboard/InterviewActionMenu";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays, Info } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function HRSchedulePage() {
  const response = await getMyScheduleAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Failed to load schedule");
  }

  const interviews = response.interviews || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Interview Agenda</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your upcoming candidate meetings and discussions.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
          <Clock className="w-5 h-5 text-primary" />
          Scheduled Interviews ({interviews.length})
        </h2>

        <div className="grid gap-4">
          {interviews.length > 0 ? (
            interviews.map((item: any) => (
              <Card key={item._id} className="rounded-2xl border-border overflow-hidden hover:shadow-md transition-all bg-card">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center p-5 gap-4">
                    
                    {/* 🛠️ ASLI TIME & DATE ✅ */}
                    <div className="w-full md:w-32 flex flex-col items-center justify-center p-3 bg-muted rounded-xl text-center">
                      <span className="text-sm font-bold text-primary">{item.startTime}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        {new Date(item.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* 🛠️ ASLI CANDIDATE INFO ✅ */}
                    <div className="flex-1 flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {item.candidate?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{item.candidate?.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.job?.title}</p>
                      </div>
                    </div>

                    {/* Type, Status & Actions */}
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-primary/20 text-primary">
                        {item.type}
                      </Badge>
                      
                      <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-0 ${
                        item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </Badge>

                      <InterviewActionMenu interview={item} />
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
               <Info className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
               <p className="text-muted-foreground text-sm">No interviews scheduled yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}