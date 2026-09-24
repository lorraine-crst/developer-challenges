import autocannon from 'autocannon';

const BASE_URL = process.env.LOAD_TEST_BASE_URL ?? 'http://localhost:3333';
const EMAIL = process.env.SEED_USER_EMAIL ?? 'avaliador@dynamox.com';
const PASSWORD = process.env.SEED_USER_PASSWORD ?? 'dynamox2026';

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  const data = (await response.json()) as { token: string };

  return data.token;
}

function runLoadTest(url: string, token: string) {
  return autocannon({
    url,
    connections: 20,
    duration: 10,
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function main() {
  const token = await login();

  const targets = [
    { name: 'GET /auth/me', url: `${BASE_URL}/auth/me` },
    {
      name: 'GET /monitoring-points (paginado)',
      url: `${BASE_URL}/monitoring-points?page=1&sortBy=machineName&order=asc`,
    },
  ];

  for (const target of targets) {
    console.log(`\n=== ${target.name} ===`);

    const result = await runLoadTest(target.url, token);

    console.log(`Requisições/s (média): ${result.requests.average}`);
    console.log(`Latência média: ${result.latency.average}ms`);
    console.log(`Latência p99: ${result.latency.p99}ms`);
    console.log(`Total de requisições: ${result.requests.total}`);
    console.log(`Erros: ${result.errors}`);
    console.log(`Timeouts: ${result.timeouts}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});