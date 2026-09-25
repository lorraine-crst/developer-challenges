export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly params?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}