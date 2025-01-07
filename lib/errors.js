export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const UserNotFoundError = () => new ApiError("Пользователь не найден", 404);
export const InvalidPasswordError = () => new ApiError("Неверный пароль", 401);
export const JWTVerificationError = (error) => new ApiError("Authentication failed: " + error, 401);
