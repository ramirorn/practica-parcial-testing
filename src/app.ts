import express, { type Response } from 'express';
import { calcularMulta } from './services/multas.ts';
import { aplicarDescuento } from './services/socios.ts';

export const app = express();
app.use(express.json());

function responderError(error: unknown, res: Response): void {
  if (error instanceof RangeError || error instanceof TypeError) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: 'Error interno' });
}

app.get('/health', (_req, res) => {
  res.json({ estado: 'ok' });
});

app.post('/api/socios/descuento', (req, res) => {
  const { monto, categoria } = req.body ?? {};
  try {
    const total = aplicarDescuento(monto, categoria);
    res.status(200).json({ total });
  } catch (error) {
    responderError(error, res);
  }
});

app.post('/api/multas/calcular', (req, res) => {
  const { diasAtraso, tipo } = req.body ?? {};
  try {
    const multa = calcularMulta(diasAtraso, tipo);
    res.status(200).json({ multa });
  } catch (error) {
    responderError(error, res);
  }
});
