import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  LoggerService,
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

@Controller('gateway')
@ApiTags('gateway')
export class GatewayController {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
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
    const { label } = dto;
    return await this.gatewayService.popquery(label);
  }

  @Get('/hotquery')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: Responses.HotqueryResponseDTO,
    isArray: true,
  })
  async hotquery(@Query() dto: HotqueryDTO) {
    const { label } = dto;
    return await this.gatewayService.hotquery(label);
  }

  @Get('/recommend')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
    isArray: true,
  })
  async recommend(@Query() dto: RecommendDTO) {
    const { label, keyword } = dto;
    return await this.gatewayService.recommend(label, keyword);
  }

  @Get('/related')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
    isArray: true,
  })
  async related(@Query() dto: RelatedDTO) {
    const { label, keyword } = dto;
    return await this.gatewayService.related(label, keyword);
  }

  @Get('/theme')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
    isArray: false,
  })
  async theme(@Query() dto: ThemeDTO) {
    const { label, keyword } = dto;
    return await this.gatewayService.theme(label, keyword);
  }

  @Get('/autocomplete')
  @ApiResponse({
    status: 200,
    description: 'success',
    type: Responses.AutocompleteResponseDTO,
    isArray: true,
  })
  async autocomplete(@Query() dto: AutocompleteDTO) {
    const { label, keyword, middle, reverse, size, sort } = dto;
    return await this.gatewayService.autocomplete(
      label,
      keyword,
      middle,
      reverse,
      size,
      sort,
    );
  }

  @Get('/speller')
  @ApiResponse({
    status: 200,
    description: 'success',
    // type: Responses.Speller,
    // isArray: true,
  })
  async speller(@Query() dto: SpellerDTO) {
    const { label, query, distance, eng2kor, overflow } = dto;
    return await this.gatewayService.speller(
      label,
      query,
      distance,
      eng2kor,
      overflow,
    );
  }

  @Post('querylog')
  @ApiResponse({
    status: 200,
    description: 'success',
  })
  async querylog(@Body() dto: QuerylogDTO) {
    const { index, query, total, took } = dto;
    return await this.gatewayService.querylog(index, query, total, took);
  }
}
