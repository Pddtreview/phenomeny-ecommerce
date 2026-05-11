import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminUser } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
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
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminLogin = path === "/admin/login";
  const isAdminArea = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");

  if (isAdminLogin) {
    if (user && isAdminUser(user)) {
      const dest = request.nextUrl.searchParams.get("redirect");
      const safe =
        dest &&
        dest.startsWith("/admin") &&
        !dest.startsWith("/admin/login") &&
        !dest.includes("..")
          ? dest
          : "/admin";
      return NextResponse.redirect(new URL(safe, request.nextUrl.origin));
    }
    return supabaseResponse;
  }

  if (isAdminArea || isAdminApi) {
    if (!user) {
      const redirectUrl = new URL("/admin/login", request.nextUrl.origin);
      redirectUrl.searchParams.set(
        "redirect",
        path + (request.nextUrl.search || "")
      );
      return NextResponse.redirect(redirectUrl);
    }
    if (!isAdminUser(user)) {
      const denied = new URL("/admin/login", request.nextUrl.origin);
      denied.searchParams.set("error", "forbidden");
      return NextResponse.redirect(denied);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
