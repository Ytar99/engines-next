import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getMe(token = "") {
  const { error, payload, valid } = await verifyToken(token);

  if (!valid) {
    return null;
  }

  const me = await prisma.user.findUnique({
    select: { id: true, role: true, email: true, firstname: true, lastname: true, phone: true },
    where: { id: payload?.id },
  });

  return me;
}

export async function getMeFromCookies(cookieStore) {
  if (!cookieStore) {
    return null;
  }

  const token = cookieStore.get("token");
  const me = await getMe(token?.value);

  return me;
}
