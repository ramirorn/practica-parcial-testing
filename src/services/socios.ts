export type Categoria = 'general' | 'estudiante' | 'jubilado';

/** Porcentaje de descuento sobre la multa según la categoría del socio. */
export const DESCUENTO_CATEGORIA: Record<Categoria, number> = {
  general: 0,
  estudiante: 50,
  jubilado: 25,
};

const CATEGORIAS_VALIDAS = Object.keys(DESCUENTO_CATEGORIA);

/** Aplica al monto el descuento que corresponde a la categoría del socio. */
export function aplicarDescuento(monto: number, categoria: Categoria): number {
  if (!Number.isFinite(monto) || monto < 0) {
    throw new RangeError('El monto debe ser un número finito mayor o igual a 0');
  }
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw new RangeError('La categoría del socio no es válida');
  }

  return monto - (monto * DESCUENTO_CATEGORIA[categoria]) / 100;
}
