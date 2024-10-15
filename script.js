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

let currentNOTAMs = {};

function initializeAirportList() {
    const airportListDiv = document.getElementById('airport-list');
    airports.forEach(airport => {
        const button = document.createElement('button');
        button.textContent = `${airport.code} - ${airport.name}`;
        button.className = 'airport-button';
        button.id = `button-${airport.code}`;
        button.onclick = () => fetchNOTAMs(airport.code, true);
        airportListDiv.appendChild(button);
    });
}

function fetchNOTAMs(airportCode, display = false) {
    const url = `https://aipchile.dgac.gob.cl/notam?designador=${airportCode}`;
    
    return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            const notams = extractNOTAMs(doc);
            if (display) {
                displayNOTAMs(airportCode, notams);
            }
            checkForNewNOTAMs(airportCode, notams);
            return notams;
        })
        .catch(error => {
            console.error(`Error fetching NOTAMs for ${airportCode}:`, error);
            return [];
        });
}

function extractNOTAMs(doc) {
    const notams = [];
    const rows = doc.querySelectorAll('table tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            const code = cells[0].textContent.trim();
            const validity = cells[1].textContent.trim();
            const details = cells[2].textContent.trim();
            if (isRelevantNOTAM(details)) {
                notams.push({ code, validity, details });
            }
        }
    });
    return notams;
}

function isRelevantNOTAM(details) {
    const relevantTerms = ['PAPI', 'ILS', 'VOR', 'DME', 'RWY', 'FUEL', 'SEI', 'CLOSE TAXI', 'CLOSE RWY'];
    return relevantTerms.some(term => details.toUpperCase().includes(term));
}

function displayNOTAMs(airportCode, notams) {
    const notamResultsDiv = document.getElementById('notam-results');
    if (notams.length === 0) {
        notamResultsDiv.innerHTML = `<h2>NOTAMs para ${airportCode}</h2><p>No hay NOTAMs relevantes</p>`;
        return;
    }

    let tableHTML = `
        <h2>Búsqueda realizada en 1 sitio</h2>
        <table class="notam-table">
            <tr>
                <th>NOTAM</th>
                <th>Validez</th>
                <th>Detalles</th>
            </tr>
    `;

    notams.forEach(notam => {
        tableHTML += `
            <tr>
                <td><strong>${notam.code}</strong></td>
                <td>${notam.validity}</td>
                <td>${notam.details}</td>
            </tr>
        `;
    });

    tableHTML += '</table>';

    const affectedSystems = getAffectedSystems(notams);
    const summaryHTML = `<div id="summary">Estos NOTAMs afectan principalmente los sistemas ${affectedSystems.join(', ')} en ${airportCode} (${airports.find(a => a.code === airportCode).name}).</div>`;

    notamResultsDiv.innerHTML = tableHTML + summaryHTML;
}

function getAffectedSystems(notams) {
    const systems = new Set();
    notams.forEach(notam => {
        const details = notam.details.toUpperCase();
        if (details.includes('PAPI')) systems.add('PAPI');
        if (details.includes('ILS')) systems.add('ILS');
        if (details.includes('VOR')) systems.add('VOR');
        if (details.includes('DME')) systems.add('DME');
        if (details.includes('RWY')) systems.add('RWY');
        if (details.includes('FUEL')) systems.add('FUEL');
        if (details.includes('SEI')) systems.add('SEI');
        if (details.includes('TWY')) systems.add('TWY');
    });
    return Array.from(systems);
}

function checkForNewNOTAMs(airportCode, newNOTAMs) {
    const button = document.getElementById(`button-${airportCode}`);
    if (!currentNOTAMs[airportCode]) {
        currentNOTAMs[airportCode] = newNOTAMs;
        return false;
    }

    const newSignificantNOTAMs = newNOTAMs.filter(notam => 
        !currentNOTAMs[airportCode].some(currentNotam => 
            currentNotam.code === notam.code
        )
    );

    if (newSignificantNOTAMs.length > 0) {
        button.classList.add('new-notam');
        return true;
    } else {
        button.classList.remove('new-notam');
        return false;
    }

    currentNOTAMs[airportCode] = newNOTAMs;
}

async function updateAllAirports() {
    let hasNewSignificantNOTAMs = false;
    for (const airport of airports) {
        const notams = await fetchNOTAMs(airport.code);
        if (checkForNewNOTAMs(airport.code, notams)) {
            hasNewSignificantNOTAMs = true;
        }
    }
    if (hasNewSignificantNOTAMs) {
        alert("¡Atención! Se han detectado nuevos NOTAMs significativos en uno o más aeropuertos.");
    }
    updateStatus();
}

function updateStatus() {
    const now = new Date();
    document.getElementById('updateStatus').textContent = `Última actualización: ${now.toUTCString()}`;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeAirportList();
    updateAllAirports();
});

// Actualizar cada 5 minutos
setInterval(updateAllAirports, 300000);
