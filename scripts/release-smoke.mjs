import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

async function waitForServer(baseUrl, retries = 20) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(500);
  }

  throw new Error(`Server did not become ready at ${baseUrl}`);
}

async function main() {
  const { startServer } = await import('../server.js');
  const port = Number(process.env.SMOKE_TEST_PORT || 3101);
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startServer(port);

  try {
    await waitForServer(baseUrl);

    const health = await fetch(`${baseUrl}/health`);
    if (!health.ok) {
      throw new Error(`Health endpoint failed with ${health.status}`);
    }

    const providers = await fetch(`${baseUrl}/api/providers`);
    if (!providers.ok) {
      throw new Error(`Providers endpoint failed with ${providers.status}`);
    }

    console.log('Release smoke test passed');
  } finally {
    server.close();
    await once(server, 'close');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
