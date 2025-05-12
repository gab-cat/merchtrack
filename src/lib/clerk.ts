import { clerkClient } from "@clerk/nextjs/server";

const clerkClientSingleton = async () => {
  return await clerkClient();
};

declare const globalThis: {
  clerkGlobal: ReturnType<typeof clerkClientSingleton>;
} & typeof global;

const clerk = globalThis.clerkGlobal ?? clerkClientSingleton();

export default clerk;

if (process.env.NODE_ENV !== 'production') {globalThis.clerkGlobal = clerk;}