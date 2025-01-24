import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./app/(auth)/auth";

export async function middleware(req: NextRequest) {
  const token = await auth();
  const protectedRoutes = ["/chat/:id", "/chat"];
  const publicRoutes = ["/login", "/register", "/auth/error"];

  const { pathname } = req.nextUrl;

  // If the route is protected and the user has no token, redirect to login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the route is public and the user has a token, redirect to chat
  if (publicRoutes.some((route) => pathname.startsWith(route)) && token) {
    const chatUrl = new URL("/chat", req.url);
    return NextResponse.redirect(chatUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/register", "/auth/error", "/"],
};
