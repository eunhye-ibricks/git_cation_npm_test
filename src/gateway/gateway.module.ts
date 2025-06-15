import { Logger, Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { GatewayModel } from './gateway.model';
import { SpellerModule } from './speller/speller.module';

@Module({
  imports: [SpellerModule],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayModel, Logger],
  exports: [GatewayService],
})
export class GatewayModule {}
