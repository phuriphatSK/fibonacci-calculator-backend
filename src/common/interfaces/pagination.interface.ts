export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IPaginatedResult<T> {
  data: T[];
  meta: IPaginationMeta;
}
