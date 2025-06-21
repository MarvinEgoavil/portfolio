const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

let mensajes = [];

// Configura Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marvinegoavilz@gmail.com',      // <--- pon tu correo aquí
    pass: 'ookpywrfpzwwtqxm'      // <--- pon la contraseña de aplicación aquí
  }
});

app.post('/contacto', async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  mensajes.push({ nombre, email, mensaje, fecha: new Date() });

  /* const mailOptions = {
    from: `"Portfolio Marvin" <marvinegoavilz@gmail.com>`, // <--- tu correo
    to: 'marvinegoavilz@gmail.com',                        // <--- tu correo
    subject: 'Nuevo mensaje de tu portfolio',
    text: `Has recibido un mensaje de ${nombre} (${email}):\n\n${mensaje}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ mensaje: '¡Mensaje enviado correctamente!' });
  } catch (err) {
    console.error('Error al enviar email:', err);
    res.status(500).json({ error: 'No se pudo enviar el mensaje.' });
  }
}); */

  res.json({ mensaje: '¡Mensaje recibido (sin email)!' }); // <--- RESPUESTA AQUÍ
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
