import { NextResponse } from "next/server";

const { verifyToken } = require("@/lib/auth");

const LOGIN_URL = "/admin/login";
const CRM_URL = "/admin/crm";

export async function GET(request) {
  const token = request.cookies.get("token");
  const { error, payload, valid } = verifyToken(token?.value);

  if (error) {
    throw new Error("JWT Verification Error: " + error);
  }

  if (valid) {
    return NextResponse.redirect(new URL(CRM_URL, request.url));
  }

  return NextResponse.redirect(new URL(LOGIN_URL, request.url));
}
