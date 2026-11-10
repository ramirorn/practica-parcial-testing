// EJERCICIO 5 (TDD): estas pruebas ya están escritas. NO las modifiques.
// Implementá src/services/prestamos.ts hasta que todas pasen.
import { describe, expect, it } from 'vitest';
import { resumirDevolucion } from '../src/services/prestamos.ts';

describe('resumirDevolucion', () => {
  it('un préstamo devuelto a tiempo no genera multa', () => {
    const resumen = resumirDevolucion({
      prestamos: [{ tipo: 'libro', diasAtraso: 0 }],
      categoria: 'general',
    });
    expect(resumen).toEqual({
      multaBruta: 0,
      descuento: 0,
      multaFinal: 0,
      bloqueado: false,
    });
  });

  it('suma las multas de varios préstamos y aplica el descuento de estudiante', () => {
    const resumen = resumirDevolucion({
      prestamos: [
        { tipo: 'libro', diasAtraso: 5 }, // 600
        { tipo: 'dvd', diasAtraso: 4 }, // 1000
      ],
      categoria: 'estudiante',
    });
    expect(resumen).toEqual({
      multaBruta: 1600,
      descuento: 800,
      multaFinal: 800,
      bloqueado: false,
    });
  });

  it('respeta el tope de $5.000 por préstamo y aplica el descuento de jubilado', () => {
    const resumen = resumirDevolucion({
      prestamos: [
        { tipo: 'dvd', diasAtraso: 40 }, // 5000 (tope)
        { tipo: 'libro', diasAtraso: 27 }, // 5000
      ],
      categoria: 'jubilado',
    });
    expect(resumen).toEqual({
      multaBruta: 10000,
      descuento: 2500,
      multaFinal: 7500,
      bloqueado: true,
    });
  });

  it('bloquea al socio cuando la multa final llega exactamente a $3.000', () => {
    const resumen = resumirDevolucion({
      prestamos: [{ tipo: 'dvd', diasAtraso: 8 }], // 3000
      categoria: 'general',
    });
    expect(resumen.multaFinal).toBe(3000);
    expect(resumen.bloqueado).toBe(true);
  });

  it('no bloquea si la multa final queda debajo de $3.000', () => {
    const resumen = resumirDevolucion({
      prestamos: [
        { tipo: 'libro', diasAtraso: 16 }, // 2800
        { tipo: 'revista', diasAtraso: 3 }, // 100
      ],
      categoria: 'general',
    });
    expect(resumen.multaFinal).toBe(2900);
    expect(resumen.bloqueado).toBe(false);
  });

  it('el bloqueo se decide con la multa final, después del descuento', () => {
    const resumen = resumirDevolucion({
      prestamos: [{ tipo: 'dvd', diasAtraso: 10 }], // 4000
      categoria: 'estudiante',
    });
    expect(resumen.multaBruta).toBe(4000);
    expect(resumen.multaFinal).toBe(2000);
    expect(resumen.bloqueado).toBe(false);
  });

  it('bloquea si algún préstamo supera los 30 días de atraso, aunque la multa sea baja', () => {
    const resumen = resumirDevolucion({
      prestamos: [{ tipo: 'revista', diasAtraso: 31 }], // 2900
      categoria: 'estudiante',
    });
    expect(resumen.multaFinal).toBe(1450);
    expect(resumen.bloqueado).toBe(true);
  });

  it('30 días de atraso exactos no bloquean por días', () => {
    const resumen = resumirDevolucion({
      prestamos: [{ tipo: 'revista', diasAtraso: 30 }], // 2800
      categoria: 'estudiante',
    });
    expect(resumen.multaFinal).toBe(1400);
    expect(resumen.bloqueado).toBe(false);
  });

  it('rechaza una devolución sin préstamos', () => {
    expect(() => resumirDevolucion({ prestamos: [], categoria: 'general' })).toThrow(RangeError);
  });

  it('propaga el error de un préstamo inválido', () => {
    expect(() =>
      resumirDevolucion({
        prestamos: [{ tipo: 'libro', diasAtraso: -1 }],
        categoria: 'general',
      }),
    ).toThrow(RangeError);
  });
});
