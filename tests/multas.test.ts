import { describe, expect, it } from 'vitest';
import { calcularMulta, type TipoMaterial } from '../src/services/multas.ts';

describe('calcularMulta', () => {
  it('no cobra multa si no hay atraso', () => {
    expect(calcularMulta(0, 'dvd')).toBe(0);
  });

  it('no cobra multa dentro de los días de gracia', () => {
    expect(calcularMulta(2, 'libro')).toBe(0);
  });

  it('cobra solo los días que exceden la gracia', () => {
    // 5 días de atraso - 2 de gracia = 3 días a $200
    expect(calcularMulta(5, 'libro')).toBe(600);
  });

  // EJERCICIO 3: reemplazá cada it.todo por una prueba real.
  it('caso 1: 3 días de una revista cuesta 100', () => {
    expect(calcularMulta(3, 'revista')).toBe(100)
  });

  it('caso 2: 27 días de un libro cuesta exactamente 5000', () => {
    expect(calcularMulta(27, 'libro')).toBe(5000)
  });

  it('caso 3: 40 días de un dvd queda topeado en 5000', () => {
    expect(calcularMulta(40, 'dvd')).toBe(5000)
  });

  it('caso 4: -1 día lanza RangeError', () => {
    expect(() => calcularMulta(-1, 'libro')).toThrow(RangeError)
  });

  it('caso 5: 2.5 días lanza RangeError', () => {
    expect(() => calcularMulta(2.5, 'libro')).toThrow(RangeError)
  });

  it('caso 6: 366 días lanza RangeError', () => {
    expect(() => calcularMulta(366, 'revista')).toThrow(RangeError)
  });

  it('caso 7: días como texto ("tres") lanza TypeError', () => {
    expect(() => calcularMulta("tres" as unknown as number, 'libro')).toThrow(TypeError)
  });

  it('caso 8 (desafío): tipo "toString" lanza RangeError', () => {
    expect(() => calcularMulta(5, 'toString' as TipoMaterial)).toThrow(RangeError)
  });
});
