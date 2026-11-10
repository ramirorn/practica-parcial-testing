# Respuestas

**Nombre:**

## Ejercicio 1: Diagnóstico

### 1.1 Resultado inicial de `npm test`

| Archivo                   | Pasan | Fallan | Todo |
| ------------------------- | ----- | ------ | ---- |
| `tests/socios.test.ts`    | 5     | 0      | 0    |
| `tests/multas.test.ts`    | 2     | 1      | 8    |
| `tests/api.test.ts`       | 3     | 0      | 5    |
| `tests/prestamos.test.ts` | 0     | 10     | 0    |

### 1.2 Tipos de falla

- **Tipo 1: error de lógica (`tests/multas.test.ts`).** La función existe y funciona, pero hace mal la cuenta. Es como una calculadora que suma mal: te da un número, pero no el correcto. El test esperaba `600` y recibió `1000`, porque `calcularMulta` cobra los 5 días de atraso en vez de restar primero los 2 días de gracia (debería ser `(5 − 2) × 200`).
- **Tipo 2: función sin hacer (`tests/prestamos.test.ts`).** `resumirDevolucion` no calcula nada: solo lanza `Error('No implementado')`. Es como un local con el cartel "próximamente": todavía no atiende. Por eso fallan las 10 pruebas, incluso las que esperan un error, porque esperan un `RangeError` y reciben un `Error` común.

### 1.3 ¿Qué es un `todo`?

Es un test anotado pero todavía no escrito: tiene nombre y no tiene código. Funciona como una lista de pendientes. Vitest no lo ejecuta, así que no puede fallar; solo lo muestra en el resumen para que no te olvides de que falta.

## Ejercicio 6: Verificación de tipos

### 6.1 Error inicial

```text
tests/socios.test.ts(22,41): error TS2345: Argument of type '"vip"' is not assignable to parameter of type 'Categoria'.
```

### 6.2 ¿Por qué `npm test` pasa igual?

Vitest y TypeScript revisan cosas distintas. Vitest **ejecuta** el código: le borra los tipos y lo corre como JavaScript. Ahí `'vip'` es un texto cualquiera, la función lanza `RangeError` y el test pasa. TypeScript (`tsc`) **no ejecuta nada**: solo lee el código y revisa que cada valor sea del tipo correcto, y `'vip'` no es una `Categoria`. Es como un auto que anda perfecto pero no pasa la inspección técnica porque le falta un papel: funciona, pero no cumple las reglas.

## Ejercicio 7: Teoría

1. **Unitaria vs integración.** Una prueba unitaria revisa **una pieza sola**, como probar un foco suelto. Una de integración revisa **varias piezas trabajando juntas**, como probar que al tocar el interruptor se prende la luz. `multas.test.ts` es unitaria: llama a la función directamente. `api.test.ts` es de integración: pasa por HTTP, Express, la ruta y el servicio. `request(app)` no necesita el puerto 3000 porque Supertest levanta la app en un puerto temporal solo durante el test; por eso `app.ts` exporta la app sin `listen` (el `listen` está en `server.ts`).

2. **Flecha en `toThrow`.** Sin la flecha, la función se ejecuta **antes** de llegar a `expect`, el error salta ahí y el test se cae sin que `toThrow` lo pueda atrapar. Con la flecha, le das a `expect` una función **todavía sin ejecutar**, y `toThrow` la llama en un lugar seguro y revisa el error. Es como entregar una bomba: sin la flecha explota en tus manos; con la flecha se la das a Vitest y él la detona controladamente.

3. **Valor frontera.** Es el valor justo en el borde de una regla, como la línea de un arco en el fútbol: ahí es donde se discute si fue gol o no. Es donde más errores aparecen, por confundir `<` con `<=`. Ejemplos: **2 días de atraso** (último día de gracia) detecta si se cobra un día que no corresponde; **multa final de 3000** detecta si se usó `>` en vez de `>=` para el bloqueo. Otros: 30 días (bloqueo por días) y 27 días de libro (justo el tope de $5.000).

4. **Ciclo de TDD.** Es como armar un mueble con el instructivo al lado. **Rojo:** el test falla porque todavía no hay código; en el ejercicio 5 fallaban los 10 por "No implementado". **Verde:** escribís lo mínimo para que pase; fui haciendo de a pasos la validación de la lista vacía, la suma con `calcularMulta`, el descuento y el bloqueo, viendo cómo los tests se ponían en verde. **Refactor:** mejorás el código sin cambiar lo que hace, con los tests como red de seguridad; por ejemplo, cambiar `let` por `const` donde la variable no cambia.

5. **400 vs 500.** Es como en un restaurante. `400` es "pediste algo que no está en la carta": el error es del cliente, que puede corregir el pedido y volver a pedir. `500` es "se rompió la cocina": el error es del servidor y el cliente no puede hacer nada. Si todo respondiera `500`, el cliente no sabría si tiene que corregir sus datos o esperar a que arreglen el servidor, y no le llegaría el mensaje que explica qué mandó mal.

## Bonus: Cobertura

- `% Lines` de `src/app.ts` (antes / después): 87,87 % / 93,93 % (agregando el test de `/api/socios/descuento` con categoría inválida).
- ¿Por qué no se puede llegar al `500`? Los servicios solo lanzan `RangeError` o `TypeError`, que responden `400`. Ningún dato que mande el cliente provoca otro tipo de error, así que esa línea no se ejecuta en ningún test. Es como la salida de emergencia de un edificio: existe por si pasa algo inesperado, pero en un día normal nadie la usa.
- Qué dice y qué no dice un 100 %: dice que cada línea se ejecutó al menos una vez durante los tests. No dice que el código esté bien: es como haber pasado por todas las habitaciones de una casa sin revisar si las luces funcionan. Una línea puede ejecutarse con un test que no verifica nada útil.
