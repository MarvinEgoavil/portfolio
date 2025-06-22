const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();

// CORS: permite tu web y local
app.use(cors({
  origin: [
    'https://www.marvinegoavil.com',
    'https://marvinegoavil.com',
    'http://127.0.0.1:5501'
  ],
  methods: ['GET', 'POST']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend de Marvin listo 🚀');
});

app.post('/contacto', async (req, res) => {
  // Usa variable de entorno en Railway, o la clave aquí en local
  const secret = process.env.RECAPTCHA_SECRET || '6LcyqWgrAAAAAIDaYbSpBDG-pDLht1gBE0UqV2nl';

  const { nombre, email, mensaje, 'g-recaptcha-response': token } = req.body;
  const remoteip = req.ip;

  if (!token) {
    return res.status(400).json({ error: 'Falta el token de reCAPTCHA.' });
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}&remoteip=${remoteip}`
    });
    const data = await response.json();
    console.log("Respuesta de Google reCAPTCHA:", data);

    if (!data.success || (data.score !== undefined && data.score < 0.5)) {
      return res.status(400).json({ error: 'No se superó la verificación reCAPTCHA', detalle: data });
    }

    res.json({ mensaje: 'Mensaje recibido correctamente. ¡Gracias!' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno al verificar reCAPTCHA.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
