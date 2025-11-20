const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Proxy für Katasterabfrage via Referencia Catastral
app.get('/kataster', async (req, res) => {
  const { rc } = req.query;
  if (!rc) return res.status(400).send('Referencia Catastral (rc) erforderlich');

  const url = `https://www1.sedecatastro.gob.es/OVCServWeb/OVCSWConsultaInmueble/OVCSWConsultaInmueble.asmx/Consulta_DNPRC?ReferenciaCatastral=${rc}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).send('Fehler beim Abrufen der Katasterdaten.');
  }
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
