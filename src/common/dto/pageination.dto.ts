import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsPositive({ message: 'Page must be a positive number' })
  page?: number = 1;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsPositive({ message: 'Limit must be a positive number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;
}
