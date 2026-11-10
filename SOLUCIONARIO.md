# Solucionario

> ⚠️ **No lo abras hasta terminar los 90 minutos.** Usalo para corregirte con la tabla de autoevaluación del enunciado.

---

## Ejercicio 1: Diagnóstico

### 1.1 Resultado inicial

| Archivo | Pasan | Fallan | Todo |
| --- | --- | --- | --- |
| `tests/socios.test.ts` | 5 | 0 | 0 |
| `tests/multas.test.ts` | 2 | 1 | 8 |
| `tests/api.test.ts` | 3 | 0 | 5 |
| `tests/prestamos.test.ts` | 0 | 10 | 0 |
| **Total** | **10** | **11** | **13** |

### 1.2 Los dos tipos de falla

- **Tipo 1: error de lógica (`tests/multas.test.ts`).** El código corre, pero devuelve un valor incorrecto: esperaba `600` y recibió `1000`. `calcularMulta` multiplica **todos** los días de atraso (5 × 200) en vez de restar primero los 2 días de gracia ((5 − 2) × 200).
- **Tipo 2: código sin hacer (`tests/prestamos.test.ts`).** `resumirDevolucion` lanza `Error('No implementado')`, así que fallan las 10 pruebas. Incluso las que esperan una excepción fallan, porque esperan un `RangeError` y reciben un `Error` común.

### 1.3 ¿Qué es un `todo`?

Es una prueba anotada pero todavía no escrita: tiene nombre y no tiene cuerpo. Vitest no la ejecuta, así que no puede fallar. Sirve como recordatorio de lo que falta probar.

---

## Ejercicio 2: `src/services/multas.ts` corregido

```ts
export function calcularMulta(diasAtraso: number, tipo: TipoMaterial): number {
  if (typeof diasAtraso !== 'number') {
    throw new TypeError('diasAtraso debe ser un número');
  }
  if (!Number.isInteger(diasAtraso) || diasAtraso < 0 || diasAtraso > DIAS_ATRASO_MAXIMO) {
    throw new RangeError(`diasAtraso debe ser un entero entre 0 y ${DIAS_ATRASO_MAXIMO}`);
  }
  if (!Object.hasOwn(TARIFA_DIARIA, tipo)) {
    throw new RangeError('El tipo de material no es válido');
  }

  if (diasAtraso <= DIAS_GRACIA) {
    return 0;
  }
  const multa = (diasAtraso - DIAS_GRACIA) * TARIFA_DIARIA[tipo]; // error 1: faltaba restar la gracia
  return Math.min(multa, MULTA_MAXIMA);                            // error 2: faltaba el tope
}
```

Qué tener en cuenta:

- **El orden de las validaciones importa.** Primero el tipo de dato (`TypeError`), después el rango (`RangeError`).
- `Number.isInteger` devuelve `false` para `NaN`, `Infinity` y `2.5`. Con una sola llamada cubrís tres casos.
- **¿Por qué `Object.hasOwn`?** `TARIFA_DIARIA['toString']` existe, porque todo objeto lo hereda. Sin esta validación, `5 * función` da `NaN` y la función devuelve `NaN` en lugar de lanzar un error. `'toString' in TARIFA_DIARIA` también da `true`. `Object.hasOwn` solo mira las propiedades propias del objeto.
- **El error 2 (el tope)** no lo detectaba ningún test. Por eso hacen falta los casos 2 y 3 del ejercicio 3.

---

## Ejercicio 3: `tests/multas.test.ts`

Cambiá el import para traer también el tipo:

```ts
import { calcularMulta, type TipoMaterial } from '../src/services/multas.ts';
```

Y reemplazá los `it.todo`:

```ts
it('caso 1: 3 días de una revista cuesta 100', () => {
  expect(calcularMulta(3, 'revista')).toBe(100);
});

it('caso 2: 27 días de un libro cuesta exactamente 5000', () => {
  expect(calcularMulta(27, 'libro')).toBe(5000);
});

it('caso 3: 40 días de un dvd queda topeado en 5000', () => {
  expect(calcularMulta(40, 'dvd')).toBe(5000);
});

it('caso 4: -1 día lanza RangeError', () => {
  expect(() => calcularMulta(-1, 'libro')).toThrow(RangeError);
});

it('caso 5: 2.5 días lanza RangeError', () => {
  expect(() => calcularMulta(2.5, 'libro')).toThrow(RangeError);
});

it('caso 6: 366 días lanza RangeError', () => {
  expect(() => calcularMulta(366, 'revista')).toThrow(RangeError);
});

it('caso 7: días como texto ("tres") lanza TypeError', () => {
  expect(() => calcularMulta('tres' as unknown as number, 'libro')).toThrow(TypeError);
});

it('caso 8 (desafío): tipo "toString" lanza RangeError', () => {
  expect(() => calcularMulta(5, 'toString' as TipoMaterial)).toThrow(RangeError);
});
```

