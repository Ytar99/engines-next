// pages/api/auth/logout.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const response = NextResponse.json({ message: "Logout successful" });

  response.cookies.set("token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
