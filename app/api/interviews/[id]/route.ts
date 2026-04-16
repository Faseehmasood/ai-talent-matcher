// app/api/interviews/[id]/route.ts
import { NextRequest } from "next/server";
import { updateInterviewStatus } from "@/src/controllers/interview.controller";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Params yahan Promise hai
) {
  const params = await context.params; // Pehle await kiya
  // 🛠️ Note: Hum 'params' ko direct bhej rahe hain
  return updateInterviewStatus(req, { params }); 
}