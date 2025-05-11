import { clerkClient } from "@clerk/nextjs/server";
import { NODE_ENV } from "@/config";

const clerkClientSingleton = async () => {
  return await clerkClient();
};

declare const globalThis: {
  clerkGlobal: ReturnType<typeof clerkClientSingleton>;
} & typeof global;

const clerk = globalThis.clerkGlobal ?? clerkClientSingleton();

export default clerk;

if (NODE_ENV !== 'production') {globalThis.clerkGlobal = clerk;}