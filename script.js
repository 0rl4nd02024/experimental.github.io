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

function initializeAirportList() {
    const airportListDiv = document.getElementById('airport-list');
    airports.forEach(airport => {
        const button = document.createElement('button');
        button.textContent = `${airport.code} - ${airport.name}`;
        button.className = 'airport-button';
        button.onclick = () => fetchNOTAMs(airport.code);
        airportListDiv.appendChild(button);
    });
}

function fetchNOTAMs(airportCode) {
    const notamResultsDiv = document.getElementById('notam-results');
    notamResultsDiv.innerHTML = `<h2>NOTAMs para ${airportCode}</h2><p>Cargando NOTAMs...</p>`;

    fetch(`/api/notams/${airportCode}`)
        .then(response => response.json())
        .then(notams => displayNOTAMs(airportCode, notams))
        .catch(error => {
            console.error('Error:', error);
            notamResultsDiv.innerHTML = `<h2>NOTAMs para ${airportCode}</h2><p>Error al cargar NOTAMs. Por favor, intente de nuevo más tarde.</p>`;
        });
}

function displayNOTAMs(airportCode, notams) {
    const notamResultsDiv = document.getElementById('notam-results');
    if (notams.length === 0) {
        notamResultsDiv.innerHTML = `<h2>NOTAMs para ${airportCode}</h2><p>No hay NOTAMs relevantes</p>`;
        return;
    }

    let tableHTML = `
        <h2>NOTAMs para ${airportCode}</h2>
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
                <td>${notam.code}</td>
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

function updateStatus() {
    const now = new Date();
    document.getElementById('updateStatus').textContent = `Última actualización: ${now.toUTCString()}`;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeAirportList();
    updateStatus();
});

// Actualizar cada 5 minutos
setInterval(updateStatus, 300000);
