import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  const isAdminRoute = path.startsWith("/admin")
  const isAdminLogin = path === "/admin/login"
  const isAdminApi = path.startsWith("/api/admin")

  if ((isAdminRoute || isAdminApi) && !isAdminLogin && !session) {
    const redirectUrl = new URL("/admin/login", req.nextUrl.origin)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAdminLogin && session) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin))
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}

