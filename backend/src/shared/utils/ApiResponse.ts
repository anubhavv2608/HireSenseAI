export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T | null;
  public readonly errors: unknown | null;

  constructor(success: boolean, message: string, data: T | null = null, errors: unknown | null = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static success<T>(message: string, data: T | null = null): ApiResponse<T> {
    return new ApiResponse(true, message, data, null);
  }

  static error(message: string, errors: unknown | null = null): ApiResponse<null> {
    return new ApiResponse(false, message, null, errors);
  }
}
