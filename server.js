const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const airportUrls = {
    'SCEL': 'https://aipchile.dgac.gob.cl/notam?designador=SCEL',
    'SCIE': 'https://aipchile.dgac.gob.cl/notam?designador=SCIE',
    'SCAR': 'https://aipchile.dgac.gob.cl/notam?designador=SCAR',
    'SCDA': 'https://aipchile.dgac.gob.cl/notam?designador=SCDA',
    'SCFA': 'https://aipchile.dgac.gob.cl/notam?designador=SCFA',
    'SCCF': 'https://aipchile.dgac.gob.cl/notam?designador=SCCF',
    'SCAT': 'https://aipchile.dgac.gob.cl/notam?designador=SCAT',
    'SCSE': 'https://aipchile.dgac.gob.cl/notam?designador=SCSE',
    'SCQP': 'https://aipchile.dgac.gob.cl/notam?designador=SCQP',
    'SCVD': 'https://aipchile.dgac.gob.cl/notam?designador=SCVD',
    'SCTE': 'https://aipchile.dgac.gob.cl/notam?designador=SCTE',
    'SCBA': 'https://aipchile.dgac.gob.cl/notam?designador=SCBA',
    'SCNT': 'https://aipchile.dgac.gob.cl/notam?designador=SCNT',
    'SCCI': 'https://aipchile.dgac.gob.cl/notam?designador=SCCI'
};

app.get('/api/notams/:airportCode', async (req, res) => {
    const { airportCode } = req.params;
    const url = airportUrls[airportCode];

    if (!url) {
        return res.status(400).json({ error: 'Código de aeropuerto no válido' });
    }

    try {
        const notams = await fetchAllNOTAMs(url);
        res.json(notams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los NOTAMs' });
    }
});

async function fetchAllNOTAMs(baseUrl) {
    let allNotams = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const url = `${baseUrl}&pagina=${currentPage}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const pageNotams = extractNOTAMs($);
        allNotams = allNotams.concat(pageNotams);

        hasNextPage = $('a:contains(">")')
    .filter(function() {
        return $(this).text().trim() === '>';
    }).length > 0;
        currentPage++;
    }

    return allNotams;
}

function extractNOTAMs($) {
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
    return notams;
}

function isRelevantNOTAM(details) {
    const relevantTerms = ['PAPI', 'ILS', 'VOR', 'DME', 'RWY', 'FUEL', 'SEI', 'CLOSE TAXI', 'CLOSE RWY'];
    return relevantTerms.some(term => details.includes(term));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
