import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { UserNotFoundError, InvalidPasswordError } from "@/lib/errors";
import { errorHandler } from "@/lib/errorHandler";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) {
      throw UserNotFoundError();
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw InvalidPasswordError();
    }

    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(SECRET_KEY);

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `token=${token}; HttpOnly; Max-Age=3600; Path=/`,
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}
