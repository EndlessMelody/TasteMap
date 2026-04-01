import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware bảo vệ route /admin/*
 * Kiểm tra cookie "admin_token" khớp với NEXT_PUBLIC_ADMIN_SECRET.
 * Nếu chưa login → redirect sang /admin/login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép truy cập trang login mà không cần auth
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Kiểm tra cookie admin_token
  const token = request.cookies.get("admin_token")?.value;
  const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "tastemap-admin-2026";

  if (token !== secret) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho route /admin/* (trừ /admin/login)
export const config = {
  matcher: "/admin/:path*",
};
