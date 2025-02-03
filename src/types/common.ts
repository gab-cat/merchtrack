export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type QueryParams = PaginationParams & {
  limitFields?: string[];
};

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
