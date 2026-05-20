import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const { createServerClient } = await import("@supabase/ssr");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
