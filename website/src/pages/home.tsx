import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/code-block';

const heroCode = `import { createChain, cors, logger, auth } from '@openmiddleware/chain';
import { toHono } from '@openmiddleware/hono';
import { Hono } from 'hono';

const app = new Hono();

const chain = createChain()
  .use(logger({ level: 'info' }))
  .use(cors({ origin: '*' }))
  .use(auth({ jwt: { secret: 'my-secret' } }));

app.use('*', toHono(chain));
app.get('/api/users', (c) => c.json({ users: [] }));`;

const features = [
  {
    title: 'Zero Dependencies',
    description: 'Pure TypeScript implementation with no external runtime dependencies. Lightweight, fast, and secure.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Type-Safe',
    description: 'Full TypeScript support with generic state typing. Catch errors at compile time, not runtime.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Universal',
    description: 'Works with Express, Hono, Koa, Fastify, and any Fetch-based runtime like Bun and Deno.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Composable',
    description: 'Chain middlewares with builder pattern or compose with pipe(). Maximum flexibility for any use case.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Production Ready',
    description: '12 built-in middlewares for auth, validation, rate limiting, caching, compression, and more.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Testable',
    description: 'Testing utilities with mock factories, test helpers, and custom Vitest matchers for easy testing.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-blue-500',
  },
];

const middlewares = [
  { name: 'request-id', description: 'Unique request IDs', icon: '🔑' },
  { name: 'logger', description: 'Structured logging', icon: '📝' },
  { name: 'cors', description: 'CORS headers', icon: '🌐' },
  { name: 'helmet', description: 'Security headers', icon: '🛡️' },
  { name: 'timeout', description: 'Request timeout', icon: '⏱️' },
  { name: 'error-handler', description: 'Error handling', icon: '🚨' },
  { name: 'rate-limit', description: 'Rate limiting', icon: '🚦' },
  { name: 'cache', description: 'Response caching', icon: '💾' },
  { name: 'compress', description: 'Compression', icon: '📦' },
  { name: 'body-parser', description: 'Body parsing', icon: '📋' },
  { name: 'auth', description: 'Authentication', icon: '🔐' },
  { name: 'validator', description: 'Validation', icon: '✅' },
];

const frameworks = [
  { name: 'Express', logo: '🚂', color: 'from-gray-600 to-gray-800' },
  { name: 'Hono', logo: '🔥', color: 'from-orange-500 to-red-500' },
  { name: 'Koa', logo: '🥝', color: 'from-green-500 to-emerald-600' },
  { name: 'Fastify', logo: '⚡', color: 'from-yellow-400 to-orange-500' },
];

const stats = [
  { value: '0', label: 'Dependencies' },
  { value: '12+', label: 'Middlewares' },
  { value: '4', label: 'Adapters' },
  { value: '100%', label: 'TypeScript' },
];

