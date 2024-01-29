import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecommendDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;
}
