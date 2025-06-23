require('dotenv').config();

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const path = require('path');

const app = express();

const corsOptions = {
  origin: [
    'https://www.marvinegoavil.com',
    'https://marvinegoavil.com',
    'http://127.0.0.1:5501',
    'https://portfolio-production-72ed.up.railway.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Responder a preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Sirve archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Sirve index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint POST para contacto con reCAPTCHA
app.post('/contacto', async (req, res) => {
  const secret = process.env.RECAPTCHA_SECRET;
  const { nombre, email, mensaje, 'g-recaptcha-response': token } = req.body;
  const remoteip = req.ip;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
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

    if (!data.success) {
      return res.status(400).json({ error: 'No se superó la verificación reCAPTCHA', detalle: data });
    }
    if (typeof data.score === 'number' && data.score < 0.5) {
      return res.status(400).json({ error: 'El score de reCAPTCHA es bajo. Intenta de nuevo.', detalle: data });
    }

    // Aquí puedes guardar el mensaje en base de datos o enviar email

    res.json({ mensaje: 'Mensaje recibido correctamente. ¡Gracias!' });
  } catch (err) {
    console.error('Error al verificar reCAPTCHA:', err);
    res.status(500).json({ error: 'Error interno al verificar reCAPTCHA.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
