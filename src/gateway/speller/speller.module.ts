import { Logger, Module } from '@nestjs/common';
import { SpellerService } from './speller.service';
import { SpellerModel } from './speller.model';
import { EsModule } from '../../elasticsearch-module/elasticsearch-module';

@Module({
  imports: [EsModule],
  controllers: [],
  providers: [Logger, SpellerModel, SpellerService],
  exports: [SpellerService],
})
export class SpellerModule {}
