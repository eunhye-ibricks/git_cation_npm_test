import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  LoggerService,
  Query,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ElasticsearchExceptionFilter } from '../utils/filter/elasticsearch-exception.filter';

@Controller('search')
@UseFilters(ElasticsearchExceptionFilter)
export class SearchController {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('hahahahaha');
    this.logger.debug('this is debug log!!');
    throw new HttpException('getHello failed', 444);
    return 'hello';
  }

  @Get('/simple')
  async simpleSearch(@Body() dto: SimpleSearchDTO) {
    const { keyword, size, from } = dto;
    return await this.searchService.simpleSearch(keyword, size, from);
  }
}
