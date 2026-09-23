const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({
  maxInstances: 10,
});

// Secreto almacenado en Firebase Secret Manager
const tituloPassword = defineSecret("TITULO_PASSWORD");

exports.obtenerTitulo = onRequest(
  {
    secrets: [tituloPassword],
    cors: [
      "https://www.marvinegoavil.com",
      "https://marvinegoavil.com",
      "http://127.0.0.1:5501",
      "http://localhost:5501",
    ],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método no permitido",
      });
    }

    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({
        error: "Falta la contraseña",
      });
    }

    if (password !== tituloPassword.value()) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    try {
      const bucket = admin.storage().bucket(
        "portofolio-marvin.firebasestorage.app"
      );

      const archivo = bucket.file("Titulo_grande.png");

      const [existe] = await archivo.exists();

      if (!existe) {
        return res.status(404).json({
          error: "No se encontró Titulo_grande.png",
        });
      }

      const [imagen] = await archivo.download();

      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "no-store");

      return res.status(200).send(imagen);
    } catch (error) {
      console.error("Error obteniendo el título:", error);

      return res.status(500).json({
        error: "Error interno",
      });
    }
  }
);