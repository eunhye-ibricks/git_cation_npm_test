import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class PopqueryDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;
}
