export type PaginationParams = {
  page?: number;
  limit?: number;
};

export interface SearchParams {
  search?: string;
  filters?: {
    [key: string]: string | number | boolean;
  };
}

export type QueryParams = PaginationParams & SearchParams & {
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
