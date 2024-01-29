import { Logger, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SpellerService } from './speller.service';
import { SpellerModel } from './speller.model';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) =>
        configService.get('elasticsearch'),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [Logger, SpellerModel, SpellerService],
  exports: [SpellerService],
})
export class SpellerModule {}
