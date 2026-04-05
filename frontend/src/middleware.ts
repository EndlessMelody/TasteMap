import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Kiểm tra Admin routes (Logic cũ)
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_token")?.value;
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "tastemap-admin-2026";
    if (adminToken !== adminSecret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Nếu là admin và đã đăng nhập, có thể kệ supabase session nếu không cần
  }

  // 2. Supabase SSR Session Refresh
  // Bỏ qua static files/_next
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Gọi getUser để force refresh token nếu cần
  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedRoute = 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/tour-builder');

  let redirectUrl: URL | null = null;

  if (pathname === '/' && user) {
    // Nếu logged in ở trang landing, redirect vào dashboard
    redirectUrl = new URL('/discover', request.url);
  } else if (isProtectedRoute && !user) {
    // Nếu guest vào protected route, đẩy ra landing
    redirectUrl = new URL('/', request.url);
  }

  if (redirectUrl) {
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy set-cookies từ supabaseResponse (nếu có refresh token) sang redirectResponse
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set({ ...cookie });
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Apply everywhere except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