> En el caso 7 hace falta `as unknown as number`: TypeScript no deja convertir `string` en `number` directamente porque no tienen nada en común. En el caso 8 alcanza `as TipoMaterial`, porque los dos son textos.
>
> Otra forma válida es poner `// @ts-expect-error` en la línea anterior a la llamada.

---

## Ejercicio 4: `tests/api.test.ts`

```ts
describe('POST /api/multas/calcular', () => {
  it('a: 4 días de un dvd responde 200 con multa 1000', async () => {
    const respuesta = await request(app)
      .post('/api/multas/calcular')
      .send({ diasAtraso: 4, tipo: 'dvd' });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ multa: 1000 });
  });

  it('b: -3 días responde 400 con un campo error', async () => {
    const respuesta = await request(app)
      .post('/api/multas/calcular')
      .send({ diasAtraso: -3, tipo: 'libro' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toHaveProperty('error');
  });

  it('c: tipo "comic" responde 400 con un campo error', async () => {
    const respuesta = await request(app)
      .post('/api/multas/calcular')
      .send({ diasAtraso: 5, tipo: 'comic' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toHaveProperty('error');
  });

  it('d: diasAtraso enviado como texto "5" responde 400', async () => {
    const respuesta = await request(app)
      .post('/api/multas/calcular')
      .send({ diasAtraso: '5', tipo: 'libro' });
    expect(respuesta.status).toBe(400);
  });
});

it('e: una ruta inexistente responde 404', async () => {
  const respuesta = await request(app).get('/ruta-inexistente');
  expect(respuesta.status).toBe(404);
});
```

> **Caso d:** JSON respeta los tipos. `"5"` llega al servidor como texto, no como número, así que `calcularMulta` lanza `TypeError` y la ruta responde `400`. Si no corregiste el ejercicio 2, este test falla: devuelve `200` con una multa calculada sobre texto.
>
> **Acá no hace falta `as`:** `.send()` acepta cualquier objeto, así que TypeScript no se queja.

---

## Ejercicio 5: `src/services/prestamos.ts`

Agregá los imports al principio del archivo:

```ts
import { calcularMulta } from './multas.ts';
import { aplicarDescuento } from './socios.ts';
```

Y reemplazá la función:

```ts
export function resumirDevolucion({ prestamos, categoria }: Devolucion): ResumenDevolucion {
  if (prestamos.length === 0) {
    throw new RangeError('La devolución debe incluir al menos un préstamo');
  }

  const multaBruta = prestamos.reduce(
    (total, prestamo) => total + calcularMulta(prestamo.diasAtraso, prestamo.tipo),
    0,
  );
  const multaFinal = aplicarDescuento(multaBruta, categoria);
  const bloqueado =
    multaFinal >= UMBRAL_BLOQUEO ||
    prestamos.some((prestamo) => prestamo.diasAtraso > DIAS_ATRASO_BLOQUEO);

  return {
    multaBruta,
    descuento: multaBruta - multaFinal,
    multaFinal,
    bloqueado,
  };
}
```

Errores comunes:

- Usar `>` en vez de `>=` para el umbral. Falla el test de "exactamente $3.000".
- Usar `>=` en vez de `>` para los días. Falla el test de "30 días exactos".
- Decidir el bloqueo con `multaBruta` en vez de `multaFinal`.
- Copiar las tarifas en lugar de llamar a `calcularMulta`. Así se pierden el tope y las validaciones, y falla el test que espera que se propague el error.

---

## Ejercicio 6: Verificación de tipos

### 6.1 Error inicial

```text
tests/socios.test.ts(22,41): error TS2345: Argument of type '"vip"' is not assignable to parameter of type 'Categoria'.
```

### 6.2 ¿Por qué `npm test` pasa igual?

