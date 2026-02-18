import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "./lib/supabase/server";

/**
 * PROXY (Next.js 16)
 * ------------------
 * This file runs BEFORE every request in the application.
 *
 * It acts as an authentication gatekeeper.
 *
 * Why we use this:
 * - To refresh Supabase auth session automatically
 * - To read and update auth cookies on every request
 * - To protect private routes like /dashboard or /protected
 * - To redirect unauthenticated users
 *
 * Important:
 * - Runs on the server
 * - Has access to request cookies
 * - Can modify response before page loads
 *
 * Think of this like a security guard checking ID at the door.
 */

export default async function proxy(request: NextRequest) {
  
  // Create a response object that continues the request
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  /**
   * Create Supabase server client
   * This attaches cookie handling logic internally.
   */
  const supabase = await createSupabaseServerClient();

  /**
   * Get the current authenticated user.
   * This also refreshes tokens automatically if needed.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Current user:", user);

  /**
   * Route Protection Logic
   * ----------------------
   * If user is NOT logged in
   * and tries to access protected routes,
   * redirect them to login page.
   */
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow request to continue normally
  return response;
}