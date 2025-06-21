const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('¡Funciona en Railway! 🚂');
});

app.listen(PORT, () => {
  console.log('API corriendo en el puerto', PORT);
});
