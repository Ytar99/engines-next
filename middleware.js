import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth"; // Импортируйте вашу функцию проверки токена

const LOGIN_URL = "/admin/login";
const CRM_URL = "/admin/crm";

export async function middleware(request) {
  const token = request.cookies.get("token");
  const isLoginPage = request.nextUrl.pathname.startsWith(LOGIN_URL);

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/catalog", request.url));
  }

  // Если токен отсутствует
  if (!token) {
    if (isLoginPage) {
      return NextResponse.next(); // Продолжить, если это страница логина
    }
    return NextResponse.redirect(new URL(LOGIN_URL, request.url)); // Перенаправление
  }

  const { valid, payload, error } = await verifyToken(token?.value);

  if (!valid) {
    console.error("JWT Verification Error:", error); // Логирование ошибки
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  // Если пользователь уже в системе и пытается попасть на страницу логина
  if (isLoginPage) {
    return NextResponse.redirect(new URL(CRM_URL, request.url)); // Перенаправление в CRM
  }

  // Если токен валиден, продолжаем
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/crm/:path*", "/admin/login/:path*"],
};
