import type { TipoMaterial } from './multas.ts';
import type { Categoria } from './socios.ts';

export interface Prestamo {
  tipo: TipoMaterial;
  diasAtraso: number;
}

export interface Devolucion {
  prestamos: Prestamo[];
  categoria: Categoria;
}

export interface ResumenDevolucion {
  multaBruta: number;
  descuento: number;
  multaFinal: number;
  bloqueado: boolean;
}

/** Multa final (con descuento) desde la cual el socio queda bloqueado. */
export const UMBRAL_BLOQUEO = 3000;

/** Si algún préstamo supera estos días de atraso, el socio queda bloqueado. */
export const DIAS_ATRASO_BLOQUEO = 30;

/**
 * EJERCICIO 5: implementá esta función siguiendo las reglas del ENUNCIADO.
 * Las pruebas de tests/prestamos.test.ts ya están escritas: no las modifiques.
 */
export function resumirDevolucion(_devolucion: Devolucion): ResumenDevolucion {
  throw new Error('No implementado');
}
