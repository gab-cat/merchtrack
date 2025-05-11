import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, NODE_ENV, REDIS_DEV_MODE } from '@/config';

const redisClientSingleton = () => {
  return new Redis({
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    password: REDIS_PASSWORD
  });   
};

declare const globalThis: {
  redisGlobal: ReturnType<typeof redisClientSingleton>;
} & typeof global;

const redis = globalThis.redisGlobal ?? redisClientSingleton();

redis.on('error', (err) => {
  // no-dd-sa:typescript-best-practices/no-console
  console.error('Redis error: ', err);
});

export default redis;

if (NODE_ENV !== 'production') {globalThis.redisGlobal = redis;}

export const getCached = async <T>(key: string): Promise<T | null> => {
  if (NODE_ENV === 'development' && REDIS_DEV_MODE !== '1') return null;
  const cachedData = await redis.get(key);
  // if (!cachedData) console.log({
  //   message: 'Cache miss',
  //   key,
  // });
  // else console.log({
  //   message: 'Cache hit',
  //   key,
  // });  
  return cachedData ? JSON.parse(cachedData) : null;
};

type ExpirationLength = '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '12h' | '24h' | '48h' | '72h' | '1w' | '2w' | '1mo';
const expirationLengths: Record<ExpirationLength, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '6h': 21600,
  '12h': 43200,
  '24h': 86400,
  '48h': 172800,
  '72h': 259200,
  '1w': 604800,
  '2w': 1209600,
  '1mo': 2592000,
};

export const setCached = <T>(key: string, data: T, expirationInSeconds: number | ExpirationLength = 3600) => {
  if (NODE_ENV === 'development' && REDIS_DEV_MODE !== '1') return null;
  const duration = typeof expirationInSeconds === 'number' 
    ? expirationInSeconds 
    : expirationLengths[expirationInSeconds];
  redis.set(key, JSON.stringify(data), 'EX', duration);
  // console.log({
  //   message: 'Cache set',
  //   key,
  //   duration,
  // });
};

export const invalidateCache = (keys: string[]) => {
  if (keys.length > 0) {
    redis.del(keys);
    // console.log({
    //   keys,
    //   message: 'Cache invalidated',
    // });
  }
};