import { getMyScheduleAction } from "@/src/actions/interview.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, MapPin, Video, Info } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function CandidateSchedulePage() {
  // 1. Database se asli interviews mangwayein server par 
  const response = await getMyScheduleAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Failed to load your schedule");
  }

  const interviews = response.interviews || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Interview Schedule</h1>
        <p className="text-muted-foreground text-sm">Stay updated on your upcoming meetings.</p>
      </div>

      <div className="grid gap-4">
        {interviews.length > 0 ? (
          interviews.map((item: any) => (
            <Card key={item._id} className="rounded-3xl border-border overflow-hidden bg-card shadow-sm">
              <CardContent className="p-0 flex flex-col md:flex-row">
                
                {/* Date & Time Sidebar */}
                <div className="bg-primary/5 md:w-48 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border">
                  <CalendarDays className="w-6 h-6 text-primary mb-2" />
                  <span className="font-bold text-sm">
                    {new Date(item.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase mt-1">{item.startTime}</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 rounded-lg text-[10px] uppercase font-bold border-primary/20 text-primary">
                        {item.type}
                      </Badge>
                      <h3 className="text-xl font-bold">{item.job?.title}</h3>
                    </div>
                    <Badge className={`rounded-lg capitalize ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl"><User className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Interviewer</p>
                        <p className="text-sm font-bold">{item.interviewer?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl">
                        {item.type === 'remote' ? <Video className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
                        <p className="text-sm font-bold truncate max-w-[200px]">{item.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
             <Info className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
             <p className="text-muted-foreground text-sm">No interviews scheduled for you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}