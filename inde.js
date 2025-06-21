const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('¡Funciona en Railway! 🚂'));
app.get('/mensajes', (req, res) => res.json([]));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
