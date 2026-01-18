import { describe, it, expect } from 'vitest';
import { testMiddleware, testChain } from '../../src/test-middleware.js';
import { createChain } from '@openmiddleware/chain';

describe('Test Middleware', () => {
  describe('testMiddleware', () => {
    it('should test a middleware function', async () => {
      const middleware = async (ctx: { response: { json: (data: unknown) => void } }, next: () => Promise<void>) => {
        ctx.response.json({ tested: true });
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware);

      expect(result.status).toBe(200);
      expect(result.json).toEqual({ tested: true });
    });

    it('should test middleware with custom request options', async () => {
      const middleware = async (ctx: { request: Request; response: { json: (data: unknown) => void } }, next: () => Promise<void>) => {
        ctx.response.json({
          method: ctx.request.method,
          url: ctx.request.url,
        });
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware, {
        method: 'POST',
        url: 'http://localhost/test',
      });

      expect(result.json).toEqual({
        method: 'POST',
        url: 'http://localhost/test',
      });
    });

    it('should test middleware with headers', async () => {
      const middleware = async (ctx: { request: Request; response: { json: (data: unknown) => void } }, next: () => Promise<void>) => {
        const auth = ctx.request.headers.get('Authorization');
        ctx.response.json({ auth });
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware, {
        headers: { 'Authorization': 'Bearer token123' },
      });

      expect(result.json).toEqual({ auth: 'Bearer token123' });
    });

    it('should return response headers', async () => {
      const middleware = async (ctx: { response: { setHeader: (name: string, value: string) => unknown; json: (data: unknown) => void } }, next: () => Promise<void>) => {
        ctx.response.setHeader('X-Custom', 'value');
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware);

      expect(result.headers['x-custom']).toBe('value');
    });

    it('should return body as text', async () => {
      const middleware = async (ctx: { response: { setHeader: (name: string, value: string) => unknown; text: (text: string) => void } }, next: () => Promise<void>) => {
        ctx.response.setHeader('Content-Type', 'text/plain');
        ctx.response.text('Hello World');
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware);

      expect(result.body).toBe('Hello World');
    });

    it('should handle non-JSON response body', async () => {
      const middleware = async (ctx: { response: { setHeader: (name: string, value: string) => unknown; text: (text: string) => void } }, next: () => Promise<void>) => {
        ctx.response.setHeader('Content-Type', 'text/plain');
        ctx.response.text('plain text');
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware);

      expect(result.json).toBeNull();
      expect(result.body).toBe('plain text');
    });

    it('should handle short-circuit expectation', async () => {
      const middleware = async (ctx: { response: { setStatus: (status: number) => { json: (data: unknown) => unknown }; build: () => Response } }) => {
        ctx.response.setStatus(401).json({ error: 'Unauthorized' });
        return { done: true, response: ctx.response.build() };
      };

      const result = await testMiddleware(middleware, { expectShortCircuit: true });

      expect(result.status).toBe(401);
      expect(result.shortCircuited).toBe(true);
    });

    it('should include response object in result', async () => {
      const middleware = async (ctx: { response: { json: (data: unknown) => void } }, next: () => Promise<void>) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      };

      const result = await testMiddleware(middleware);

      expect(result.response).toBeInstanceOf(Response);
    });
  });

  describe('testChain', () => {
    it('should test a middleware chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ chain: 'tested' });
        await next();
        return { done: false };
      });

      const result = await testChain(chain);

      expect(result.status).toBe(200);
      expect(result.json).toEqual({ chain: 'tested' });
    });

    it('should test chain with multiple middlewares', async () => {
      const order: number[] = [];

      const chain = createChain()
        .use(async (ctx, next) => {
          order.push(1);
          await next();
          order.push(4);
          return { done: false };
        })
        .use(async (ctx, next) => {
          order.push(2);
          ctx.response.json({ order });
          await next();
          order.push(3);
          return { done: false };
        });

      const result = await testChain(chain);

      expect(result.json).toEqual({ order: [1, 2] });
    });

    it('should test chain with custom request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ method: ctx.request.method });
        await next();
        return { done: false };
      });

      const result = await testChain(chain, { method: 'PUT' });

      expect(result.json).toEqual({ method: 'PUT' });
    });

    it('should test chain with initial state', async () => {
      const chain = createChain<{ user: string }>().use(async (ctx, next) => {
        ctx.response.json({ user: ctx.state.user });
        await next();
        return { done: false };
      });

      const result = await testChain(chain, {
        initialState: { user: 'John' },
      });

      expect(result.json).toEqual({ user: 'John' });
    });

    it('should return all response components', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response
          .setStatus(201)
          .setHeader('X-Created', 'true')
          .json({ created: true });
        await next();
        return { done: false };
      });

      const result = await testChain(chain);

      expect(result.status).toBe(201);
      expect(result.headers['x-created']).toBe('true');
      expect(result.json).toEqual({ created: true });
      expect(result.response).toBeInstanceOf(Response);
    });

    it('should handle error in chain', async () => {
      const chain = createChain().use(async () => {
        throw new Error('Test error');
      });

      await expect(testChain(chain)).rejects.toThrow('Test error');
    });

    it('should return shortCircuited as false', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const result = await testChain(chain);

      expect(result.shortCircuited).toBe(false);
    });
  });
});
