import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from '../gateway.controller';
import {
  AutocompleteResponseDTO,
  HotqueryResponseDTO,
  PopqueryResponseDTO,
  SpellerResponse,
} from '../dto/gateway.responses.dto';
import { PopqueryDTO } from '../dto/gateway.popquery.dto';
import { plainToClass } from 'class-transformer';
import { GatewayService } from '../gateway.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { GatewayModel } from '../gateway.model';
import { ConfigModule } from '@nestjs/config';
import { HotqueryDTO } from '../dto/gateway.hotquery.dto';
import { RecommendDTO } from '../dto/gateway.recommend.dto';
import { RelatedDTO } from '../dto/gateway.related.dto';
import { ThemeDTO } from '../dto/gateway.theme.dto';
import { SpellerModule } from '../speller/speller.module';
import { validationSchema } from '../../../config/validationSchema';
import { AutocompleteDTO } from '../dto/gateway.autocomplete.dto';
import { SpellerDTO } from '../dto/gateway.speller.dto';
import { SpellerService } from '../speller/speller.service';
import configuration from '../../../config/configuration';
import { SearchEngineModule } from '../../../src/search-engine/search-engine.module';

describe('GatewayController', () => {
  let controller: GatewayController;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [`./config/env/.test.env`],
          load: [configuration],
          isGlobal: true,
          validationSchema,
        }),
        SpellerModule,
        SearchEngineModule.register(),
      ],
      controllers: [GatewayController],
      providers: [GatewayService, GatewayModel, Logger],
    }).compile();

    controller = module.get<GatewayController>(GatewayController);
    const spellerService = module.get<SpellerService>(SpellerService);
    await spellerService.onModuleInit();
  });

  describe('popquery', () => {
    it('should return array of PopqueryResponseDTO', async () => {
      const dto = plainToClass(PopqueryDTO, { label: 'test' });
      const resultArray = await controller.popquery(dto);
      console.log(resultArray);
      resultArray.forEach((result) => {
        const resultInstance = plainToClass(PopqueryResponseDTO, result);
        expect(resultInstance).toBeInstanceOf(PopqueryResponseDTO);
      });
    });

    it('should return bad request error', async () => {
      const dto = plainToClass(PopqueryDTO, { label: 'label-not-exist' });
      await expect(async () => {
        await controller.popquery(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe('hotquery', () => {
    it('should return array of HotqueryResponseDTO', async () => {
      const dto = plainToClass(HotqueryDTO, { label: 'test' });
      const resultArray = await controller.hotquery(dto);
      resultArray.forEach((result) => {
        const resultInstance = plainToClass(HotqueryResponseDTO, result);
        expect(resultInstance).toBeInstanceOf(HotqueryResponseDTO);
      });
      // expect(result).toBeInstanceOf(Array<HotqueryResponseDTO>);
    });

    // it('should return empty array', async () => {
    //   const dto = plainToClass(HotqueryDTO, { label: 'empty' });
    //   const result = await controller.hotquery(dto);
    //   expect(result).toEqual([]);
    // });

    it('should return bad request error', async () => {
      const dto = plainToClass(HotqueryDTO, { label: 'label-not-exist' });
      await expect(async () => {
        await controller.hotquery(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe('recommend', () => {
    it('should return array of string', async () => {
      const dto = plainToClass(RecommendDTO, {
        label: 'test',
        keyword: '아이브릭스',
      });
      const resultArray = await controller.recommend(dto);
      expect(resultArray).toBeInstanceOf(Array);
      expect(
        resultArray.every((item) => typeof item === 'string'),
      ).toBeTruthy();
    });

    it.skip('should return empty array', async () => {
      const dto = plainToClass(RecommendDTO, {
        label: 'empty',
        keyword: 'any',
      });
      const result = await controller.recommend(dto);
      expect(result).toEqual([]);
    });

    it('should return bad request error', async () => {
      const dto = plainToClass(RecommendDTO, {
        label: 'label-not-exist',
        keyword: 'any',
      });
      await expect(async () => {
        await controller.recommend(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe.skip('related', () => {
    it('should return array of string', async () => {
      const dto = plainToClass(RelatedDTO, {
        label: 'test',
        keyword: '아이브릭스',
      });
      const resultArray = await controller.related(dto);
      expect(resultArray).toBeInstanceOf(Array);
      expect(
        resultArray.every((item) => typeof item === 'string'),
      ).toBeTruthy();
    });

    it('should return empty array', async () => {
      const dto = plainToClass(RelatedDTO, {
        label: 'test',
        keyword: 'no match',
      });
      const result = await controller.related(dto);
      expect(result).toEqual([]);
    });

    it('should return bad request error', async () => {
      const dto = plainToClass(RelatedDTO, {
        label: 'label-not-exist',
        keyword: 'any',
      });
      await expect(async () => {
        await controller.related(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe('theme', () => {
    it('should return string(comma seperated)', async () => {
      const dto = plainToClass(ThemeDTO, {
        label: 'test',
        keyword: '아이브릭스',
      });
      const result = await controller.theme(dto);
      expect(typeof result).toBe('string');
    });

    it('should return empty array', async () => {
      const dto = plainToClass(ThemeDTO, {
        label: 'test',
        keyword: 'no match',
      });
      const result = await controller.theme(dto);
      expect(result).toEqual([]);
    });

    it('should return bad request error', async () => {
      const dto = plainToClass(ThemeDTO, {
        label: 'label-not-exist',
        keyword: 'any',
      });
      await expect(async () => {
        await controller.theme(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe('autocomplete', () => {
    it('should return array of AutocompleteResponseDTO', async () => {
      const dto = plainToClass(AutocompleteDTO, {
        label: 'test',
        keyword: '아',
      });
      const resultArray = await controller.autocomplete(dto);
      // expect(result).toBeInstanceOf(Array<AutocompleteResponseDTO>);
      resultArray.forEach((result) => {
        const resultInstance = plainToClass(AutocompleteResponseDTO, result);
        expect(resultInstance).toBeInstanceOf(AutocompleteResponseDTO);
      });
    });

    it('should return empty array', async () => {
      const dto = plainToClass(AutocompleteDTO, {
        label: 'test',
        keyword: 'no match',
      });
      const result = await controller.autocomplete(dto);
      expect(result).toEqual([]);
    });

    it('should return bad request error', async () => {
      const dto = plainToClass(AutocompleteDTO, {
        label: 'label-not-exist',
        keyword: '아',
      });
      await expect(async () => {
        await controller.autocomplete(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe('speller', () => {
    it('should return json', async () => {
      const dto = plainToClass(SpellerDTO, {
        label: 'test',
        query: '이이브릭스',
      });
      const result = await controller.speller(dto);
      expect(result).toMatchObject(new SpellerResponse());
      expect(result.correction).toBe('아이브릭스');
    });

    it('should return same keyword when keyword not exist', async () => {
      const query = '존재하지않는키워드';
      const dto = plainToClass(SpellerDTO, {
        label: 'test',
        query,
      });
      const result = await controller.speller(dto);
      expect(result).toMatchObject(new SpellerResponse());
      expect(result.correction).toEqual(query);
    });

    it.skip('should return bad request error', async () => {
      const dto = plainToClass(SpellerDTO, {
        label: 'label-not-exist',
        query: '아',
      });
      await expect(async () => {
        await controller.speller(dto);
      }).rejects.toThrow(BadRequestException);
    });
  });
});
