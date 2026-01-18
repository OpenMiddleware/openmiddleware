import { describe, it, expect } from 'vitest';
import {
  toHaveStatus,
  toHaveHeader,
  toHaveBody,
  toBeRedirect,
  toBeSuccessful,
  toBeClientError,
  toBeServerError,
  toBeJson,
  matchers,
} from '../../src/matchers/response.js';

describe('Response Matchers', () => {
  describe('toHaveStatus', () => {
    it('should pass when status matches', () => {
      const response = new Response(null, { status: 200 });
      const result = toHaveStatus(response, 200);

      expect(result.pass).toBe(true);
    });

    it('should fail when status does not match', () => {
      const response = new Response(null, { status: 404 });
      const result = toHaveStatus(response, 200);

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to have status 200');
      expect(result.message()).toContain('got 404');
    });

    it('should have correct failure message for pass', () => {
      const response = new Response(null, { status: 200 });
      const result = toHaveStatus(response, 200);

      expect(result.message()).toContain('Expected response not to have status 200');
    });
  });

  describe('toHaveHeader', () => {
    it('should pass when header exists', () => {
      const response = new Response(null, {
        headers: { 'X-Custom': 'value' },
      });
      const result = toHaveHeader(response, 'X-Custom');

      expect(result.pass).toBe(true);
    });

    it('should fail when header does not exist', () => {
      const response = new Response(null);
      const result = toHaveHeader(response, 'X-Custom');

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to have header "X-Custom"');
    });

    it('should pass when header value matches', () => {
      const response = new Response(null, {
        headers: { 'X-Custom': 'expected' },
      });
      const result = toHaveHeader(response, 'X-Custom', 'expected');

      expect(result.pass).toBe(true);
    });

    it('should fail when header value does not match', () => {
      const response = new Response(null, {
        headers: { 'X-Custom': 'actual' },
      });
      const result = toHaveHeader(response, 'X-Custom', 'expected');

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to have header "X-Custom: expected"');
      expect(result.message()).toContain('"X-Custom: actual"');
    });
  });

  describe('toHaveBody', () => {
    it('should pass when JSON body matches', () => {
      const result = toHaveBody('{"name":"John"}', { name: 'John' });

      expect(result.pass).toBe(true);
    });

    it('should fail when JSON body does not match', () => {
      const result = toHaveBody('{"name":"Jane"}', { name: 'John' });

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response body to match');
    });

    it('should handle string body', () => {
      const result = toHaveBody('Hello World', 'Hello World');

      expect(result.pass).toBe(true);
    });

    it('should fail when string body does not match', () => {
      const result = toHaveBody('Hello', 'World');

      expect(result.pass).toBe(false);
    });
  });

  describe('toBeRedirect', () => {
    it('should pass for 301 redirect', () => {
      const response = new Response(null, {
        status: 301,
        headers: { 'Location': '/new-path' },
      });
      const result = toBeRedirect(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 302 redirect', () => {
      const response = new Response(null, {
        status: 302,
        headers: { 'Location': '/new-path' },
      });
      const result = toBeRedirect(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 307 redirect', () => {
      const response = new Response(null, {
        status: 307,
        headers: { 'Location': '/new-path' },
      });
      const result = toBeRedirect(response);

      expect(result.pass).toBe(true);
    });

    it('should fail for non-redirect status', () => {
      const response = new Response(null, { status: 200 });
      const result = toBeRedirect(response);

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to be a redirect (3xx)');
    });

    it('should pass when location matches', () => {
      const response = new Response(null, {
        status: 302,
        headers: { 'Location': '/expected-path' },
      });
      const result = toBeRedirect(response, '/expected-path');

      expect(result.pass).toBe(true);
    });

    it('should fail when location does not match', () => {
      const response = new Response(null, {
        status: 302,
        headers: { 'Location': '/actual-path' },
      });
      const result = toBeRedirect(response, '/expected-path');

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to redirect to "/expected-path"');
    });
  });

  describe('toBeSuccessful', () => {
    it('should pass for 200 status', () => {
      const response = new Response(null, { status: 200 });
      const result = toBeSuccessful(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 201 status', () => {
      const response = new Response(null, { status: 201 });
      const result = toBeSuccessful(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 204 status', () => {
      const response = new Response(null, { status: 204 });
      const result = toBeSuccessful(response);

      expect(result.pass).toBe(true);
    });

    it('should fail for 400 status', () => {
      const response = new Response(null, { status: 400 });
      const result = toBeSuccessful(response);

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to be successful (2xx)');
    });

    it('should fail for 500 status', () => {
      const response = new Response(null, { status: 500 });
      const result = toBeSuccessful(response);

      expect(result.pass).toBe(false);
    });
  });

  describe('toBeClientError', () => {
    it('should pass for 400 status', () => {
      const response = new Response(null, { status: 400 });
      const result = toBeClientError(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 401 status', () => {
      const response = new Response(null, { status: 401 });
      const result = toBeClientError(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 404 status', () => {
      const response = new Response(null, { status: 404 });
      const result = toBeClientError(response);

      expect(result.pass).toBe(true);
    });

    it('should fail for 200 status', () => {
      const response = new Response(null, { status: 200 });
      const result = toBeClientError(response);

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to be a client error (4xx)');
    });

    it('should fail for 500 status', () => {
      const response = new Response(null, { status: 500 });
      const result = toBeClientError(response);

      expect(result.pass).toBe(false);
    });
  });

  describe('toBeServerError', () => {
    it('should pass for 500 status', () => {
      const response = new Response(null, { status: 500 });
      const result = toBeServerError(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 502 status', () => {
      const response = new Response(null, { status: 502 });
      const result = toBeServerError(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for 503 status', () => {
      const response = new Response(null, { status: 503 });
      const result = toBeServerError(response);

      expect(result.pass).toBe(true);
    });

    it('should fail for 200 status', () => {
      const response = new Response(null, { status: 200 });
      const result = toBeServerError(response);

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to be a server error (5xx)');
    });

    it('should fail for 400 status', () => {
      const response = new Response(null, { status: 400 });
      const result = toBeServerError(response);

      expect(result.pass).toBe(false);
    });
  });

  describe('toBeJson', () => {
    it('should pass for application/json content type', () => {
      const response = new Response('{}', {
        headers: { 'Content-Type': 'application/json' },
      });
      const result = toBeJson(response);

      expect(result.pass).toBe(true);
    });

    it('should pass for application/json with charset', () => {
      const response = new Response('{}', {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      const result = toBeJson(response);

      expect(result.pass).toBe(true);
    });

    it('should fail for text/plain content type', () => {
      const response = new Response('hello', {
        headers: { 'Content-Type': 'text/plain' },
      });
      const result = toBeJson(response);

      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected response to have JSON content type');
    });

    it('should fail for no content type', () => {
      const response = new Response('hello');
      const result = toBeJson(response);

      expect(result.pass).toBe(false);
    });
  });

  describe('matchers export', () => {
    it('should export all matchers', () => {
      expect(matchers.toHaveStatus).toBe(toHaveStatus);
      expect(matchers.toHaveHeader).toBe(toHaveHeader);
      expect(matchers.toHaveBody).toBe(toHaveBody);
      expect(matchers.toBeRedirect).toBe(toBeRedirect);
      expect(matchers.toBeSuccessful).toBe(toBeSuccessful);
      expect(matchers.toBeClientError).toBe(toBeClientError);
      expect(matchers.toBeServerError).toBe(toBeServerError);
      expect(matchers.toBeJson).toBe(toBeJson);
    });
  });
});