export function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Floating blobs */}
        <div className="blob w-[500px] h-[500px] bg-[rgb(var(--gradient-start))] -top-48 -left-48 opacity-30" />
        <div className="blob w-[400px] h-[400px] bg-[rgb(var(--gradient-end))] top-1/2 -right-32 opacity-20" style={{ animationDelay: '-5s' }} />
        <div className="blob w-[300px] h-[300px] bg-[rgb(var(--accent))] bottom-0 left-1/3 opacity-20" style={{ animationDelay: '-10s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--primary)/0.1)] border border-[rgb(var(--primary)/0.2)] mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--primary))] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(var(--primary))]"></span>
                </span>
                <span className="text-sm font-medium text-[rgb(var(--primary))]">Open Source & Free Forever</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="block">Universal</span>
                <span className="block gradient-text">Middleware</span>
                <span className="block">Framework</span>
              </h1>

              {/* Description */}
              <p className="mt-8 text-xl text-[rgb(var(--muted-foreground))] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Write your middleware once and use it with <span className="text-[rgb(var(--foreground))] font-medium">Express</span>, <span className="text-[rgb(var(--foreground))] font-medium">Hono</span>, <span className="text-[rgb(var(--foreground))] font-medium">Koa</span>, <span className="text-[rgb(var(--foreground))] font-medium">Fastify</span>, or the native <span className="text-[rgb(var(--foreground))] font-medium">Fetch API</span>.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/getting-started" className="btn-primary group">
                  <span className="flex items-center gap-2">
                    Get Started
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <a
                  href="https://github.com/openmiddleware/openmiddleware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  View on GitHub
                </a>
              </div>

              {/* Install command */}
              <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-lg">
                <span className="text-[rgb(var(--muted-foreground))]">$</span>
                <code className="font-mono text-sm sm:text-base">npm install @openmiddleware/chain</code>
                <button
                  onClick={() => navigator.clipboard.writeText('npm install @openmiddleware/chain')}
                  className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
                >
                  <svg className="w-4 h-4 text-[rgb(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* NPM Badges */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
                <a href="https://www.npmjs.com/package/@openmiddleware/chain" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/npm/v/@openmiddleware/chain?style=flat-square&color=6366f1&label=npm" alt="npm version" className="h-5" />
                </a>
                <a href="https://github.com/openmiddleware/openmiddleware" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/github/license/openmiddleware/openmiddleware?style=flat-square&color=22c55e" alt="license" className="h-5" />
                </a>
              </div>
            </div>

            {/* Right side - Code block */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[rgb(var(--gradient-start)/0.2)] to-[rgb(var(--gradient-end)/0.2)] rounded-2xl blur-2xl" />
              <div className="relative float">
                <CodeBlock code={heroCode} language="typescript" filename="app.ts" showLineNumbers />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl sm:text-5xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-2 text-[rgb(var(--muted-foreground))]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Runs Everywhere */}
          <div className="mt-20 text-center">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">Runs on every JavaScript runtime</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60 hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
                <span className="text-2xl">🟢</span> Node.js
              </span>
              <span className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
                <span className="text-2xl">🥟</span> Bun
              </span>
              <span className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
                <span className="text-2xl">🦕</span> Deno
              </span>
              <span className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
                <span className="text-2xl">☁️</span> Cloudflare Workers
              </span>
              <span className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
                <span className="text-2xl">▲</span> Vercel Edge
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-[rgb(var(--muted)/0.3)]" />
        <div className="absolute inset-0 dot-pattern opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold">Why OpenMiddleware?</h2>
            <p className="mt-6 text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
              Built for modern JavaScript development with developer experience in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] card-hover"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Middlewares Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))] text-sm font-medium mb-4">
              Built-in
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold">12 Production-Ready Middlewares</h2>
            <p className="mt-6 text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
              Everything you need for production APIs, with zero external dependencies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {middlewares.map((mw, i) => (
              <Link
                key={mw.name}
                to="/middlewares"
                className="group relative p-5 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] card-hover overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[rgb(var(--primary)/0.1)] to-transparent rounded-bl-full" />

                <div className="text-2xl mb-3">{mw.icon}</div>
                <code className="font-mono text-sm text-[rgb(var(--primary))] group-hover:underline">{mw.name}</code>
                <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{mw.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/middlewares"
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] font-medium hover:underline"
            >
              View all middlewares
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Framework Adapters Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-[rgb(var(--muted)/0.3)]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-sm font-medium mb-4">
              Adapters
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold">Works with Your Favorite Framework</h2>
            <p className="mt-6 text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
              First-class support for the most popular JavaScript frameworks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {frameworks.map((fw, i) => (
              <Link
                key={fw.name}
                to="/adapters"
                className="group relative p-8 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] card-hover text-center overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${fw.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="text-5xl mb-4">{fw.logo}</div>
                <h3 className="text-2xl font-bold mb-2">{fw.name}</h3>
                <code className="text-sm text-[rgb(var(--muted-foreground))]">
                  @openmiddleware/{fw.name.toLowerCase()}
                </code>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(var(--primary)/0.05)] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Decorative elements */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[rgb(var(--primary)/0.3)]" />

          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to Build <span className="gradient-text">Something Amazing</span>?
          </h2>
          <p className="mt-6 text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
            Get started with OpenMiddleware in minutes. Check out our documentation and examples.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/getting-started" className="btn-primary text-lg px-8 py-4">
              <span className="flex items-center gap-2">
                Read the Documentation
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
            </Link>
            <Link to="/examples" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              View Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
