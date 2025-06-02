import path from "path";
import prisma from "@/lib/prisma";

export function getDatabasePath() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl?.startsWith("file:")) {
    throw new Error("Unsupported database URL format");
  }

  const relativePath = dbUrl.replace("file:", "").trim();

  // Определяем базовую директорию как папку 'prisma' в корне проекта
  const baseDir = path.resolve(process.cwd(), "prisma");

  return path.resolve(baseDir, relativePath);
}

export async function closeDatabaseConnections() {
  await prisma.$disconnect();
}
