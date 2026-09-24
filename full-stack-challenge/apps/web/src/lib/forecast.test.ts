import { describe, expect, it } from 'vitest';
import { computeForecast, formatDateLabel } from './forecast';

describe('formatDateLabel', () => {
  it('formats an ISO date as dd/mm in pt-BR', () => {
    expect(formatDateLabel('2024-01-04T12:00:00.000Z')).toBe('04/01');
  });
});

describe('computeForecast', () => {
  it('returns an empty array with fewer than 2 readings', () => {
    expect(computeForecast([], 7)).toEqual([]);
    expect(computeForecast([{ datetime: '2024-01-01T12:00:00.000Z', value: 10 }], 7)).toEqual([]);
  });

  it('returns an empty array when all readings share the same timestamp', () => {
    const readings = [
      { datetime: '2024-01-01T12:00:00.000Z', value: 10 },
      { datetime: '2024-01-01T12:00:00.000Z', value: 20 },
    ];

    expect(computeForecast(readings, 7)).toEqual([]);
  });

  it('projects a linear trend forward, one point per day', () => {
    const readings = [
      { datetime: '2024-01-01T12:00:00.000Z', value: 10 },
      { datetime: '2024-01-02T12:00:00.000Z', value: 12 },
      { datetime: '2024-01-03T12:00:00.000Z', value: 14 },
    ];

    const forecast = computeForecast(readings, 3);

    expect(forecast).toHaveLength(3);
    expect(forecast.map((point) => point.forecast)).toEqual([16, 18, 20]);
    expect(forecast[0].datetime).toBe('2024-01-04T12:00:00.000Z');
    expect(forecast[0].label).toBe('04/01');
  });

  it('keeps a flat forecast for a constant series', () => {
    const readings = [
      { datetime: '2024-01-01T12:00:00.000Z', value: 25 },
      { datetime: '2024-01-02T12:00:00.000Z', value: 25 },
    ];

    const forecast = computeForecast(readings, 5);

    expect(forecast.every((point) => point.forecast === 25)).toBe(true);
  });

  it('respects the requested number of days ahead', () => {
    const readings = [
      { datetime: '2024-01-01T12:00:00.000Z', value: 1 },
      { datetime: '2024-01-02T12:00:00.000Z', value: 2 },
    ];

    expect(computeForecast(readings, 10)).toHaveLength(10);
  });
});