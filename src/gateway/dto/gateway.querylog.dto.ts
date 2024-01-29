import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class QuerylogDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly index: string;

  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly query: string;

  @IsNotEmpty()
  @IsInt()
  readonly total: number;

  @IsNotEmpty()
  @IsInt()
  readonly took: number;
}
