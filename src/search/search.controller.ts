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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseCommonDTO } from './dto/response.common.dto';

@Controller('search')
@ApiTags('search')
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

  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  @Get('/simple')
  async simpleSearch(@Query() dto: SimpleSearchDTO) {
    const { keyword, size, from } = dto;
    return await this.searchService.simpleSearch(keyword, size, from);
  }
}
