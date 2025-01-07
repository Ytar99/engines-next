import { ApiError } from "@/lib/errors";

export async function errorHandler(err) {
  if (err instanceof ApiError) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: err.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Internal Server Error" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
