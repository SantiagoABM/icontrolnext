import { NextRequest, NextResponse } from "next/server";
import { cookieName } from "./lib/utils/constantes";

export async function middleware(req: NextRequest) {
  const session = req.cookies.get(cookieName);
  const { pathname } = req.nextUrl;

  // Rutas públicas (accesibles sin autenticación)
  const publicRoutes = ["/auth", "/recuperar-password", "/politicas"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Rutas protegidas
  const protectedRoutes = ["/home", "/reportes", "/usuarios", "/bitacora"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Si no hay sesión y está intentando acceder a ruta protegida
  if (!session && isProtectedRoute) {
    const url = new URL("/auth", req.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Si tiene sesión y está en ruta pública (excepto logout)
  if (session && isPublicRoute && !pathname.includes("logout")) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Opcional: validar que el token no esté expirado
  // if (session) {
  //   try {
  //     const decoded = jwt.verify(session.value, process.env.JWT_SECRET!);
  //     // Token válido, continuar
  //   } catch (error) {
  //     // Token inválido, eliminar cookie y redirigir
  //     const response = NextResponse.redirect(new URL("/auth", req.url));
  //     response.cookies.delete(cookieName);
  //     return response;
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};