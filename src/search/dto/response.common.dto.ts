export class ResponseCommonDTO {
  meta: ResponseMeta;
  body: ResponseBody;
}

interface ResponseMeta {
  index: string;
  took: number;
  total: number;
}

interface ResponseBody {
  body: Array<object>;
}
