import type { Server } from 'bun';

import { routes } from '@routes/index';

export interface TestServer {
  server: Server;
  baseUrl: string;
  stop: () => void;
}

export const createTestServer = (port: number = 3002): TestServer => {
  const baseUrl = `http://localhost:${port}`;

  const server = Bun.serve({
    port,
    routes,
    development: false,
  });

  return {
    server,
    baseUrl,
    stop: () => server.stop(),
  };
};

export const makeRequest = async (
  baseUrl: string,
  endpoint: string,
  options: globalThis.RequestInit = {}
): Promise<Response> => {
  return await fetch(`${baseUrl}${endpoint}`, options);
};

export const makeJsonRequest = async (
  baseUrl: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<Response> => {
  const options: globalThis.RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return makeRequest(baseUrl, endpoint, options);
};
