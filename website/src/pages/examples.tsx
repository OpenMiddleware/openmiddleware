import { CodeBlock } from '@/components/code-block';

const examples = [
  {
    title: 'Basic Fetch API',
    description: 'Use OpenMiddleware directly with the Fetch API.',
    code: `import { createChain, logger, cors } from '@openmiddleware/chain';

const chain = createChain()
  .use(logger({ level: 'info', format: 'pretty' }))
  .use(cors({ origin: '*' }));

async function handleRequest(request: Request): Promise<Response> {
  const result = await chain.execute(request);

  if (result.done) {
    return result.response;
  }

  // Handle the request
  return new Response(JSON.stringify({ message: 'Hello, World!' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Use with any runtime
Bun.serve({ fetch: handleRequest, port: 3000 });
// Deno.serve({ port: 3000 }, handleRequest);`,
  },
  {
    title: 'Express with JWT Auth',
    description: 'Express.js API with JWT authentication and validation.',
    code: `import express from 'express';
import { createChain, logger, cors, auth, validator, z, signJWT } from '@openmiddleware/chain';
import { toExpress } from '@openmiddleware/express';

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret';

// Global middleware
const globalChain = createChain()
  .use(logger({ level: 'info' }))
  .use(cors({ origin: '*' }));

app.use(toExpress(globalChain));

// Login route
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/login', toExpress(
  createChain().use(validator({ body: loginSchema }))
), async (req, res) => {
  const { email, password } = req.body;

  // Verify credentials (demo)
  if (email === 'user@example.com' && password === 'password123') {
    const token = await signJWT(
      { sub: 'user-1', email, exp: Math.floor(Date.now() / 1000) + 3600 },
      JWT_SECRET
    );
    return res.json({ token });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// Protected route
const authChain = createChain()
  .use(auth({ jwt: { secret: JWT_SECRET } }));

app.get('/api/profile', toExpress(authChain), (req, res) => {
  const user = res.locals.state?.user;
  res.json({ profile: user });
});

app.listen(3000);`,
  },
  {
    title: 'Hono with Validation',
    description: 'Hono API with request validation and type-safe handlers.',
    code: `import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createChain, logger, cors, validator, z, type ValidatedState } from '@openmiddleware/chain';
import { toHono } from '@openmiddleware/hono';

const app = new Hono();

// Global middleware
const globalChain = createChain()
  .use(logger({ format: 'json' }))
  .use(cors({ origin: '*' }));

app.use('*', toHono(globalChain));

// Create user with validation
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.literal('user').or(z.literal('admin')).optional(),
});

const createUserChain = createChain<ValidatedState>()
  .use(validator({ body: createUserSchema }));

app.post('/users', toHono(createUserChain), async (c) => {
  const state = c.get('state') as ValidatedState;
  const user = {
    id: crypto.randomUUID(),
    ...state.body,
    createdAt: new Date().toISOString(),
  };
  return c.json(user, 201);
});

// List users with query params
const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const listUsersChain = createChain<ValidatedState>()
  .use(validator({ query: listUsersSchema }));

app.get('/users', toHono(listUsersChain), (c) => {
  const state = c.get('state') as ValidatedState;
  const { page, limit } = state.query!;
  return c.json({ users: [], page, limit });
});

serve(app, { port: 3000 });`,
  },
  {
    title: 'Rate Limiting & Caching',
    description: 'API with rate limiting and response caching.',
    code: `import { Hono } from 'hono';
import { createChain, logger, cors, rateLimit, cache, errorHandler } from '@openmiddleware/chain';
import { toHono } from '@openmiddleware/hono';

const app = new Hono();

// Global chain with error handling, logging, CORS
const globalChain = createChain()
  .use(errorHandler({ expose: true }))
  .use(logger({ format: 'json' }))
  .use(cors({ origin: '*' }));

app.use('*', toHono(globalChain));

// Rate limited endpoint
const rateLimitedChain = createChain()
  .use(rateLimit({
    max: 10,        // 10 requests
    window: '1m',   // per minute
    headers: true,  // Add X-RateLimit-* headers
  }));

app.get('/api/limited', toHono(rateLimitedChain), (c) => {
  return c.json({ message: 'Rate limited endpoint' });
});

// Cached endpoint
const cachedChain = createChain()
  .use(cache({
    ttl: '5m',           // Cache for 5 minutes
    methods: ['GET'],    // Only cache GET
    vary: ['Accept'],    // Vary by Accept header
  }));

app.get('/api/cached', toHono(cachedChain), (c) => {
  return c.json({
    data: 'Expensive computation result',
    cachedAt: new Date().toISOString(),
  });
});

export default app;`,
  },
  {
    title: 'Full-Stack API',
    description: 'Complete API with auth, authorization, validation, and error handling.',
    code: `import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import {
  createChain, createMiddleware,
  logger, cors, helmet, requestId, rateLimit, errorHandler,
  auth, validator, z, signJWT,
  type AuthState, type ValidatedState,
} from '@openmiddleware/chain';
import { toHono } from '@openmiddleware/hono';

const app = new Hono();
const JWT_SECRET = 'super-secret-key';

// Combined state type
interface AppState extends AuthState, ValidatedState {}

// Role guard middleware
function requireRole(role: string) {
  return createMiddleware<AuthState>({
    name: 'role-guard',
    handler: async (ctx, next) => {
      if (ctx.state.user?.role !== role) {
        ctx.response.setStatus(403).json({ error: 'Forbidden' });
        return { done: true, response: ctx.response.build() };
      }
      await next();
      return { done: false };
    },
  });
}

// Global middleware
const globalChain = createChain()
  .use(errorHandler({ expose: process.env.NODE_ENV !== 'production' }))
  .use(requestId())
  .use(logger({ format: 'json' }))
  .use(helmet())
  .use(cors({ origin: ['http://localhost:3000'], credentials: true }))
  .use(rateLimit({ max: 100, window: '1m' }));

app.use('*', toHono(globalChain));

// Login
const loginChain = createChain<ValidatedState>()
  .use(validator({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }));

app.post('/auth/login', toHono(loginChain), async (c) => {
  const { email, password } = (c.get('state') as ValidatedState).body!;

  if (email === 'admin@example.com' && password === 'admin123') {
    const token = await signJWT(
      { sub: 'admin-1', email, role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 },
      JWT_SECRET
    );
    return c.json({ token });
  }

  return c.json({ error: 'Invalid credentials' }, 401);
});

// Protected profile
const authChain = createChain<AuthState>()
  .use(auth({ jwt: { secret: JWT_SECRET } }));

app.get('/api/profile', toHono(authChain), (c) => {
  return c.json({ user: (c.get('state') as AuthState).user });
});

// Admin-only route
const adminChain = createChain<AuthState>()
  .use(auth({ jwt: { secret: JWT_SECRET } }))
  .use(requireRole('admin'));

app.get('/api/admin', toHono(adminChain), (c) => {
  return c.json({ message: 'Admin access granted' });
});

serve(app, { port: 3000 });`,
  },
  {
    title: 'Custom Middleware',
    description: 'Creating custom middleware for specific use cases.',
    code: `import { createMiddleware, createChain } from '@openmiddleware/chain';

// Timing middleware
const timing = createMiddleware({
  name: 'timing',
  handler: async (ctx, next) => {
    const start = performance.now();
    await next();
    const duration = performance.now() - start;
    ctx.response.setHeader('X-Response-Time', \`\${duration.toFixed(2)}ms\`);
    return { done: false };
  },
});

// Request logging with custom format
const customLogger = createMiddleware({
  name: 'custom-logger',
  handler: async (ctx, next) => {
    const { method, url } = ctx.request;
    console.log(\`[\${new Date().toISOString()}] \${method} \${url}\`);
    await next();
    return { done: false };
  },
});

// IP whitelist middleware
function ipWhitelist(allowedIPs: string[]) {
  return createMiddleware({
    name: 'ip-whitelist',
    handler: async (ctx, next) => {
      if (!allowedIPs.includes(ctx.ip)) {
        ctx.response.setStatus(403).json({ error: 'IP not allowed' });
        return { done: true, response: ctx.response.build() };
      }
      await next();
      return { done: false };
    },
  });
}

// Maintenance mode middleware
function maintenanceMode(enabled: boolean) {
  return createMiddleware({
    name: 'maintenance',
    handler: async (ctx, next) => {
      if (enabled) {
        ctx.response.setStatus(503).json({
          error: 'Service temporarily unavailable',
          message: 'We are currently performing maintenance',
        });
        return { done: true, response: ctx.response.build() };
      }
      await next();
      return { done: false };
    },
  });
}

// Use custom middlewares
const chain = createChain()
  .use(maintenanceMode(false))
  .use(ipWhitelist(['127.0.0.1', '::1']))
  .use(timing)
  .use(customLogger);`,
  },
];

