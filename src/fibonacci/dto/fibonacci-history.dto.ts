import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pageination.dto';

export class FibonacciHistoryDto extends PaginationDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  fromCache?: boolean;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  minN?: number;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  maxN?: number;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  userId?: number;
}
