export function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate);

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface Reading {
  datetime: string;
  value: number;
}

interface ForecastPoint {
  datetime: string;
  label: string;
  forecast: number;
}

export function computeForecast(readings: Reading[], daysAhead: number): ForecastPoint[] {
  if (readings.length < 2) return [];

  const dayMs = 24 * 60 * 60 * 1000;
  const t0 = new Date(readings[0].datetime).getTime();

  const xs = readings.map((r) => (new Date(r.datetime).getTime() - t0) / dayMs);
  const ys = readings.map((r) => r.value);
  const n = xs.length;

  const sumX = xs.reduce((acc, x) => acc + x, 0);
  const sumY = ys.reduce((acc, y) => acc + y, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return [];

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const lastTimestamp = new Date(readings[n - 1].datetime).getTime();

  return Array.from({ length: daysAhead }, (_, i) => {
    const futureTimestamp = lastTimestamp + (i + 1) * dayMs;
    const x = (futureTimestamp - t0) / dayMs;
    const predicted = slope * x + intercept;
    const isoDate = new Date(futureTimestamp).toISOString();

    return {
      datetime: isoDate,
      label: formatDateLabel(isoDate),
      forecast: predicted,
    };
  });
}