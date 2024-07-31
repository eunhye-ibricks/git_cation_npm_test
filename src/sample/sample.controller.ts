import {
  Controller,
  Get,
  Inject,
  Logger,
  LoggerService,
  Query,
} from '@nestjs/common';
import { FunctionScoreService } from './sample.service';
import { ResponseCommonDTO } from './dto/response.sample.dto';
import { FunctionScoreSearchDTO } from './dto/sample-search.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('sample')
@ApiTags('sample')
export class FunctionScoreController {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly functionScoreService: FunctionScoreService,
  ) {}

  @Get('/function')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async functionScoreSearch(
    @Query() functionScoreSearchDTO: FunctionScoreSearchDTO,
  ): Promise<ResponseCommonDTO> {
    return await this.functionScoreService.sampleFunctionScoreSearch(
      functionScoreSearchDTO,
    );
  }
}
