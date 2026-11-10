export type TipoMaterial = 'libro' | 'revista' | 'dvd';

/** Tarifa por cada día de atraso según el tipo de material, en pesos. */
export const TARIFA_DIARIA: Record<TipoMaterial, number> = {
  libro: 200,
  revista: 100,
  dvd: 500,
};

export const DIAS_GRACIA = 2;
export const MULTA_MAXIMA = 5000;
export const DIAS_ATRASO_MAXIMO = 365;

/**
 * Calcula la multa por devolver un material con atraso.
 *
 * Regla: los primeros 2 días de atraso son de gracia (no se cobran).
 * Se cobra la tarifa diaria del material solo por los días que exceden la gracia.
 * La multa de un préstamo nunca supera $5.000.
 */
export function calcularMulta(diasAtraso: number, tipo: TipoMaterial): number {

  if (typeof diasAtraso !== "number") {
    throw new TypeError("Los dias de atraso deben ser un number")
  }

  if (!Number.isInteger(diasAtraso) || diasAtraso < 0 || diasAtraso > DIAS_ATRASO_MAXIMO) {
    throw new RangeError("Los dias deben ser enteros entre 0 y 365")
  }

  if (!Object.hasOwn(TARIFA_DIARIA, tipo)) {
    throw new RangeError("Este tipo no esta permitido")
  }

  if (diasAtraso <= DIAS_GRACIA) {
    return 0;
  }

  // 1
  const multa = (diasAtraso - DIAS_GRACIA) * TARIFA_DIARIA[tipo];
  // 2: Math.min devuelve el menor valor, así la multa no supera MULTA_MAXIMA
  return Math.min(multa, MULTA_MAXIMA)
}
