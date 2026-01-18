import { describe, it, expect, vi } from 'vitest';
import { toHono, honoHandler } from '../../src/adapter.js';
import { createChain } from '@openmiddleware/chain';
import type { Context, Next } from 'hono';

// Mock Hono Context
function createMockContext(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
} = {}): {
  ctx: Context;
  getHeaders: () => Record<string, string>;
} {
  const {
    method = 'GET',
    url = 'http://localhost:3000/test',
    headers = {},
  } = options;

  const requestHeaders = new Headers(headers);
  const request = new Request(url, { method, headers: requestHeaders });
  const responseHeaders: Record<string, string> = {};

  const ctx = {
    req: {
      raw: request,
      method,
      url,
      headers: requestHeaders,
    },
    header: vi.fn((name: string, value: string) => {
      responseHeaders[name] = value;
    }),
  } as unknown as Context;

  return {
    ctx,
    getHeaders: () => responseHeaders,
  };
}

describe('Hono Adapter', () => {
  describe('toHono', () => {
    it('should convert chain to Hono middleware', () => {
      const chain = createChain();
      const middleware = toHono(chain);

      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should handle basic GET request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ message: 'Hello from chain' });
        await next();
        return { done: false };
      });

      const middleware = toHono(chain);
      const { ctx } = createMockContext();
      const nextFn: Next = vi.fn();

      const response = await middleware(ctx, nextFn);

      expect(response).toBeInstanceOf(Response);
      expect(response?.status).toBe(200);
      const body = await response?.json();
      expect(body).toEqual({ message: 'Hello from chain' });
    });

    it('should pass through to next middleware when no content', async () => {
      const chain = createChain().use(async (_ctx, next) => {
        await next();
        return { done: false };
      });

      const middleware = toHono(chain);
      const { ctx } = createMockContext();
      const nextFn: Next = vi.fn();

      await middleware(ctx, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });

    it('should not pass through when passThrough is false', async () => {
      const chain = createChain().use(async (_ctx, next) => {
        await next();
        return { done: false };
      });

      const middleware = toHono(chain, { passThrough: false });
      const { ctx } = createMockContext();
      const nextFn: Next = vi.fn();

      await middleware(ctx, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should copy headers to Hono response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('X-Custom-Header', 'custom-value');
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toHono(chain);
      const { ctx, getHeaders } = createMockContext();
      const nextFn: Next = vi.fn();

      await middleware(ctx, nextFn);

      expect(ctx.header).toHaveBeenCalled();
    });

    it('should return response for non-200 status', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(404);
        await next();
        return { done: false };
      });

      const middleware = toHono(chain);
      const { ctx } = createMockContext();
      const nextFn: Next = vi.fn();

      const response = await middleware(ctx, nextFn);

      expect(response?.status).toBe(404);
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should return response for redirect', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(302).setHeader('Location', '/new-path');
        await next();
        return { done: false };
      });

      const middleware = toHono(chain);
      const { ctx } = createMockContext();
      const nextFn: Next = vi.fn();

      const response = await middleware(ctx, nextFn);

      expect(response?.status).toBe(302);
      expect(response?.headers.get('Location')).toBe('/new-path');
    });

    it('should handle POST request', async () => {
      let receivedMethod: string | undefined;

      const chain = createChain().use(async (ctx, next) => {
        receivedMethod = ctx.request.method;
        ctx.response.json({ received: true });
        await next();
        return { done: false };
      });

      const middleware = toHono(chain);
      const { ctx } = createMockContext({ method: 'POST' });
      const nextFn: Next = vi.fn();

      await middleware(ctx, nextFn);

      expect(receivedMethod).toBe('POST');
    });
  });

  describe('honoHandler', () => {
    it('should create a Hono handler from chain', () => {
      const chain = createChain();
      const handler = honoHandler(chain);

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('should return chain response directly', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ message: 'Handler response' });
        await next();
        return { done: false };
      });

      const handler = honoHandler(chain);
      const { ctx } = createMockContext();

      const response = await handler(ctx, vi.fn());

      expect(response).toBeInstanceOf(Response);
      const body = await response.json();
      expect(body).toEqual({ message: 'Handler response' });
    });

    it('should handle error responses', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(500).json({ error: 'Internal Server Error' });
        await next();
        return { done: false };
      });

      const handler = honoHandler(chain);
      const { ctx } = createMockContext();

      const response = await handler(ctx, vi.fn());

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: 'Internal Server Error' });
    });

    it('should pass request headers to chain', async () => {
      let authHeader: string | null = null;

      const chain = createChain().use(async (ctx, next) => {
        authHeader = ctx.request.headers.get('Authorization');
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const handler = honoHandler(chain);
      const { ctx } = createMockContext({
        headers: { 'Authorization': 'Bearer token123' },
      });

      await handler(ctx, vi.fn());

      expect(authHeader).toBe('Bearer token123');
    });
  });
});
