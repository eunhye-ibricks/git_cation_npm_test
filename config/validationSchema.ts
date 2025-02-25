import * as Joi from 'joi';

const urlListSchema = (value: string, helpers: any) => {
  // 쉼표로 구분하여 URL 배열을 생성
  const urls = value.split(',');

  // 각 URL의 유효성 검사
  for (const url of urls) {
    const result = Joi.string().uri().validate(url.trim());
    if (result.error) {
      // 유효하지 않은 URL이면 에러 반환
      return helpers.error('string.uri', { value: url });
    }
  }

  // 모든 URL이 유효하면 원래 값을 반환
  return value;
};

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('production', 'development', 'test')
    .default('development'),
  APP_NAME: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  ELASTICSEARCH_NODES: Joi.string()
    .custom(urlListSchema, 'Node URL Validation')
    .required(),
  LOG_PATH: Joi.string(),
});
