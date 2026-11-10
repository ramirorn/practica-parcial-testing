import { calcularMulta, type TipoMaterial } from './multas.ts';
import { aplicarDescuento, type Categoria } from './socios.ts';

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
export function resumirDevolucion(devolucion: Devolucion): ResumenDevolucion {
  // 1
  if (devolucion.prestamos.length === 0) {
    throw new RangeError("Los prestamos no deben estar vacios")
  }

  // 2
  let multaBruta = 0;
  for (const prestamo of devolucion.prestamos) {
    multaBruta += calcularMulta(prestamo.diasAtraso, prestamo.tipo);
  }

  let multaFinal = aplicarDescuento(multaBruta, devolucion.categoria);

  let descuento = multaBruta - multaFinal;

  const bloqueado = (multaFinal >= UMBRAL_BLOQUEO) || (devolucion.prestamos.some((prestamo) => prestamo.diasAtraso > DIAS_ATRASO_BLOQUEO));

  return { multaBruta, descuento, multaFinal, bloqueado }
}
