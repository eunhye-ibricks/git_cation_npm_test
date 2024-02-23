import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SimpleSearchDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Max(100)
  @Min(0)
  readonly size?: number = 10;

  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Min(0)
  readonly from?: number = 0;

  @Transform((params) => params.value.trim())
  @IsIn(['hour', 'day', 'week', 'month'])
  readonly period?: string;

  @Transform((params) => params.value.trim())
  @IsIn(['hour', 'day', 'week', 'month'])
  readonly category?: string;
}
