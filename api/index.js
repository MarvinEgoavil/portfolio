const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let mensajes = [];

app.get('/', (req, res) => {
  res.send('¡Funciona en Railway! 🚂');
});

app.get('/mensajes', (req, res) => {
  res.json(mensajes);
});


app.post('/contacto', (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  mensajes.push({ nombre, email, mensaje, fecha: new Date() });
  res.json({ mensaje: '¡Mensaje recibido (sin email)!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
