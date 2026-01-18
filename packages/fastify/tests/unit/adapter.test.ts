import { describe, it, expect, vi } from 'vitest';
import { toFastify, fastifyPreHandler } from '../../src/adapter.js';
import { createChain } from '@openmiddleware/chain';
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

// Mock Fastify Request
function createMockFastifyRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
} = {}): FastifyRequest {
  const {
    method = 'GET',
    url = '/test',
    headers = {},
    body,
  } = options;

  return {
    method,
    url,
    protocol: 'http',
    hostname: 'localhost:3000',
    headers: {
      host: 'localhost:3000',
      ...headers,
    },
    body,
  } as unknown as FastifyRequest;
}

// Mock Fastify Reply
function createMockFastifyReply(): {
  reply: FastifyReply;
  getStatus: () => number;
  getHeaders: () => Record<string, string>;
  getBody: () => unknown;
} {
  let status = 200;
  const headers: Record<string, string> = {};
  let body: unknown = null;

  const reply = {
    status: vi.fn((code: number) => {
      status = code;
      return reply;
    }),
    header: vi.fn((name: string, value: string) => {
      headers[name] = value;
      return reply;
    }),
    send: vi.fn(async (data?: unknown) => {
      body = data;
      return reply;
    }),
    sent: false,
  } as unknown as FastifyReply;

  return {
    reply,
    getStatus: () => status,
    getHeaders: () => headers,
    getBody: () => body,
  };
}

// Mock Fastify Instance
function createMockFastify(): {
  fastify: FastifyInstance;
  getHooks: () => Record<string, ((req: FastifyRequest, reply: FastifyReply) => Promise<unknown>)[]>;
} {
  const hooks: Record<string, ((req: FastifyRequest, reply: FastifyReply) => Promise<unknown>)[]> = {};

  const fastify = {
    addHook: vi.fn((hookName: string, fn: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>) => {
      if (!hooks[hookName]) {
        hooks[hookName] = [];
      }
      hooks[hookName].push(fn);
    }),
  } as unknown as FastifyInstance;

  return {
    fastify,
    getHooks: () => hooks,
  };
}

describe('Fastify Adapter', () => {
  describe('toFastify', () => {
    it('should create a Fastify plugin', () => {
      const chain = createChain();
      const plugin = toFastify(chain);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('function');
    });

    it('should register onRequest hook by default', async () => {
      const chain = createChain();
      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();

      await plugin(fastify, {});

      const hooks = getHooks();
      expect(hooks['onRequest']).toBeDefined();
      expect(hooks['onRequest'].length).toBe(1);
    });

    it('should register preHandler hook when specified', async () => {
      const chain = createChain();
      const plugin = toFastify(chain, { hook: 'preHandler' });
      const { fastify, getHooks } = createMockFastify();

      await plugin(fastify, {});

      const hooks = getHooks();
      expect(hooks['preHandler']).toBeDefined();
      expect(hooks['preHandler'].length).toBe(1);
    });

    it('should handle basic GET request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ message: 'Hello from chain' });
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply, getBody } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalled();
      expect(getBody()).toEqual({ message: 'Hello from chain' });
    });

    it('should set response status from chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(201).json({ created: true });
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply, getStatus } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(getStatus()).toBe(201);
    });

    it('should set response headers from chain', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('X-Custom-Header', 'custom-value');
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(reply.header).toHaveBeenCalled();
    });

    it('should pass through when no content', async () => {
      const chain = createChain().use(async (_ctx, next) => {
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      const result = await hookFn(request, reply);

      expect(result).toBeUndefined();
    });

    it('should return reply for non-200 status', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(404);
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply, getStatus } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      const result = await hookFn(request, reply);

      expect(getStatus()).toBe(404);
      expect(result).toBe(reply);
    });

    it('should handle POST request with JSON body', async () => {
      let receivedBody: unknown;

      const chain = createChain().use(async (ctx, next) => {
        receivedBody = await ctx.request.json();
        ctx.response.json({ received: true });
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { name: 'John' },
      });
      const { reply } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(receivedBody).toEqual({ name: 'John' });
    });

    it('should handle text response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setHeader('Content-Type', 'text/plain').text('Hello World');
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply, getBody } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(getBody()).toBe('Hello World');
    });

    it('should handle empty body response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(204);
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest();
      const { reply, getStatus } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(getStatus()).toBe(204);
      expect(reply.send).toHaveBeenCalled();
    });

    it('should handle array headers in request', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest({
        headers: {
          'accept': ['text/html', 'application/json'],
        },
      });
      const { reply } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(reply.send).toHaveBeenCalled();
    });

    it('should handle form-urlencoded body', async () => {
      let receivedText: string | undefined;

      const chain = createChain().use(async (ctx, next) => {
        receivedText = await ctx.request.text();
        ctx.response.json({ ok: true });
        await next();
        return { done: false };
      });

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest({
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: { field: 'value' },
      });
      const { reply } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

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

      const plugin = toFastify(chain);
      const { fastify, getHooks } = createMockFastify();
      await plugin(fastify, {});

      const request = createMockFastifyRequest({
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'raw text',
      });
      const { reply } = createMockFastifyReply();

      const hookFn = getHooks()['onRequest'][0];
      await hookFn(request, reply);

      expect(receivedText).toBe('raw text');
    });
  });

  describe('fastifyPreHandler', () => {
    it('should create a preHandler function', () => {
      const chain = createChain();
      const preHandler = fastifyPreHandler(chain);

      expect(preHandler).toBeDefined();
      expect(typeof preHandler).toBe('function');
    });

    it('should handle request and return response', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.json({ auth: 'passed' });
        await next();
        return { done: false };
      });

      const preHandler = fastifyPreHandler(chain);
      const request = createMockFastifyRequest();
      const { reply, getBody } = createMockFastifyReply();

      await preHandler(request, reply);

      expect(getBody()).toEqual({ auth: 'passed' });
    });

    it('should short-circuit on error status', async () => {
      const chain = createChain().use(async (ctx, next) => {
        ctx.response.setStatus(401).json({ error: 'Unauthorized' });
        await next();
        return { done: false };
      });

      const preHandler = fastifyPreHandler(chain);
      const request = createMockFastifyRequest();
      const { reply, getStatus } = createMockFastifyReply();

      await preHandler(request, reply);

      expect(getStatus()).toBe(401);
    });

    it('should pass through when no content', async () => {
      const chain = createChain().use(async (_ctx, next) => {
        await next();
        return { done: false };
      });

      const preHandler = fastifyPreHandler(chain);
      const request = createMockFastifyRequest();
      const { reply } = createMockFastifyReply();

      await preHandler(request, reply);

      expect(reply.send).not.toHaveBeenCalled();
    });
  });
});
