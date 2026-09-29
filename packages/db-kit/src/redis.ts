import { Redis } from "ioredis";

/**
 * Um Redis para todos os labs, isolados por PREFIXO de chave — não por índice
 * de database. São 16 índices no total, e eles não existem em Redis Cluster;
 * prefixo sobrevive aos dois limites.
 */
export function createRedis(url: string, keyPrefix: string): Redis {
  if (!keyPrefix.endsWith(":")) {
    throw new Error(`keyPrefix deve terminar em ":" (recebido: ${JSON.stringify(keyPrefix)})`);
  }
  return new Redis(url, { keyPrefix, lazyConnect: true, maxRetriesPerRequest: 2 });
}
