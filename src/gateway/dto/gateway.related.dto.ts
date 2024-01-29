import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RelatedDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;
}
