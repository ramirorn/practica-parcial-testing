import { describe, expect, it } from 'vitest';
import { aplicarDescuento } from '../src/services/socios.ts';

describe('aplicarDescuento', () => {
  it('aplica 50 % de descuento a un estudiante', () => {
    expect(aplicarDescuento(1000, 'estudiante')).toBe(500);
  });

  it('aplica 25 % de descuento a un jubilado', () => {
    expect(aplicarDescuento(1000, 'jubilado')).toBe(750);
  });

  it('no aplica descuento a la categoría general', () => {
    expect(aplicarDescuento(1000, 'general')).toBe(1000);
  });

  it('rechaza un monto negativo', () => {
    expect(() => aplicarDescuento(-1, 'general')).toThrow(RangeError);
  });

  it('rechaza una categoría inexistente', () => {
    expect(() => aplicarDescuento(1000, 'vip')).toThrow(RangeError);
  });
});
