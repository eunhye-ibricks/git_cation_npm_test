import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { SpellerModel } from './speller.model';
import { EditDistance } from './editdistance';
import hangul from './hangul';
import _moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@elastic/elasticsearch';
import {
  ConnectionError,
  ElasticsearchClientError,
  ResponseError,
} from '@elastic/elasticsearch/lib/errors';
import { WinstonLoggerService } from 'src/utils/logger/winston.service';

@Injectable()
export class SpellerService implements OnModuleInit {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly spellerModel: SpellerModel,
  ) {}
  private speller: any = {};
  private static running = false;

  async onModuleInit() {
    await this.runUpdate();
  }

  @Cron('*/5 * * * * *')
  async runUpdate() {
    if (SpellerService.running === true) {
      return;
    }

    SpellerService.running = true;

    await this.update();
    SpellerService.running = false;
  }

  async update() {
    try {
      const { esResult } = await this.spellerModel.getSpellerLabel();

      if (esResult.body.hits.hits.length === 0) {
        return;
      }

      esResult.body.hits.hits.forEach(async (hit: any) => {
        const label: string = hit._source.speller.label;

        if (!this.speller.hasOwnProperty(label)) {
          this.speller[label] = {
            ed: new EditDistance(),
            typo: {},
            timestamp: 0,
            total: 0,
          };
        }
        await this.checkTimestamp(label);
      });
    } catch (error) {
      if (error instanceof ElasticsearchClientError) {
        return this.handleEsError(error);
      }

      this.logger.error(error);
    }
  }

  async correct(
    label: string,
    word: string,
    eng2kor: boolean,
    distance: number,
    overflow: boolean,
  ): Promise<any[]> {
    if (this.speller[label] === undefined) {
      throw new BadRequestException('해당 label이 존재하지 않습니다.');
    }

    const typo = this.speller[label].typo[word];
    if (this.speller[label].typo[word] !== undefined) {
      return [
        {
          cost: 0,
          value: typo,
        },
      ];
    }

    // edit-distance
    const jaso = hangul.decompose(word).join('');
    let results = this.speller[label].ed.lookup(jaso, distance);

    if (results.length > 0) {
      if (overflow === false) {
        results = results.filter(
          (item: any) => word.length >= item.value.word.length,
        );
      }

      // sort by cost and weight
      return results.sort((a: any, b: any) => {
        if (a.cost === b.cost) {
          return a.value.weight > b.value.weight
            ? -1
            : a.value.weight < b.value.weight
            ? 1
            : a.value.word > b.value.word
            ? 1
            : -1;
        } else {
          return a.cost > b.cost ? 1 : a.cost < b.cost ? -1 : 0;
        }
      });
    } else {
      // auto convert : english to hangul
      let autoconv;
      if (eng2kor === true) {
        autoconv = hangul.english_to_hangul(word).join('');
      } else {
        autoconv = word;
      }

      if (autoconv.length > 0 && autoconv !== word) {
        return [
          {
            cost: 0,
            value: {
              word: autoconv,
              weight: 0,
            },
          },
        ];
      }
    }
    return [];
  }

  private async checkTimestamp(label: string) {
    const { esResult } = await this.spellerModel.getSpellerTimestamp(label);
    const total = esResult.body.hits.total.value;

    if (total === 0) {
      return;
    }
    const hit = esResult.body.hits.hits[0]._source;
    const timestamp = _moment(hit.timestamp);

    if (
      this.speller[label].timestamp === 0 ||
      this.speller[label].timestamp < timestamp.valueOf() ||
      this.speller[label].total != total
    ) {
      this.logger.log(`loading speller dictionary [${label}]...`);
      await this.load(label, {
        ed: new EditDistance(),
        typo: {},
        timestamp: timestamp.valueOf(),
        total: total,
      });
    }
    return;
  }

  private async load(label: string, newinstance: any) {
    try {
      const { esResult } = await this.spellerModel.getSpellerData(label, null);
      this.insert(esResult, label, newinstance);

      let count = esResult.body.hits.hits.length;
      const scrollId: string = esResult.body._scroll_id;

      while (count > 0) {
        const scrollResult = (
          await this.spellerModel.getSpellerData(label, scrollId)
        ).esResult;

        count = scrollResult.body.hits.hits.length;

        if (count === 0) break;

        this.insert(esResult, label, newinstance);
      }
      this.done(label, newinstance);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async insert(esResult: ApiResponse, label: string, newinstance: any) {
    esResult.body.hits.hits.forEach((hit: any) => {
      const jaso = hangul.decompose(hit._source.keyword).join('');

      newinstance.ed.insert(jaso, {
        word: hit._source.keyword,
        weight: hit._source.weight * 1,
      });

      const engjaso = hangul.jaso_to_english(jaso).join('');
      if (engjaso !== jaso) {
        newinstance.ed.insert(engjaso, {
          word: hit._source.keyword,
          weight: hit._source.weight * 1,
        });
      }

      hit._source.typo.forEach(function (typo: string) {
        newinstance.typo[typo] = {
          word: hit._source.keyword,
          weight: 0,
        };
      });
    });
  }

  private done(label: string, newinstance: any) {
    this.speller[label].ed = newinstance.ed;
    this.speller[label].typo = newinstance.typo;
    this.speller[label].timestamp = newinstance.timestamp;
    this.speller[label].total = newinstance.total;

    this.logger.log(
      `speller dictionary [${label}] update completed / total: ${this.speller[label].total}`,
    );
  }

  private handleEsError(error: ElasticsearchClientError): void {
    if (error instanceof ConnectionError) {
      this.logger.debug('Speller - Elasticsearch Connection failed');
    } else if (
      error instanceof ResponseError &&
      error.message === 'index_not_found_exception'
    ) {
      this.logger.debug('no speller index');
      return;
    }
  }
}
