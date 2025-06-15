import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from '../search.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../config/configuration';
import { validationSchema } from '../../../config/validationSchema';
import { SearchService } from '../search.service';
import { SearchModel } from '../search.model';
import { GatewayModule } from '../../gateway/gateway.module';
import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { SimpleSearchDTO } from '../dto/simple-search.dto';
import { ResponseCommonDTO } from '../dto/response.common.dto';
import { SearchEngineModule } from '../../../src/search-engine/search-engine.module';

describe('SearchController', () => {
  let controller: SearchController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [`./config/env/.test.env`],
          load: [configuration],
          isGlobal: true,
          validationSchema,
        }),
        SearchEngineModule.register(),
        GatewayModule,
      ],
      controllers: [SearchController],
      providers: [SearchService, SearchModel, Logger],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  describe('/search/simple', () => {
    it('should return ResponseCommonDTO', async () => {
      const dto = plainToClass(SimpleSearchDTO, {
        keyword: '주식',
      });
      const resultJson = await controller.simpleSearch(dto);
      const resultInstance = plainToClass(ResponseCommonDTO, resultJson);
      expect(resultInstance).toBeInstanceOf(ResponseCommonDTO);
      const resultBody = resultJson.body;
      expect(resultBody.every((result) => typeof result === 'object'));
    });
  });
});
