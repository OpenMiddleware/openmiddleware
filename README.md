# OpenMiddleware

[![npm version](https://img.shields.io/npm/v/@openmiddleware/chain.svg)](https://www.npmjs.com/package/@openmiddleware/chain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

Universal, type-safe middleware framework for JavaScript runtimes.

Write your middleware once and use it with **Express**, **Hono**, **Koa**, **Fastify**, or the native **Fetch API**.

## Features

- **Zero Dependencies** - Pure TypeScript implementation
- **Type-Safe** - Full TypeScript support with generic state typing
- **Universal** - Works with any JavaScript runtime (Node.js, Bun, Deno)
- **Composable** - Chain middlewares with builder pattern or pipe()
- **Production Ready** - 12 built-in middlewares for common use cases
- **Testable** - Testing utilities with mock factories and custom matchers

## Installation

```bash
npm install @openmiddleware/chain
```

For framework adapters:

```bash
npm install @openmiddleware/express  # Express.js
npm install @openmiddleware/hono     # Hono
npm install @openmiddleware/koa      # Koa
npm install @openmiddleware/fastify  # Fastify
```

## Quick Start

```typescript
import { createChain, logger, cors, auth } from '@openmiddleware/chain';
import { toHono } from '@openmiddleware/hono';
import { Hono } from 'hono';

const app = new Hono();

// Create a middleware chain
const chain = createChain()
  .use(logger({ level: 'info' }))
  .use(cors({ origin: '*' }))
  .use(auth({ jwt: { secret: 'my-secret' } }));

// Apply to all routes
app.use('*', toHono(chain));

app.get('/api/users', (c) => c.json({ users: [] }));
```

## Built-in Middlewares

| Middleware | Description |
|------------|-------------|
| `request-id` | Adds unique request ID |
| `logger` | Structured logging |
| `cors` | Cross-origin resource sharing |
| `helmet` | Security headers |
| `timeout` | Request timeout |
| `error-handler` | Centralized error handling |
| `rate-limit` | Rate limiting |
| `cache` | Response caching |
| `compress` | Response compression |
| `body-parser` | Body parsing |
| `auth` | JWT, API key, Basic auth |
| `validator` | Request validation |

## Framework Adapters

### Express

```typescript
import express from 'express';
import { createChain, logger, cors } from '@openmiddleware/chain';
import { toExpress } from '@openmiddleware/express';

const app = express();
const chain = createChain().use(logger()).use(cors());

app.use(toExpress(chain));
```

### Hono

```typescript
import { Hono } from 'hono';
import { createChain, logger, cors } from '@openmiddleware/chain';
import { toHono } from '@openmiddleware/hono';

const app = new Hono();
const chain = createChain().use(logger()).use(cors());

app.use('*', toHono(chain));
```

### Koa

```typescript
import Koa from 'koa';
import { createChain, logger, cors } from '@openmiddleware/chain';
import { toKoa } from '@openmiddleware/koa';

const app = new Koa();
const chain = createChain().use(logger()).use(cors());

app.use(toKoa(chain));
```

### Fastify

```typescript
import Fastify from 'fastify';
import { createChain, logger, cors } from '@openmiddleware/chain';
import { toFastify } from '@openmiddleware/fastify';

const fastify = Fastify();
const chain = createChain().use(logger()).use(cors());

fastify.register(toFastify(chain));
```

## Creating Custom Middleware

```typescript
import { createMiddleware } from '@openmiddleware/chain';

const timing = createMiddleware({
  name: 'timing',
  handler: async (ctx, next) => {
    const start = performance.now();

    await next();

    const duration = performance.now() - start;
    ctx.response.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);

    return { done: false };
  },
});
```

## Type-Safe State

```typescript
import { createChain, auth, validator, z, type AuthState, type ValidatedState } from '@openmiddleware/chain';

interface AppState extends AuthState, ValidatedState {}

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const chain = createChain<AppState>()
  .use(auth({ jwt: { secret: 'my-secret' } }))
  .use(validator({ body: userSchema }));

const result = await chain.execute(request);
console.log(result.state.user);  // Typed JWT payload
console.log(result.state.body);  // Typed validated body
```

## Testing

```typescript
import { testMiddleware, mockRequest, matchers } from '@openmiddleware/testing';
import { cors } from '@openmiddleware/chain';
import { expect } from 'vitest';

expect.extend(matchers);

const result = await testMiddleware(cors({ origin: '*' }), {
  url: 'https://api.example.com',
  headers: { Origin: 'https://example.com' },
});

expect(result.response).toHaveHeader('Access-Control-Allow-Origin', '*');
expect(result.response).toBeSuccessful();
```

## Documentation

Visit [openmiddleware.dev](https://openmiddleware.dev) for full documentation.

## Examples

See the [examples](./examples) directory for complete examples:

- [Basic Fetch API](./examples/01-basic)
- [Express.js](./examples/02-express)
- [Hono](./examples/03-hono)
- [Koa](./examples/04-koa)
- [Fastify](./examples/05-fastify)
- [Custom Adapter](./examples/06-custom-adapter)
- [Full-Stack API](./examples/07-full-stack)

## Packages

| Package | Description |
|---------|-------------|
| [@openmiddleware/chain](./packages/core) | Core middleware framework |
| [@openmiddleware/express](./packages/express) | Express.js adapter |
| [@openmiddleware/hono](./packages/hono) | Hono adapter |
| [@openmiddleware/koa](./packages/koa) | Koa adapter |
| [@openmiddleware/fastify](./packages/fastify) | Fastify adapter |
| [@openmiddleware/testing](./packages/testing) | Testing utilities |

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT License

---

Made with love by [Ersin KOC](https://github.com/ersinkoc)