export function Examples() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-4">Examples</h1>
      <p className="text-lg text-[rgb(var(--muted-foreground))] mb-12">
        Learn by example with these common use cases and patterns.
      </p>

      <nav className="p-4 rounded-lg bg-[rgb(var(--muted))] mb-12">
        <h3 className="font-semibold mb-3">Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {examples.map((example, i) => (
            <a
              key={example.title}
              href={`#example-${i}`}
              className="text-[rgb(var(--accent))] hover:underline"
            >
              {example.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-16">
        {examples.map((example, i) => (
          <section key={example.title} id={`example-${i}`} className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-2">{example.title}</h2>
            <p className="text-[rgb(var(--muted-foreground))] mb-4">{example.description}</p>
            <CodeBlock code={example.code} language="typescript" showLineNumbers />
          </section>
        ))}
      </div>

      <div className="mt-16 p-6 rounded-lg bg-[rgb(var(--muted))]">
        <h3 className="text-xl font-bold mb-2">More Examples</h3>
        <p className="text-[rgb(var(--muted-foreground))] mb-4">
          Check out the complete examples in the GitHub repository:
        </p>
        <a
          href="https://github.com/openmiddleware/openmiddleware/tree/main/examples"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[rgb(var(--accent))] hover:underline"
        >
          View on GitHub
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
