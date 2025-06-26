import { IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CalculateFibonacciDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Index must be an integer' })
  @Min(0, { message: 'Index must be at least 0' })
  @Max(1000, { message: 'Index must not exceed 1000 for performance reasons' })
  index: number;
}
