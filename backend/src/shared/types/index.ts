export type Role = 'student' | 'admin' | 'super_admin';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
