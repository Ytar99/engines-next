import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const session = await getToken({ req: request });

  // if (path === "/") {
  //   return NextResponse.redirect(new URL("/catalog", request.url));
  // }

  if (path.startsWith("/crm") && !path.includes("/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/crm/login", request.url));
    }
  }

  return NextResponse.next();
}
