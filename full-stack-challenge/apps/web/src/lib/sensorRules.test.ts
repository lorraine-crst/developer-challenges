import { describe, expect, it } from 'vitest';
import { isSensorModelRestricted } from './sensorRules';

describe('isSensorModelRestricted', () => {
  it('restricts TcAg on a Bomba', () => {
    expect(isSensorModelRestricted('Bomba', 'TcAg')).toBe(true);
  });

  it('restricts TcAs on a Bomba', () => {
    expect(isSensorModelRestricted('Bomba', 'TcAs')).toBe(true);
  });

  it('does not restrict HF+ on a Bomba', () => {
    expect(isSensorModelRestricted('Bomba', 'HF+')).toBe(false);
  });

  it('does not restrict any model on a Ventilador', () => {
    expect(isSensorModelRestricted('Ventilador', 'TcAg')).toBe(false);
  });
});