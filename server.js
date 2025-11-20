// server.js
// Ibiza Parzellenfinder - proxy für Catastro Webservices
const express = require('express');
const fetch = require('node-fetch'); // v2
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Wichtige Header damit Catastro nicht blockiert
const katHeaders = {
  'User-Agent': 'Mozilla/5.0 (compatible; Ibiza-Parzellenfinder/1.0)',
  'Accept': 'application/xml,text/xml,*/*',
  'Referer': 'https://www.sedecatastro.gob.es/',
  'Host': 'ovc.catastro.meh.es'
};

// Endpoint 1: Koordinaten -> Referencia Catastral
// Beispiel: /coords-to-rc?lat=38.9067&lon=1.4206
app.get('/coords-to-rc', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).send('lat & lon required');

  const url = `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCSWLocalizacionRC.asmx/Consulta_RCCOOR?SRS=EPSG:4326&Coordenada_X=${encodeURIComponent(lon)}&Coordenada_Y=${encodeURIComponent(lat)}`;

  try {
    const r = await fetch(url, { headers: katHeaders, timeout: 20000 });
    if (!r.ok) return res.status(502).send('Kataster-Server antwortet nicht korrekt');
    const text = await r.text();
    res.type('application/xml').send(text);
  } catch (err) {
    console.error('coords-to-rc error:', err && err.message ? err.message : err);
    res.status(500).send('Fehler beim Abrufen der Kataster-Koordinaten');
  }
});

// Endpoint 2: Referencia Catastral -> Parzelleninfos
// Beispiel: /rc-info?rc=70019A000123456
app.get('/rc-info', async (req, res) => {
  const { rc } = req.query;
  if (!rc) return res.status(400).send('rc required');

  const url = `https://ovc.catastro.meh.es/ovcservweb/OVCSWConsultaParcelario/OVCSWConsultaParcelario.asmx/Consulta_DNP?RefCatastral=${encodeURIComponent(rc)}`;

  try {
    const r = await fetch(url, { headers: katHeaders, timeout: 20000 });
    if (!r.ok) return res.status(502).send('Kataster-Server antwortet nicht korrekt');
    const text = await r.text();
    res.type('application/xml').send(text);
  } catch (err) {
    console.error('rc-info error:', err && err.message ? err.message : err);
    res.status(500).send('Fehler beim Abrufen der Parzelleninfo');
  }
});

// Health & ready
app.get('/_health', (req,res) => res.send('ok'));

// Start server auf 0.0.0.0 damit Render korrekt routet
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

// Render Tipps: erhöhe Header/keepalive falls nötig
server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;
