import {
  PaginationMeta,
  PaginatedResult,
} from '../interfaces/pagination.interface';

export class PaginationUtil {
  static createMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  static createLinks(
    baseUrl: string,
    page: number,
    limit: number,
    total: number,
    queryParams?: Record<string, any>,
  ) {
    const totalPages = Math.ceil(total / limit);
    const buildUrl = (pageNum: number) => {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...queryParams,
      });
      return `${baseUrl}?${params.toString()}`;
    };

    return {
      first: buildUrl(1),
      previous: page > 1 ? buildUrl(page - 1) : undefined,
      next: page < totalPages ? buildUrl(page + 1) : undefined,
      last: buildUrl(totalPages),
    };
  }

  static createResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    baseUrl?: string,
    queryParams?: Record<string, any>,
  ): PaginatedResult<T> {
    const meta = this.createMeta(page, limit, total);
    const result: PaginatedResult<T> = { data, meta };

    if (baseUrl) {
      result.links = this.createLinks(baseUrl, page, limit, total, queryParams);
    }

    return result;
  }
}
