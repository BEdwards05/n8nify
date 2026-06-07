import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "better-auth",
    "kysely",
    "@better-auth/kysely-adapter",
    "postgres",
    "bullmq",
    "ioredis",
    "@aws-sdk/client-s3",
  ],
};

export default nextConfig;
