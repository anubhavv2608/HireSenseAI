export interface FieldError {
  field: string;
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: FieldError[] | string | null;
}