Vitest **no revisa los tipos**: le borra los tipos al código y lo ejecuta como JavaScript. Al ejecutarse, `'vip'` es un texto cualquiera y la función lanza `RangeError` como se espera. El que revisa los tipos es `tsc`, y por eso solo lo detecta `npm run typecheck`.

### 6.3 Corrección

```ts
import { aplicarDescuento, type Categoria } from '../src/services/socios.ts';
// ...
expect(() => aplicarDescuento(1000, 'vip' as Categoria)).toThrow(RangeError);
```

La prueba sigue verificando lo mismo. Solo le avisamos a TypeScript que el valor inválido se pasa **a propósito**.

---

## Ejercicio 7: Teoría (respuestas modelo)

1. **Unitaria vs integración.** Una prueba unitaria revisa una pieza sola, como una función. Una de integración revisa varias piezas funcionando juntas. `multas.test.ts` es unitaria porque llama a la función directamente. `api.test.ts` es de integración porque pasa por HTTP, Express, la ruta y el servicio. `request(app)` no necesita el puerto 3000 porque Supertest levanta la app en un puerto temporal solo durante la prueba. Para eso `app.ts` exporta la app sin llamar a `listen`; el `listen` está en `server.ts`.

2. **Función flecha en `toThrow`.** Sin la flecha, `calcularMulta(-1, ...)` se ejecuta **antes** de llegar a `expect`. El error salta ahí, fuera del control de Vitest, y el test se rompe. Con la flecha, le pasás a `expect` una función que **todavía no se ejecutó**. Así Vitest puede llamarla, atrapar el error y comprobar de qué tipo es.

3. **Valor frontera.** Es el valor justo en el borde de una regla, donde suelen aparecer errores como confundir `<` con `<=`. Ejemplos de esta práctica:
   - **2 días de atraso** (último día de gracia): detecta si se cobra un día que no corresponde.
   - **27 días de libro = $5.000 justos**: detecta un tope mal aplicado.
   - **Multa final de $3.000**: detecta `>` en lugar de `>=` en el bloqueo.
   - **30 días de atraso**: detecta `>=` en lugar de `>` en el bloqueo por días.

4. **Ciclo de TDD.**
   - **Rojo:** escribís un test que falla. En el ejercicio 5 ya estaban escritos y fallaban por "No implementado".
   - **Verde:** escribís el código mínimo para que pase, por ejemplo primero la validación de lista vacía y después la suma.
   - **Refactor:** mejorás el código sin cambiar lo que hace, con los tests como red de seguridad. Por ejemplo, reemplazar un `for` por `reduce` o usar las constantes `UMBRAL_BLOQUEO` y `DIAS_ATRASO_BLOQUEO` en vez de escribir los números a mano.

5. **400 vs 500.** `400` significa "el error es tuyo": el cliente mandó datos inválidos y puede corregirlos y reintentar. `500` significa "el error es del servidor": algo falló adentro y el cliente no puede hacer nada. Si todo respondiera `500`, el cliente no sabría si tiene que corregir su petición o esperar a que arreglen el servidor, y el mensaje de error (por ejemplo, "días inválidos") no le llegaría.

---

## Bonus: Cobertura

### 1. Prueba que falta (en `tests/api.test.ts`)

Antes de agregarla, `src/app.ts` muestra como no cubiertas las líneas `13-14` (respuesta `500`) y `26-27` (el `catch` de `/api/socios/descuento`).

```ts
it('responde 400 si la categoría del descuento no existe', async () => {
  const respuesta = await request(app)
    .post('/api/socios/descuento')
    .send({ monto: 100, categoria: 'vip' });
  expect(respuesta.status).toBe(400);
  expect(respuesta.body).toHaveProperty('error');
});
```

Después, solo quedan sin cubrir las líneas `13-14`.

### 2. ¿Por qué no se puede llegar al `500`?

Los servicios solo lanzan `RangeError` o `TypeError`, y esos errores responden `400`. Ningún dato que mande el cliente hace que lancen otro tipo de error, así que la rama del `500` no se ejecuta en ningún test. Existe por las dudas, para un error inesperado (un bug futuro, una falla de una dependencia).

### 3. Qué dice y qué no dice un 100 %

**Qué dice:** que cada línea se ejecutó al menos una vez durante los tests.
**Qué no dice:** que el código esté bien. Una línea puede ejecutarse con un test que no verifica nada útil, y siguen pudiendo faltar casos frontera. Por eso apuntar a la cobertura sirve como guía, no como garantía.
