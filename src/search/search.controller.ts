import { Controller, Get, Inject, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ThesisSearchDTO } from './dto/thesis-search.dto';
import { PolicyNewsSearchDTO } from './dto/policy-news-search.dto';
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

  @Get('/integrated')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async integratedSearch(
    @Query() dto: SimpleSearchDTO,
  ): Promise<ResponseCommonDTO> {
    return await this.searchService.integratedSearch(dto);
  }

  @Get('/thesis')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async thesisSearch(
    @Query() dto: ThesisSearchDTO,
  ): Promise<ResponseCommonDTO> {
    return await this.searchService.thesisSearch(dto);
  }

  @Get('/stock')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async stockSearch(@Query() dto: SimpleSearchDTO): Promise<ResponseCommonDTO> {
    return await this.searchService.stockSearch(dto);
  }

  @Get('/policy-news')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async policyNewsSearch(
    @Query() dto: PolicyNewsSearchDTO,
  ): Promise<ResponseCommonDTO> {
    return await this.searchService.policyNewsSearch(dto);
  }
}
