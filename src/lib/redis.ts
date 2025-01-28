import Redis from 'ioredis';

const redisClientSingleton = () => {
  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
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

if (process.env.NODE_ENV !== 'production') {globalThis.redisGlobal = redis;}

export const getCached = async <T>(key: string): Promise<T | null> => {
  const cachedData = await redis.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

export const setCached = async <T>(key: string, data: T, expirationInSeconds: number = 3600): Promise<void> => {
  await redis.set(key, JSON.stringify(data), 'EX', expirationInSeconds);
};

export const invalidateCache = async (keys: string[]): Promise<void> => {
  if (keys.length > 0) {
    await redis.del(keys);
  }
};