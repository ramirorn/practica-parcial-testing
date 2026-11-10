import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.ts';

describe('API', () => {
  it('responde al chequeo de salud', async () => {
    const respuesta = await request(app).get('/health');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'ok' });
  });

  it('aplica un descuento mediante HTTP', async () => {
    const respuesta = await request(app)
      .post('/api/socios/descuento')
      .send({ monto: 1000, categoria: 'jubilado' });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ total: 750 });
  });

  it('calcula una multa dentro de la gracia mediante HTTP', async () => {
    const respuesta = await request(app)
      .post('/api/multas/calcular')
      .send({ diasAtraso: 2, tipo: 'libro' });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ multa: 0 });
  });

  // EJERCICIO 4: reemplazá cada it.todo por una prueba de integración con Supertest.
  describe('POST /api/multas/calcular', () => {
    it('a: 4 días de un dvd responde 200 con multa 1000', async () => {
      const respuesta = await request(app)
        .post("/api/multas/calcular")
        .send({ diasAtraso: 4, tipo: 'dvd' })
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ multa: 1000 })
    });

    it('b: -3 días responde 400 con un campo error', async () => {
      const respuesta = await request(app)
        .post("/api/multas/calcular")
        .send({ diasAtraso: -3, tipo: 'dvd' })
      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toHaveProperty('error')
    });

    it('c: tipo "comic" responde 400 con un campo error', async () => {
      const respuesta = await request(app)
        .post("/api/multas/calcular")
        .send({ diasAtraso: 4, tipo: 'comic' })
      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toHaveProperty('error')
    });

    it('d: diasAtraso enviado como texto "5" responde 400', async () => {
      const respuesta = await request(app)
        .post("/api/multas/calcular")
        .send({ diasAtraso: "4", tipo: 'dvd' })
      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toHaveProperty('error')
    });
  });

  it('e: una ruta inexistente responde 404', async () => {
    const respuesta = await request(app)
      .get("/ruta-inexistente")
    expect(respuesta.status).toBe(404)
  });
});
