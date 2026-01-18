import { describe, it, expect } from 'vitest';
import {
  mockRequest,
  mockGet,
  mockPost,
  mockPut,
  mockPatch,
  mockDelete,
  mockOptions,
} from '../../src/mock-request.js';

describe('Mock Request', () => {
  describe('mockRequest', () => {
    it('should create a basic GET request', () => {
      const request = mockRequest();

      expect(request).toBeInstanceOf(Request);
      expect(request.method).toBe('GET');
      expect(request.url).toBe('http://localhost/');
    });

    it('should create request with custom URL', () => {
      const request = mockRequest({ url: 'https://api.example.com/users' });

      expect(request.url).toBe('https://api.example.com/users');
    });

    it('should create request with custom method', () => {
      const request = mockRequest({ method: 'POST' });

      expect(request.method).toBe('POST');
    });

    it('should create request with custom headers', () => {
      const request = mockRequest({
        headers: {
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json',
        },
      });

      expect(request.headers.get('Authorization')).toBe('Bearer token123');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create request with JSON body', async () => {
      const request = mockRequest({
        method: 'POST',
        body: { name: 'John', age: 30 },
      });

      const body = await request.json();
      expect(body).toEqual({ name: 'John', age: 30 });
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create request with string body', async () => {
      const request = mockRequest({
        method: 'POST',
        body: 'Hello World',
        headers: { 'Content-Type': 'text/plain' },
      });

      const body = await request.text();
      expect(body).toBe('Hello World');
    });

    it('should create request with query parameters', () => {
      const request = mockRequest({
        url: 'http://localhost/search',
        query: { q: 'test', page: '1' },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('q')).toBe('test');
      expect(url.searchParams.get('page')).toBe('1');
    });

    it('should not set Content-Type if already set', async () => {
      const request = mockRequest({
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: { data: 'test' },
      });

      expect(request.headers.get('Content-Type')).toBe('application/xml');
    });

    it('should not add body for GET requests', async () => {
      const request = mockRequest({
        method: 'GET',
        body: { shouldNotExist: true },
      });

      expect(request.body).toBeNull();
    });

    it('should not add body for HEAD requests', async () => {
      const request = mockRequest({
        method: 'HEAD',
        body: { shouldNotExist: true },
      });

      expect(request.body).toBeNull();
    });
  });

  describe('mockGet', () => {
    it('should create a GET request', () => {
      const request = mockGet('http://api.example.com/users');

      expect(request.method).toBe('GET');
      expect(request.url).toBe('http://api.example.com/users');
    });

    it('should create GET request with headers', () => {
      const request = mockGet('http://api.example.com/users', {
        headers: { 'Accept': 'application/json' },
      });

      expect(request.headers.get('Accept')).toBe('application/json');
    });

    it('should create GET request with query params', () => {
      const request = mockGet('http://api.example.com/users', {
        query: { limit: '10' },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('limit')).toBe('10');
    });
  });

  describe('mockPost', () => {
    it('should create a POST request', () => {
      const request = mockPost('http://api.example.com/users');

      expect(request.method).toBe('POST');
      expect(request.url).toBe('http://api.example.com/users');
    });

    it('should create POST request with body', async () => {
      const request = mockPost('http://api.example.com/users', { name: 'John' });

      const body = await request.json();
      expect(body).toEqual({ name: 'John' });
    });

    it('should create POST request with headers', () => {
      const request = mockPost('http://api.example.com/users', null, {
        headers: { 'X-Custom': 'value' },
      });

      expect(request.headers.get('X-Custom')).toBe('value');
    });
  });

  describe('mockPut', () => {
    it('should create a PUT request', () => {
      const request = mockPut('http://api.example.com/users/1');

      expect(request.method).toBe('PUT');
    });

    it('should create PUT request with body', async () => {
      const request = mockPut('http://api.example.com/users/1', { name: 'Jane' });

      const body = await request.json();
      expect(body).toEqual({ name: 'Jane' });
    });
  });

  describe('mockPatch', () => {
    it('should create a PATCH request', () => {
      const request = mockPatch('http://api.example.com/users/1');

      expect(request.method).toBe('PATCH');
    });

    it('should create PATCH request with body', async () => {
      const request = mockPatch('http://api.example.com/users/1', { name: 'Updated' });

      const body = await request.json();
      expect(body).toEqual({ name: 'Updated' });
    });
  });

  describe('mockDelete', () => {
    it('should create a DELETE request', () => {
      const request = mockDelete('http://api.example.com/users/1');

      expect(request.method).toBe('DELETE');
    });

    it('should create DELETE request with headers', () => {
      const request = mockDelete('http://api.example.com/users/1', {
        headers: { 'Authorization': 'Bearer token' },
      });

      expect(request.headers.get('Authorization')).toBe('Bearer token');
    });
  });

  describe('mockOptions', () => {
    it('should create an OPTIONS request', () => {
      const request = mockOptions('http://api.example.com/users');

      expect(request.method).toBe('OPTIONS');
    });

    it('should include CORS preflight headers', () => {
      const request = mockOptions('http://api.example.com/users');

      expect(request.headers.get('Origin')).toBe('http://example.com');
      expect(request.headers.get('Access-Control-Request-Method')).toBe('POST');
    });

    it('should allow custom headers to override defaults', () => {
      const request = mockOptions('http://api.example.com/users', {
        headers: {
          'Origin': 'http://custom.com',
          'Access-Control-Request-Method': 'PUT',
        },
      });

      expect(request.headers.get('Origin')).toBe('http://custom.com');
      expect(request.headers.get('Access-Control-Request-Method')).toBe('PUT');
    });
  });
});
