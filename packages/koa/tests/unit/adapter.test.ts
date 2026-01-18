import { describe, it, expect, vi } from 'vitest';
import { toKoa } from '../../src/adapter.js';
import { createChain } from '@openmiddleware/chain';
import type { Context, Next } from 'koa';

// Mock Koa Context
function createMockKoaContext(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
} = {}): {
  ctx: Context;
  getStatus: () => number;
  getHeaders: () => Record<string, string>;
  getBody: () => unknown;
} {
  const {
    method = 'GET',
    url = '/test',
    headers = {},
    body,
  } = options;

  let status = 200;
  const responseHeaders: Record<string, string> = {};
  let responseBody: unknown = null;

  const ctx = {
    method,
    href: `http://localhost:3000${url}`,
    headers: {
      host: 'localhost:3000',
      ...headers,
    },
    request: {
      body,
    },
    get: (name: string) => {
      const key = name.toLowerCase();
      return headers[key] as string | undefined;
    },
    set status(value: number) {
      status = value;
    },
    get status() {
      return status;
    },
    set: vi.fn((name: string, value: string) => {
      responseHeaders[name] = value;
    }),
    set body(value: unknown) {
      responseBody = value;
    },
    get body() {
      return responseBody;
    },
  } as unknown as Context;

  return {
    ctx,
    getStatus: () => status,
    getHeaders: () => responseHeaders,
    getBody: () => responseBody,
  };
}

describe('Koa Adapter', () => {
  describe('toKoa', () => {
    it('should convert chain to Koa middleware', () => {
      const chain = createChain();
      const middleware = toKoa(chain);

      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should handle basic GET request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ message: 'Hello from chain' });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx, getBody } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(getBody()).toEqual({ message: 'Hello from chain' });
    });

    it('should set response status from chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(201).json({ created: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx, getStatus } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(getStatus()).toBe(201);
    });

    it('should set response headers from chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('X-Custom-Header', 'custom-value');
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(ctx.set).toHaveBeenCalled();
    });

    it('should pass through with passThrough option', async () => {
      const chain = createChain().use(async (_ctx, next) => {
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain, { passThrough: true });
      const { ctx } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });

    it('should not pass through when response has content', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain, { passThrough: true });
      const { ctx } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should handle POST request with JSON body', async () => {
      let receivedBody: unknown;

      const chain = createChain().use(async (ctx, next) => {
        receivedBody = await ctx.request.json();
        ctx.response.json({ received: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx } = createMockKoaContext({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { name: 'John' },
      });
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(receivedBody).toEqual({ name: 'John' });
    });

    it('should handle text response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('Content-Type', 'text/plain').text('Hello World');
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx, getBody } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(getBody()).toBe('Hello World');
    });

    it('should handle binary response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        const data = new Uint8Array([1, 2, 3, 4]);
        ctx.response.setHeader('Content-Type', 'application/octet-stream');
        ctx.response.body = data;
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx, getBody } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(getBody()).toBeInstanceOf(Buffer);
    });

    it('should handle redirect response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(302).setHeader('Location', '/new-path');
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx, getStatus } = createMockKoaContext();
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(getStatus()).toBe(302);
      expect(ctx.set).toHaveBeenCalledWith('location', '/new-path');
    });

    it('should handle array headers in request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx } = createMockKoaContext({
        headers: {
          'accept': ['text/html', 'application/json'],
        },
      });
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(ctx.body).toEqual({ ok: true });
    });

    it('should handle form-urlencoded body', async () => {
      let receivedText: string | undefined;

      const chain = createChain().use(async (ctx, next) => {
        receivedText = await ctx.request.text();
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx } = createMockKoaContext({
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: { field: 'value' },
      });
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(receivedText).toBe('field=value');
    });

    it('should handle string body', async () => {
      let receivedText: string | undefined;

      const chain = createChain().use(async (ctx, next) => {
        receivedText = await ctx.request.text();
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx } = createMockKoaContext({
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'raw text',
      });
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(receivedText).toBe('raw text');
    });

    it('should not add body for GET requests', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ method: ctx.request.method });
        await next();
        return { done: false };
      });

      const middleware = toKoa(chain);
      const { ctx, getBody } = createMockKoaContext({ method: 'GET' });
      const nextFn: Next = vi.fn(async () => {});

      await middleware(ctx, nextFn);

      expect(getBody()).toEqual({ method: 'GET' });
    });
  });
});
