import { Controller, Get, Inject } from '@nestjs/common';
import { WinstonLoggerService } from './utils/logger/winston.service';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(Logger) private readonly logger: WinstonLoggerService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('hahahahaha');
    this.logger.debug('this is debug log!!');

    return this.appService.getHello();
  }
}
