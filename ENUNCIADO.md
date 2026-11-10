# Práctica de parcial: testing en Express + TypeScript

**Taller de Lenguajes de Programación IV · Unidad 4 · Simulacro**

| | |
| --- | --- |
| **Duración** | 90 minutos |
| **Puntaje** | 100 puntos (+5 de bonus) |
| **Herramientas** | [Vitest](https://vitest.dev/guide/), [Supertest](https://github.com/ladjs/supertest), TypeScript |
| **Material permitido** | Tus apuntes y la documentación oficial. Para que sirva de simulacro, **no uses IA**. |

> Poné un cronómetro de 90 minutos. Si te trabás en un ejercicio, pasá al siguiente: los ejercicios 3, 4 y 5 se pueden hacer en cualquier orden (el 5 sale más fácil si ya hiciste el 2).

---

## Contexto

Recibís la API de una **biblioteca** que cobra multas cuando un socio devuelve material con atraso. Tiene tres archivos de lógica:

| Archivo | Qué hace | Estado |
| --- | --- | --- |
| `src/services/socios.ts` | Aplica el descuento según la categoría del socio | Correcto |
| `src/services/multas.ts` | Calcula la multa de **un** préstamo | **Tiene errores** |
| `src/services/prestamos.ts` | Resume la devolución de **varios** préstamos | **Sin hacer** |

### Rutas HTTP (`src/app.ts`)

| Método | Ruta | Cuerpo | Respuesta OK |
| --- | --- | --- | --- |
| `GET` | `/health` | – | `200 {"estado":"ok"}` |
| `POST` | `/api/socios/descuento` | `{monto, categoria}` | `200 {"total": n}` |
| `POST` | `/api/multas/calcular` | `{diasAtraso, tipo}` | `200 {"multa": n}` |

Si el servicio lanza `RangeError` o `TypeError`, la ruta responde **`400`** con `{"error": "..."}`. Ante cualquier otro error, **`500`**.

### Regla 1: descuento por categoría de socio (ya funciona)

| Categoría | Descuento |
| --- | --- |
| `general` | 0 % |
| `estudiante` | 50 % |
| `jubilado` | 25 % |

### Regla 2: multa de un préstamo

- **Tarifa por día de atraso:** `libro` = $200, `revista` = $100, `dvd` = $500.
- Los **primeros 2 días de atraso son de gracia**: no se cobran.
- Se cobra la tarifa **solo por los días que pasan de esos 2**.
  Ejemplo: un libro con 5 días de atraso paga 3 días → 3 × $200 = **$600**.
- La multa de un préstamo **nunca supera $5.000** (tope).

Validaciones de `calcularMulta(diasAtraso, tipo)`:

| Situación | Error que debe lanzar |
| --- | --- |
| `diasAtraso` no es de tipo `number` | `TypeError` |
| `diasAtraso` no es entero, o es `< 0`, o es `> 365` | `RangeError` |
| `tipo` no es `libro`, `revista` ni `dvd` | `RangeError` |

### Regla 3: resumen de una devolución

`resumirDevolucion({ prestamos, categoria })` devuelve `{ multaBruta, descuento, multaFinal, bloqueado }`:

1. Si `prestamos` está vacío → `RangeError`.
2. `multaBruta` = suma de `calcularMulta(...)` de cada préstamo.
3. `multaFinal` = `aplicarDescuento(multaBruta, categoria)`.
4. `descuento` = `multaBruta − multaFinal`.
5. `bloqueado` = `true` si **`multaFinal >= 3000`** **o** si algún préstamo tiene **más de 30 días** de atraso. Si no, `false`.

**Reutilizá** `calcularMulta` y `aplicarDescuento`: no copies sus reglas.

---

## Preparación (no cuenta en el tiempo)

```bash
node --version   # 22.18 o superior
npm install
```

Las respuestas escritas van en **`RESPUESTAS.md`**.

**Reglas generales**

- No modifiques `package.json`, `tsconfig.json` ni `tests/prestamos.test.ts`.
- No borres ni comentes pruebas para que pasen.
- Al terminar, `npm test` y `npm run typecheck` deben pasar sin errores.

---

## Ejercicio 1: Diagnóstico (10 min · 10 pts)

1. Ejecutá `npm test` **sin tocar nada**. Completá en `RESPUESTAS.md` cuántas pruebas pasan, fallan y quedan `todo` en cada archivo. (2 pts)
2. Las fallas son de **dos tipos distintos**. Decí en qué archivo ocurre cada tipo y **por qué** falla. Todavía no corrijas nada. (6 pts)
3. ¿Qué significa que una prueba aparezca como `todo`? ¿Por qué no cuenta como falla? (2 pts)

## Ejercicio 2: Corregir `calcularMulta` (15 min · 20 pts)

Modificá **solo** `src/services/multas.ts`:

1. Corregí el error de cálculo que muestra la prueba que falla en `tests/multas.test.ts`. (6 pts)
2. Hay **un segundo error de cálculo** que ninguna prueba detecta todavía. Encontralo comparando el código con la Regla 2 y corregilo. (4 pts)
3. Agregá todas las validaciones de la tabla de la Regla 2. (10 pts)

> Pistas: `typeof`, `Number.isInteger`, `Math.min`. Probá qué devuelve `TARIFA_DIARIA['toString']`: los objetos tienen propiedades heredadas. Investigá `Object.hasOwn`.

## Ejercicio 3: Pruebas unitarias (15 min · 20 pts)

En `tests/multas.test.ts`, reemplazá cada `it.todo` por una prueba real (2,5 pts cada una):

| Caso | `diasAtraso` | `tipo` | Resultado esperado |
| --- | --- | --- | --- |
| 1 | `3` | `'revista'` | `100` |
| 2 | `27` | `'libro'` | `5000` (justo en el tope) |
| 3 | `40` | `'dvd'` | `5000` (se aplica el tope) |
| 4 | `-1` | `'libro'` | lanza `RangeError` |
| 5 | `2.5` | `'libro'` | lanza `RangeError` |
| 6 | `366` | `'revista'` | lanza `RangeError` |
| 7 | `'tres'` (texto) | `'libro'` | lanza `TypeError` |
| 8 (desafío) | `5` | `'toString'` | lanza `RangeError` |

> Los casos 7 y 8 usan valores que TypeScript no permite. Escribilos **sin romper `npm run typecheck`** (ver Ejercicio 6).

## Ejercicio 4: Pruebas de integración con Supertest (15 min · 20 pts)

En `tests/api.test.ts`, reemplazá cada `it.todo` por una prueba con `request(app)` (4 pts cada una):

- **a.** `POST /api/multas/calcular` con `{ diasAtraso: 4, tipo: 'dvd' }` → status `200` y cuerpo `{ multa: 1000 }`.
- **b.** Con `diasAtraso: -3` → status `400` y el cuerpo tiene la propiedad `error`.
- **c.** Con `tipo: 'comic'` → status `400` y el cuerpo tiene la propiedad `error`.
- **d.** Con `diasAtraso: '5'` (texto, entre comillas) → status `400`.
- **e.** `GET /ruta-inexistente` → status `404`.

## Ejercicio 5: TDD (15 min · 15 pts)

Las pruebas de `tests/prestamos.test.ts` **ya están escritas y no se tocan**. Implementá `resumirDevolucion` en `src/services/prestamos.ts` siguiendo la Regla 3 hasta que todas pasen.

Puntaje proporcional a las pruebas en verde (10 pruebas).

## Ejercicio 6: Verificación de tipos (5 min · 5 pts)

1. Ejecutá `npm run typecheck` **al empezar** y copiá el error en `RESPUESTAS.md`. (1 pt)
2. Explicá por qué aparece ese error aunque `npm test` pase esa prueba. (2 pts)
3. Corregilo **sin borrar la prueba ni cambiar lo que verifica**. Al final, `npm run typecheck` debe dar cero errores, incluidas tus pruebas de los ejercicios 3 y 4. (2 pts)

## Ejercicio 7: Preguntas teóricas (10 min · 10 pts)

Respondé en `RESPUESTAS.md` (2 pts cada una, máximo 4 líneas):

1. ¿Qué diferencia hay entre una prueba unitaria y una de integración? Clasificá `tests/multas.test.ts` y `tests/api.test.ts`. ¿Por qué `request(app)` no necesita levantar el servidor en el puerto 3000?
2. ¿Por qué se escribe `expect(() => calcularMulta(-1, 'libro')).toThrow(RangeError)` con una función flecha y no `expect(calcularMulta(-1, 'libro')).toThrow(RangeError)`?
3. ¿Qué es un valor frontera? Dá dos ejemplos de esta práctica y qué error podría descubrir cada uno.
4. Describí el ciclo de TDD (rojo → verde → refactor). ¿Qué hiciste en cada fase durante el Ejercicio 5?
5. En `src/app.ts`, los errores `RangeError` y `TypeError` responden `400` y los demás `500`. ¿Por qué se distinguen? ¿Qué le pasaría al cliente si todo respondiera `500`?

## Bonus: Cobertura (5 min · +5 pts)

Ejecutá `npm run test:coverage` y mirá la fila de `src/app.ts`. La columna `Uncovered Line #s` te dice qué líneas no ejecutó ningún test.

1. Agregá en `tests/api.test.ts` una prueba que cubra las líneas que faltan de la ruta `/api/socios/descuento`. (3 pts)
2. Las líneas de la respuesta `500` van a seguir sin cubrir. Explicá en `RESPUESTAS.md` por qué ninguna petición puede llegar ahí. (1 pt)
3. Explicá en una línea qué te dice (y qué **no** te dice) un 100 % de cobertura. (1 pt)

---

## Entrega

1. `npm test` en verde y `npm run typecheck` sin errores.
2. `RESPUESTAS.md` completo.
3. Carpeta comprimida **sin `node_modules`** ni `coverage`.

## Autoevaluación

| Ejercicio | Puntos | Tus puntos |
| --- | --- | --- |
| 1. Diagnóstico | 10 | |
| 2. Corregir `calcularMulta` | 20 | |
| 3. Pruebas unitarias | 20 | |
| 4. Integración con Supertest | 20 | |
| 5. TDD de `resumirDevolucion` | 15 | |
| 6. Verificación de tipos | 5 | |
| 7. Teoría | 10 | |
| **Total** | **100** | |
| Bonus: cobertura | +5 | |

Aprobación sugerida: 60 puntos.
