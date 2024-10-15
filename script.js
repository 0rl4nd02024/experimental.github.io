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

    // Aquí se simula la obtención de datos. En una implementación real, 
    // esto sería reemplazado por una llamada a la API o al backend.
    setTimeout(() => {
        const notams = getSimulatedNOTAMs(airportCode);
        displayNOTAMs(airportCode, notams);
    }, 1000);
}

function getSimulatedNOTAMs(airportCode) {
    // Esta función simula los datos que se obtendrían de la fuente real
    if (airportCode === 'SCEL') {
        return [
            { code: 'A3268/24', validity: '16/10/2024 - 16/10/2024', details: 'Inspección de vuelo DGAC en VOR/DME TBN en radio 40 NM. Llamada a Santiago RDR 129.7 MHz.' },
            { code: 'A3173/24', validity: '07/11/2024 - 07/11/2024', details: 'TWY Papa al sur de Z3 cerrado.' },
            { code: 'A3172/24', validity: '07/11/2024 - 07/11/2024', details: 'TWY Zulu al sur de Z3 cerrado.' },
            { code: 'A3171/24', validity: '07/11/2024 - 07/11/2024', details: 'RWY 19/35L cerrada.' },
            { code: 'A3142/24', validity: '02/10/2024 - 31/10/2024', details: 'PAPI RWY 17L fuera de servicio.' },
            { code: 'A3140/24', validity: '15/10/2024 - 15/10/2024', details: 'PAPI RWY 35R fuera de servicio.' },
            { code: 'A3134/24', validity: '09/10/2024 - 16/10/2024', details: 'REDL RWY 17L/35R fuera de servicio entre 15:00-19:00 diario.' },
            { code: 'A3059/24', validity: '27/09/2024 - 05/12/2024', details: 'Cierre RWY 17L/35R para inspección en horarios específicos.' },
            { code: 'A3058/24', validity: '27/09/2024 - 05/12/2024', details: 'Cierre RWY 19/35L para inspección en horarios específicos.' }
        ];
    }
    return []; // Retorna un array vacío para otros aeropuertos
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
        if (notam.details.includes('PAPI')) systems.add('PAPI');
        if (notam.details.includes('VOR') || notam.details.includes('DME')) systems.add('VOR/DME');
        if (notam.details.includes('RWY')) systems.add('RWY');
        if (notam.details.includes('TWY')) systems.add('TWY');
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
