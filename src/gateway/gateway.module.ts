import { Logger, Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { GatewayModel } from './gateway.model';
import { SpellerModule } from './speller/speller.module';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const esConfig = configService.get('elasticsearch');
        if (!esConfig) {
          throw new Error('elasticsearch configuration not found!!!');
        }
        return esConfig;
      },
      inject: [ConfigService],
    }),
    SpellerModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayModel, Logger],
  exports: [GatewayService],
})
export class GatewayModule {}
