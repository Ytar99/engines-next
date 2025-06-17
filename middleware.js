import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routes } from "@/lib/constants/routes";

const ERROR_TYPES = {
  403: "AccessDenied",
  401: "SessionExpired",
};

export async function middleware(request) {
  const { url } = request;
  const path = new URL(url).pathname;

  let session;
  try {
    session = await getToken({ req: request });
  } catch (error) {
    console.error("Error getting session:", error);
  }

  let response;

  const userRole = session?.user?.role || null;
  const routeConfig = routes.find((r) => path?.startsWith(r?.path));
  const allowedRoles = routeConfig?.allowedRoles || null;

  const isAllowed = !allowedRoles || (!!allowedRoles && allowedRoles.includes(userRole)) || false;

  if (!isAllowed) {
    if (path.includes("/api")) {
      response = NextResponse.json({ error: "AccessDenied" }, { status: 403 });
      sendLog({ request, status: 403, session });
    } else if (userRole) {
      response = redirectWithError({ request, error: 403, url: "/crm/dashboard" });
      sendLog({ request, status: 403, session });
    } else {
      response = redirectWithError({ request, error: 403, url: "/crm/access-denied" });
      sendLog({ request, status: 403, session });
    }
  } else {
    if (path.startsWith("/crm") && !path.includes("/login") && !path.includes("/access-denied")) {
      if (!session) {
        response = redirectWithError({ request, error: 401 });
        sendLog({ request, status: 401, session });
      }
    }

    if (!response) {
      response = NextResponse.next();
      sendLog({ request, status: response.status, session });
    }
  }

  return response;
}

function sendLog({ request, status, session }) {
  try {
    const start = Date.now();
    const { method, url, headers } = request;
    const path = new URL(url).pathname;
    const ip = headers.get("x-real-ip") || headers.get("x-forwarded-for") || request.ip || "unknown";
    const userAgent = headers.get("user-agent") || "";

    const duration = Date.now() - start;

    const auditLog = {
      method,
      path,
      status: status || 500,
      time: start,
      duration,
      ip,
      userAgent,
      user: session?.user || null,
      error: ERROR_TYPES[status] || null,
      access: status === 403 ? "DENIED" : status === 401 ? "SESSION_EXPIRED" : "GRANTED",
    };

    if (
      !["/_next/static/chunks", "/api/crm/audit/logs", "/_next/static", "/api/auth/session", "/favicon.ico"].some(
        (route) => path.includes(route)
      )
    ) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const logUrl = `${baseUrl}/api/crm/audit/logs`;

      // Отправляем запрос, но не ждем ответа
      fetch(logUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Log-Secret": process.env.LOG_SECRET || "default-secret",
        },
        body: JSON.stringify(auditLog),
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Error sending audit log:", e);
  }
}

function redirectWithError({ request, error, url = "/crm/login" }) {
  const redirectUrl = new URL(url, request.url);
  redirectUrl.searchParams.set("error", ERROR_TYPES[error]);
  const response = NextResponse.redirect(redirectUrl);
  return response;
}
