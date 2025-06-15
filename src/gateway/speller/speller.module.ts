import { Logger, Module } from '@nestjs/common';
import { SpellerService } from './speller.service';
import { SpellerModel } from './speller.model';

@Module({
  imports: [],
  controllers: [],
  providers: [Logger, SpellerModel, SpellerService],
  exports: [SpellerService],
})
export class SpellerModule {}
