const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Proxy für Kataster Koordinaten → Referencia Catastral
app.get('/kataster', async (req, res) => {
  const { lat, lon } = req.query;
  if(!lat || !lon) return res.status(400).send('lat und lon erforderlich');

  const url = `https://www1.sedecatastro.gob.es/OVCServWeb/OVCSWLocalizacionRC/OVCSWLocalizacionRC.asmx/Consulta_RCCOOR?SRS=EPSG:4326&Coordenada_X=${lon}&Coordenada_Y=${lat}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).send('Fehler beim Abrufen der Katasterdaten.');
  }
});

// Proxy für Grundstücksdaten per Referencia Catastral
app.get('/kataster-inmueble', async (req, res) => {
  const { rc } = req.query;
  if(!rc) return res.status(400).send('Referencia Catastral (rc) erforderlich');

  const url = `https://www1.sedecatastro.gob.es/OVCServWeb/OVCSWConsultaInmueble/OVCSWConsultaInmueble.asmx/Consulta_DNPRC?ReferenciaCatastral=${rc}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).send('Fehler beim Abrufen der Grundstücksdaten.');
  }
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
