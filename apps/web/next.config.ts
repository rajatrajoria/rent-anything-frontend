import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rent-anything/types", "@rent-anything/api-client", "@rent-anything/ui"],
};

export default nextConfig;
