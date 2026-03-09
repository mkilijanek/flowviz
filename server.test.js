import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './server.js';

describe('server smoke tests', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeTypeOf('string');
  });

  it('returns provider configuration summary', async () => {
    const response = await request(app).get('/api/providers');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.providers)).toBe(true);
    expect(typeof response.body.hasConfiguredProviders).toBe('boolean');
  });
});
