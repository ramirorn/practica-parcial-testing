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
  if (diasAtraso <= DIAS_GRACIA) {
    return 0;
  }
  return diasAtraso * TARIFA_DIARIA[tipo];
}
