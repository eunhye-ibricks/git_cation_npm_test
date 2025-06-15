import { Module, Logger } from '@nestjs/common';
import { FunctionScoreController } from './sample.controller';
import { FunctionScoreService } from './sample.service';
import { GatewayModule } from 'src/gateway/gateway.module';
import { SampleModel } from './sample.model';

@Module({
  imports: [GatewayModule],
  controllers: [FunctionScoreController],
  providers: [FunctionScoreService, Logger, SampleModel],
  exports: [FunctionScoreService],
})
export class SampleModule {}
