# 실행 환경

# 목차

[1. 설정](#1-설정)

[2. 실행](#2-실행)

[3. 디렉터리 구조](#3-디렉터리-구조)

[4. 요청 및 응답 처리 과정](#4-요청-및-응답-처리-과정)

[5. 에러 처리](#5-에러-처리)

[6. 로깅](#6-로깅)

[7. Swagger](#7-swagger)

[8. gateway](#8-gateway)

[9. 디버깅](#9-디버깅)

# 1. 설정

Node.js 버전: v16.20.2(.nvmrc 파일 확인)

## VS Code 설정

1. EsLint, Prettier 플러그인 설치

2. Workspace setting 설정

- "Default Formatter" -> "prettier"
- "Format on save" 체크

## 환경변수 설정

config/env 경로의 .sample.env 파일을 참고하여 환경변수 파일 생성

- 환경변수는 아래 3가지 이름으로 설정 가능
- NODE_ENV 값에 따라 아래 환경변수 중 하나를 자동으로 확인

```jsx
.test.env         // NODE_ENV = test
.development.env  // NODE_ENV = development
.production.env   // NODE_ENV = production
```

기타 logger 및 검색엔진 설정은 config.json 파일에서

```jsx
// config/config.json
{
  "search-engine": {
    "maxRetries": 3,
    "requestTimeout": 30000,
    "pingTimeout": 3000
  },
  "logger": {
    "debug": false,
    "console": true,
    "log": {
      "maxFiles": 30,
      "maxSize": "100m"
    }
  }
}
```

# 2. 실행

실행은 모듈 내부 pm2 또는 전역 pm2 로 실행

## 2-1. 실행 방법 1: 모듈 내부 PM2

실행 스크립트를 통해 실행

```jsx
./server start dev    // NODE_ENV = development
./server start prod   // NODE_ENV = production

./server list         // 실행 확인
./server log          // 로그 확인
```

## 2-2. 실행 방법 2: 전역 PM2

pm2가 설치되어 있다면

```jsx
npm run start:dev   // NODE_ENV = development
npm run start:prod  // NODE_ENV = production

----------------------------------------------------------------------

// package.json
{
  ...
  "scripts": {
    // ...
    "start:dev": "nest build && cd ./bin && pm2 start ecosystem.config.json --env development",
    "start:prod": "nest build && cd ./bin && pm2 start ecosystem.config.json --env production",
    ...
  },
```

# 3. 디렉터리 구조

```jsx

├─ecosystem.config.json      // PM2 설정파일
├─server.sh                  // 실행 스크립트 (내장 PM2 사용)
│
├─src                         // 소스파일 (모듈 단위)
│  │
│  └─ search                   // 검색 모듈
│  │  ├─ config
│  │  │   └─ search-config.ts  // 각 API 에 대한검색 필드, 인덱스 정보 등
│  │  ├─ dto                   // API 별 DTO 정의
│  │  ├─ test                  // 테스트 파일
│  │  ├─ search.controller.ts  // 요청 및 응답 처리
│  │  ├─ search.model.ts       // 쿼리 생성 및 데이터 접근
│  │  ├─ search.service.ts     // 모델에서 전달받은 데이터 가공 / 응답 생성
│  │  └─ search.module.ts      // search 모듈 정의(Nestjs)
│  │
│  └─gateway                  // 게이트웨이 모듈(자동완성, 오타교정, 인기검색어 등...)
│  │
│  └─utils                    // 기타 유틸리티(logger, exception filter, swagger 등..)
│  └─...                      // 기타 모듈...
│  │
│  ├─ app.controller.ts       // Nestjs 기본 모듈
│  ├─ app.module.ts
│  ├─ app.service.ts
│  └─ main.ts                 // 애플리케이션 starting point
│
├─logs                        // 기본 log 저장 폴더
│
├─config                      // 애플리케이션 설정
│  │
│  ├─ env                     // 환경변수 경로
│  │  ├─.development.env
│  │  ├─.production.env
│  │  ├─ ...
│  ├─ configuration.ts        // Nestjs 에서 읽는 설정 파일(ConfigModule)
│  └─ validationSchema.ts     // 설정값 유효성 검증
└─  ...                       // 기타 설정 파일(ts, eslint, nestjs ...)

```

환경변수를 이용해서 Nestjs 의 ConfigModule 을 생성하고 코드에선 ConfigModule을 이용하여 설정값 사용

```js

/**
 * src/app.module.ts
 **/
@Module({
  imports: [
    // ...
    ConfigModule.forRoot({
      envFilePath: [`./config/env/.${process.env.NODE_ENV}.env`],
      load: [configuration],
      isGlobal: true,
      validationSchema,
    }),
    //...
  ],
})
```

# 4. 요청 및 응답 처리 과정

각 파일 별 역할은 다음과 같음

```jsx

├─src                         // 소스파일 (모듈 단위)
│  │
│  └─ search                   // 검색 모듈
│  │  ├─ config
│  │  │   └─ search-config.ts  // 각 API 에 대한검색 필드, 인덱스 정보 등
│  │  ├─ dto                   // API 별 요청/응답 DTO 정의
│  │  ├─ test                  // 테스트 파일
│  │  ├─ search.controller.ts  // 요청 및 응답 처리
│  │  ├─ search.model.ts       // 쿼리 생성 및 데이터(엘라스틱서치) 접근
│  │  ├─ search.service.ts     // 모델에서 전달받은 데이터 가공 / 응답 생성
│  │  └─ search.module.ts      // search 모듈 정의(Nestjs)
│
...
```

요청의 흐름은 다음과 같다

```
1) controller     -> 요청 수신
2) service        -> model 로 요청 파라미터 전달
3) model          -> 데이터 조회(엘라스틱서치 검색 등) 후 결과를 service 로 전달
4) service        -> 전달받은 결과 가공 및 응답 생성
5) controller     -> 요청에 대한 응답
```

# 5. 에러 처리

- API 요청 처리 중 발생하는 에러는 별도로 처리하지 않으면 전역 예외 필터(Exception filter) 에서 처리
- 예외 필터 에서 에러 로깅 및 에러 응답 생성하여 전달.

```jsx
// src/utils/filter/all-exception.filter.ts
// ...
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: WinstonLoggerService,
  ) {}
// ...
```

에러 응답 형식은 다음과 같다

```jsx

interface ErrorResponse {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}

// 예시
{
    "statusCode": 404,
    "message": "Cannot POST /search",
    "path": "/search",
    "timestamp": "2024-12-19T07:27:30.920Z"
}
```

기본 예외 필터를 통한 응답이 아닌 다른 에러 응답을 보내는 경우 **@nestjs/common** 모듈에 정의되어 있는 빌트인 HTTP exception 을 이용한다.

```jsx
import { BadRequestException } from '@nestjs/common';

// ...
try {
  const esResult = await this.esService.search({ index, body });
  return { esResult, index, meta: { keywordFields } };
} catch (err) {
  if (
    err instanceof ResponseError &&
    err.message === 'index_not_found_exception'
  ) {
    this.logger.error(err);
    throw new BadRequestException('해당 label이 존재하지 않습니다.');
  }
  throw err;
}

// ...
```

# 6. 로깅

winston 사용하여 로그 관리
로그 레벨은 log, warn, error, debug 가 있음

- 특별한 경우가 아니면 log, error, debug 만 사용
  console 설정을 false 로 하는 경우 pm2 log를 출력하지 않음
- pm2 log 는 로그 관리(삭제) 대상이 아니기 때문에 운영 환경에서는 false 설정

```jsx

// config/config.json
{
   //...
  "logger": {
    "debug": false,      // debug 로그 출력 여부
    "console": true,     // console 로그 파일 출력 여부
    "log": {
      "maxFiles": 30,    // 최대 로그 파일 개수
      "maxSize": "100m"  // 파일당 최대 크기
    }
  }
}

```

사용 방법

클래스에서 **WinstonLoggerService** 를 주입받아 사용

```jsx
// ...
import { WinstonLoggerService } from '../utils/logger/winston.service';
// ...

@Injectable()
export class SearchService {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    // ...
  ) {}
  async simpleSearch(dto: SimpleSearchDTO): Promise<ResponseCommonDTO> {
    const { esResult, index } = await this.searchModel.simpleSearch(dto);

    // ...

    this.logger.log(`response: ${JSON.stringify({ index, took, total })}`);
  }
```

# 7. Swagger

controller 및 DTO 클래스에서 사용하는 데코레이터(@) 를 통해 자동으로 생성됨

1. **controller**

```jsx

...
@Controller('search')
@ApiTags('search')               // swagger 에서 표시하는 태그명
export class SearchController {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly searchService: SearchService,
  ) {}

  @Get('/simple')
  @ApiResponse({                  // swagger에 응답 포맷 표시
    status: 200,
    description: 'success',
    type: ResponseCommonDTO,
  })
  async simpleSearch(
    @Query() dto: SimpleSearchDTO, // DTO 클래스를 기반으로 API 요청 파라미터 표시
  ): Promise<ResponseCommonDTO> {
    return await this.searchService.simpleSearch(dto);
  }
}
...
```

2. DTO

- class 로 작성
- 데코레이터를 통해 요청 파라미터 유효성 검증(class-validator)

```jsx
...
export class SimpleSearchDTO {
  @ApiProperty()
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Max(100)
  @Min(0)
  readonly size: number = 10;

  @ApiPropertyOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Min(0)
  readonly from: number = 0;
}
...
```

# 8. gateway

기존 Openquery Gateway의 동일한 기능과 인터페이스로 Openquery gateway 대신 사용

```jsx
// src/gateway/gateway.controller.ts
// ...
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

  // ...
```

# 9. 디버깅

vs code debugger 설정파일(.vscode/launch.json)

```js
{
  // IntelliSense를 사용하여 가능한 특성에 대해 알아보세요.
  // 기존 특성에 대한 설명을 보려면 가리킵니다.
  // 자세한 내용을 보려면 https://go.microsoft.com/fwlink/?linkid=830387을(를) 방문하세요.
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "main.js",
      "program": "${workspaceFolder}/dist/src/main.js",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "outputCapture": "std",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["nodemon"],
      "restart": true,
      "skipFiles": ["<node_internals>/**"],
      "preLaunchTask": "npm: build",
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}

```

- vs code 좌측 메뉴 => "run and debug" 메뉴에서 상단에 main.js 선택하고 실행 버튼 클릭
- NODE_ENV 는 "test"로 설정하여 config/env/.test.env 설정파일을 읽어서 실행됨
