import { verifyToken } from "@/lib/auth";
import { JWTVerificationError, UserNotFoundError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const token = request.cookies.get("token");
  const { error, payload, valid } = await verifyToken(token?.value);

  if (!valid) {
    throw JWTVerificationError(error);
  }

  const user = await prisma.user.findUnique({ where: { id: payload?.id } });

  if (!user) {
    throw UserNotFoundError();
  }

  // const users = await prisma.user.findMany();
  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    firstname: user?.firstname || null,
    lastname: user?.lastname || null,
    phone: user?.phone || null,
  });
}
