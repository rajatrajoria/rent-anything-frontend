import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@rent-anything/api-client";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Business errors (4xx from the API) won't succeed on retry.
          if (error instanceof ApiClientError) return false;
          return failureCount < 2;
        },
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
