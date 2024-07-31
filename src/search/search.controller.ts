import { Controller, Get, Inject, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseCommonDTO } from './dto/response.common.dto';
import { WinstonLoggerService } from '../utils/logger/winston.service';

@Controller('search')
@ApiTags('search')
export class SearchController {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly searchService: SearchService,
  ) {}

  @Get('/simple')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async simpleSearch(
    @Query() dto: SimpleSearchDTO,
  ): Promise<ResponseCommonDTO> {
    const { keyword, size, from } = dto;
    return await this.searchService.simpleSearch(keyword, size, from);
  }
}
