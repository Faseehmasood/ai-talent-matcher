import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("File URL is missing", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) throw new Error("Failed to fetch from Cloudinary");

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Candidate_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Download Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}