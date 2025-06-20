import { AsyncLocalStorage } from 'async_hooks';

export const correlationIdStore = new AsyncLocalStorage<Map<string, any>>();

export function getCorrelationId(): string | undefined {
  return correlationIdStore.getStore()?.get('correlationId');
}
