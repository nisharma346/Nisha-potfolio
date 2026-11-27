import { NextResponse } from "next/server";
import { BACKEND_URL } from "../../../../lib/backend";

export const runtime = "nodejs";

export async function GET(request) {
  let response;
  try {
    response = await fetch(`${BACKEND_URL}/api/about/resume`, {
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    return new NextResponse("The resume file is unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!response.ok) {
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  }

  if (response.headers.get("content-type")?.split(";")[0] !== "application/pdf") {
    return new NextResponse("The resume service returned an invalid file.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${
        new URL(request.url).searchParams.get("disposition") === "inline"
          ? "inline"
          : "attachment"
      }; filename="resume.pdf"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
