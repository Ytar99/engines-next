import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routes } from "@/lib/constants/routes";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const session = await getToken({ req: request });

  const userRole = session?.user?.role || null;
  const allowedRoles = routes.find((r) => path?.startsWith(r?.path))?.allowedRoles || null;

  const isAllowed = !allowedRoles || (!!allowedRoles && allowedRoles.includes(userRole)) || false;

  if (!isAllowed) {
    if (path.includes("/api")) {
      return NextResponse.json({ error: "AccessDenied" }, { status: 403 });
    }

    if (userRole) {
      // return redirectWithError(request, "AccessDenied", "/crm/dashboard");
      return redirectWithError(request, "AccessDenied", "/crm/access-denied");
    }

    return redirectWithError(request, "AccessDenied");
  }

  // if (path === "/") {
  //   return NextResponse.redirect(new URL("/catalog", request.url));
  // }

  if (path.startsWith("/crm") && !path.includes("/login")) {
    if (!session) {
      return redirectWithError(request, "SessionExpired");
    }
  }

  return NextResponse.next();
}

function redirectWithError(req, errorType, url = "/crm/login") {
  const redirectUrl = new URL(url, req.url);
  redirectUrl.searchParams.set("error", errorType);
  return NextResponse.redirect(redirectUrl);
}
