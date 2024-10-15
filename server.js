const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const airports = [
    { code: 'SCEL', name: 'Santiago' },
    { code: 'SCIE', name: 'Concepción' },
    { code: 'SCAR', name: 'Arica' },
    { code: 'SCDA', name: 'Iquique' },
    { code: 'SCFA', name: 'Antofagasta' },
    { code: 'SCCF', name: 'Calama' },
    { code: 'SCAT', name: 'Atacama' },
    { code: 'SCSE', name: 'La Serena' },
    { code: 'SCQP', name: 'Temuco' },
    { code: 'SCVD', name: 'Valdivia' },
    { code: 'SCTE', name: 'Puerto Montt' },
    { code: 'SCBA', name: 'Balmaceda' },
    { code: 'SCNT', name: 'Natales' },
    { code: 'SCCI', name: 'Punta Arenas' }
];

app.get('/api/notams/:airportCode', async (req, res) => {
    try {
        const { airportCode } = req.params;
        const url = `https://aipchile.dgac.gob.cl/notam?designador=${airportCode}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const notams = [];
        $('table tr').each((i, elem) => {
            const tds = $(elem).find('td');
            if (tds.length >= 3) {
                const code = $(tds[0]).text().trim();
                const validity = $(tds[1]).text().trim();
                const details = $(tds[2]).text().trim();
                
                if (isRelevantNOTAM(details)) {
                    notams.push({ code, validity, details });
                }
            }
        });
        
        res.json(notams);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener los NOTAMs' });
    }
});

function isRelevantNOTAM(details) {
    const relevantTerms = ['PAPI', 'ILS', 'VOR', 'DME', 'RWY', 'FUEL', 'SEI', 'CLOSE TAXI', 'CLOSE RWY'];
    return relevantTerms.some(term => details.toUpperCase().includes(term));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
