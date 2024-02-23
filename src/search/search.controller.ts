import {
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  LoggerService,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseCommonDTO } from './dto/response.common.dto';

@Controller('search')
@ApiTags('search')
export class SearchController {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  getHello(): string {
    throw new HttpException('getHello failed', 444);
    return 'hello';
  }

  @Get('/simple')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async simpleSearch(@Query() dto: SimpleSearchDTO) {
    const { keyword, size, from } = dto;
    return await this.searchService.simpleSearch(keyword, size, from);
  }
}
