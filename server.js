const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// 1️⃣ Koordinaten → Referencia Catastral
app.get('/rc-from-coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).send("lat & lon fehlen");

  const url = `https://www1.sedecatastro.gob.es/OVCServWeb/OVCSWLocalizacionRC/OVCSWLocalizacionRC.asmx/Consulta_RCCOOR?SRS=EPSG:4326&Coordenada_X=${lon}&Coordenada_Y=${lat}`;

  try {
    const r = await fetch(url);
    const txt = await r.text();
    res.send(txt);
  } catch (err) {
    res.status(500).send("Fehler Kataster-Koordinaten");
  }
});

// 2️⃣ Referencia Catastral → Parzelleninfos
app.get('/parcel-info', async (req, res) => {
  const { rc } = req.query;
  if (!rc) return res.status(400).send("Referencia Catastral fehlt");

  const url = `https://www1.sedecatastro.gob.es/OVCServWeb/OVCSWConsultaParcelario/OVCSWConsultaParcelario.asmx/Consulta_DNP?RefCatastral=${rc}`;

  try {
    const r = await fetch(url);
    const txt = await r.text();
    res.send(txt);
  } catch (err) {
    res.status(500).send("Fehler Parzelleninfo");
  }
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
