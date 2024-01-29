export class PopqueryResponseDTO {
  rank: number;
  query: string;
  count: number;
  diff: number;
  updown: string;
}

export class HotqueryResponseDTO {
  rank: number;
  query: string;
  count: number;
  diff: number;
  updown: string;
}

// export class RecommendResponseDTO {} // : string

export class RelatedResponseDTO {}

export class AutocompleteResponseDTO {
  keyword: string;
  weight: number;
  custom: object;
  highlight: string;
}

export class SpellerResponse {
  correction: string;
}
