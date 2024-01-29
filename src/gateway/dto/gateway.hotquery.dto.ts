import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class HotqueryDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;
}
