export type PaginationParams = {
  page?: number;
  limit?: number;
};


export type QueryParams = PaginationParams & {
  take?: number;
  skip?: number;
  where?: Record<string, string | number | boolean | object | null>;
  include?: Record<string, string | number | boolean | object | null>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  limitFields?: string[];
  status?: string[];
}

export type PaginatedResponse<T> = {
  data: T;
  metadata: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
