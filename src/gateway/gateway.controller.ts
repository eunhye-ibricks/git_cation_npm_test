import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { PopqueryDTO } from './dto/gateway.popquery.dto';
import * as Responses from './dto/gateway.responses.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HotqueryDTO } from './dto/gateway.hotquery.dto';
import { RecommendDTO } from './dto/gateway.recommend.dto';
import { RelatedDTO } from './dto/gateway.related.dto';
import { AutocompleteDTO } from './dto/gateway.autocomplete.dto';
import { ThemeDTO } from './dto/gateway.theme.dto';
import { SpellerDTO } from './dto/gateway.speller.dto';
import { QuerylogDTO } from './dto/gateway.querylog.dto';
import { WinstonLoggerService } from '../utils/logger/winston.service';

@Controller('gateway')
@ApiTags('gateway')
export class GatewayController {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly gatewayService: GatewayService,
  ) {}

  @Get('/popquery')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: Responses.PopqueryResponseDTO,
    isArray: true,
  })
  async popquery(@Query() dto: PopqueryDTO) {
    return await this.gatewayService.popquery(dto);
  }

  @Get('/hotquery')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: Responses.HotqueryResponseDTO,
    isArray: true,
  })
  async hotquery(@Query() dto: HotqueryDTO) {
    return await this.gatewayService.hotquery(dto);
  }

  @Get('/recommend')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
    isArray: true,
  })
  async recommend(@Query() dto: RecommendDTO) {
    return await this.gatewayService.recommend(dto);
  }

  @Get('/related')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
    isArray: true,
  })
  async related(@Query() dto: RelatedDTO) {
    return await this.gatewayService.related(dto);
  }

  @Get('/theme')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
    isArray: false,
  })
  async theme(@Query() dto: ThemeDTO) {
    return await this.gatewayService.theme(dto);
  }

  @Get('/autocomplete')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: Responses.AutocompleteResponseDTO,
    isArray: true,
  })
  async autocomplete(@Query() dto: AutocompleteDTO) {
    return await this.gatewayService.autocomplete(dto);
  }

  @Get('/speller')
  @ApiResponse({
    status: 200,
    description: 'success',
    // type: Responses.Speller,
    // isArray: true,
  })
  async speller(@Query() dto: SpellerDTO) {
    return await this.gatewayService.speller(dto);
  }

  @Post('querylog')
  @ApiResponse({
    status: 200,
    description: 'success',
  })
  async querylog(@Body() dto: QuerylogDTO) {
    return await this.gatewayService.querylog(dto);
  }
}
