import { NextResponse } from "next/server";

/**
 * On Windows, Node.js resolves "localhost" to ::1 (IPv6) but Express
 * typically listens on 127.0.0.1 (IPv4), causing ECONNREFUSED.
 * We explicitly use 127.0.0.1 for all server-side fetches.
 */
const BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    "localhost",
    "127.0.0.1"
  );

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic server-side validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Forward the login request to the Express backend
    // AbortController gives a clean timeout instead of a hanging request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let backendRes;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const isTimeout = fetchError.name === "AbortError";
      const isConnRefused =
        fetchError.cause?.code === "ECONNREFUSED" ||
        fetchError.message?.includes("ECONNREFUSED");

      if (isTimeout) {
        return NextResponse.json(
          { success: false, message: "Backend is taking too long. Please try again." },
          { status: 504 }
        );
      }
      if (isConnRefused) {
        return NextResponse.json(
          { success: false, message: "Cannot connect to server. Make sure the backend is running on port 5000." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Network error. Please check your connection." },
        { status: 503 }
      );
    }
    clearTimeout(timeoutId);

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Invalid credentials" },
        { status: backendRes.status }
      );
    }

    // Set the JWT in an HttpOnly cookie — never exposed to client-side JS
    const response = NextResponse.json({
      success: true,
      message: data.message,
      admin: data.admin,
    });

    response.cookies.set("admin_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day — matches backend JWT expiry
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}
