import { NextRequest, NextResponse } from "next/server";
import { cookieName, urlBase } from "./lib/utils/constantes";

export function middleware(req: NextRequest) {
  const session = req.cookies.get(cookieName);
  const isAuthPage = ["/auth"].includes(
    req.nextUrl.pathname
  );
  const isProtectedPage = req.nextUrl.pathname.startsWith("/home")

  if (!session && isProtectedPage) {
    return NextResponse.redirect(new URL(`${urlBase}/auth`, req.url));
  }
  if (session && isAuthPage) {
      return NextResponse.redirect(new URL(`${urlBase}/home`, req.url));
  }
 
  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/home/:path*", "/auth"],
};

