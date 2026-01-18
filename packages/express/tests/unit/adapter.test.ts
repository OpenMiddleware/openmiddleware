import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toExpress } from '../../src/adapter.js';
import { createChain } from '@openmiddleware/chain';
import type { Request, Response, NextFunction } from 'express';

// Mock Express Request
function createMockRequest(options: {
  method?: string;
  url?: string;
  protocol?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
} = {}): Request {
  const {
    method = 'GET',
    url = '/test',
    protocol = 'http',
    headers = {},
    body,
  } = options;

  return {
    method,
    originalUrl: url,
    protocol,
    get: (name: string) => {
      const key = name.toLowerCase();
      if (key === 'host') return 'localhost:3000';
      return headers[key] as string | undefined;
    },
    headers: {
      host: 'localhost:3000',
      ...headers,
    },
    body,
  } as unknown as Request;
}

// Mock Express Response
function createMockResponse(): {
  res: Response;
  getStatus: () => number;
  getHeaders: () => Record<string, string>;
  getBody: () => unknown;
} {
  let status = 200;
  const headers: Record<string, string> = {};
  let body: unknown = null;

  const res = {
    status: vi.fn((code: number) => {
      status = code;
      return res;
    }),
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
      return res;
    }),
    json: vi.fn((data: unknown) => {
      body = data;
      headers['content-type'] = 'application/json';
      return res;
    }),
    send: vi.fn((data: unknown) => {
      body = data;
      return res;
    }),
    end: vi.fn(() => {
      return res;
    }),
  } as unknown as Response;

  return {
    res,
    getStatus: () => status,
    getHeaders: () => headers,
    getBody: () => body,
  };
}

describe('Express Adapter', () => {
  describe('toExpress', () => {
    it('should convert chain to Express middleware', () => {
      const chain = createChain();
      const middleware = toExpress(chain);

      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should handle basic GET request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ message: 'Hello from chain' });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest();
      const { res, getBody } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(getBody()).toEqual({ message: 'Hello from chain' });
    });

    it('should handle POST request with JSON body', async () => {
      let receivedBody: unknown;

      const chain = createChain().use(async (ctx, next) => {
        receivedBody = await ctx.request.json();
        ctx.response.json({ received: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { name: 'John' },
      });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(receivedBody).toEqual({ name: 'John' });
    });

    it('should set response status from chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(201).json({ created: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest();
      const { res, getStatus } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(getStatus()).toBe(201);
    });

    it('should set response headers from chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('X-Custom-Header', 'custom-value');
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest();
      const { res, getHeaders } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('x-custom-header', 'custom-value');
    });

    it('should handle text response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('Content-Type', 'text/plain').text('Hello World');
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest();
      const { res, getBody } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.send).toHaveBeenCalledWith('Hello World');
    });

    it('should call next() on error', async () => {
      const error = new Error('Test error');
      const chain = createChain().use(async () => {
        throw error;
      });

      const middleware = toExpress(chain);
      const req = createMockRequest();
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass through with passThrough option', async () => {
      const chain = createChain().use(async (_ctx, next) => {
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain, { passThrough: true });
      const req = createMockRequest();
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle array headers', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ headers: Object.fromEntries(ctx.request.headers) });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({
        headers: {
          'accept': ['text/html', 'application/json'],
        },
      });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.json).toHaveBeenCalled();
    });

    it('should handle empty body response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(204);
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest();
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('should handle form-urlencoded body', async () => {
      let receivedBody: unknown;

      const chain = createChain().use(async (ctx, next) => {
        const text = await ctx.request.text();
        receivedBody = text;
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: { field: 'value' },
      });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(receivedBody).toBe('field=value');
    });

    it('should handle string body', async () => {
      let receivedBody: unknown;

      const chain = createChain().use(async (ctx, next) => {
        receivedBody = await ctx.request.text();
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'raw text body',
      });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(receivedBody).toBe('raw text body');
    });

    it('should handle Buffer body', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({
        method: 'POST',
        headers: { 'content-type': 'application/octet-stream' },
        body: Buffer.from('binary data'),
      });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.json).toHaveBeenCalled();
    });

    it('should not add body for GET requests', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ method: ctx.request.method });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({ method: 'GET' });
      const { res, getBody } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(getBody()).toEqual({ method: 'GET' });
    });

    it('should handle HEAD requests', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({ method: 'HEAD' });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.json).toHaveBeenCalled();
    });

    it('should handle OPTIONS requests', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('Allow', 'GET, POST, OPTIONS');
        ctx.response.setStatus(200);
        await next();
        return { done: false };
      });

      const middleware = toExpress(chain);
      const req = createMockRequest({ method: 'OPTIONS' });
      const { res } = createMockResponse();
      const next: NextFunction = vi.fn();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('allow', 'GET, POST, OPTIONS');
    });
  });
});
