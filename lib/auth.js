import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyToken(token = "") {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error }; // Возврат ошибки для дальнейшей обработки
  }
}
