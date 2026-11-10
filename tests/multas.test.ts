import { describe, expect, it } from 'vitest';
import { calcularMulta } from '../src/services/multas.ts';

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
  it.todo('caso 1: 3 días de una revista cuesta 100');
  it.todo('caso 2: 27 días de un libro cuesta exactamente 5000');
  it.todo('caso 3: 40 días de un dvd queda topeado en 5000');
  it.todo('caso 4: -1 día lanza RangeError');
  it.todo('caso 5: 2.5 días lanza RangeError');
  it.todo('caso 6: 366 días lanza RangeError');
  it.todo('caso 7: días como texto ("tres") lanza TypeError');
  it.todo('caso 8 (desafío): tipo "toString" lanza RangeError');
});
