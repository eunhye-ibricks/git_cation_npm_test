import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('API Template')
  .setDescription('API Template description')
  .setVersion('1.0')
  // .addTag('cats')
  .build();
