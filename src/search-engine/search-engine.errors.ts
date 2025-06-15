export const ErrorNames = {
  TIMEOUT: 'TimeoutError',
  CONNECTION: 'ConnectionError',
  NO_LIVING_CONNECTIONS: 'NoLivingConnectionsError',
  SERIALIZATION: 'SerializationError',
  DESERIALIZATION: 'DeserializationError',
  CONFIGURATION: 'ConfigurationError',
  RESPONSE: 'ResponseError',
  REQUEST_ABORTED: 'RequestAbortedError',
  NOT_COMPATIBLE: 'NotCompatibleError', // OpenSearch only
};

export interface SearchClientError {
  name: string;
  message: string;
  meta?: any;
}

export const isSearchClientError = (
  error: unknown,
): error is SearchClientError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as any).name === 'string' &&
    'message' in error &&
    typeof (error as any).message === 'string' &&
    Object.values(ErrorNames).includes((error as any).name)
  );
};

// export const handleSearchEngineError = (error: any): void => {
//   const name = error?.name as keyof typeof ErrorNames;
//   const meta = error?.meta;
//   const message = error?.message;

//   if (
//     name === ErrorNames.CONNECTION ||
//     name === ErrorNames.NO_LIVING_CONNECTIONS
//   ) {
//     this.logger.debug(`${name}: Search engine connection failed`);
//   } else if (name === ErrorNames.RESPONSE) {
//     const errorType = meta?.body?.error?.type;
//     if (errorType === 'index_not_found_exception') {
//       this.logger.debug(`${name}: No speller index found`);
//     } else {
//       this.logger.warn(
//         `${name}: Unexpected response error: ${errorType ?? 'unknown'}`,
//       );
//       this.logger.warn(error);
//     }
//   } else {
//     this.logger.error(`${name}: ${message}`);
//   }
// };
