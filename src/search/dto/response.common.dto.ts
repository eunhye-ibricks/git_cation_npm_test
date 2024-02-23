export class ResponseCommonDTO {
  index: string;
  took: number;
  total: number;
  body: ResponseBody;
}

interface ResponseBody {
  body: Array<object>;
}
