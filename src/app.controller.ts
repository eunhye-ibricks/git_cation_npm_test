import { Controller, Get, Inject, LoggerService } from '@nestjs/common';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('hahahahaha');
    this.logger.debug('this is debug log!!');
    return this.appService.getHello();
  }
}
