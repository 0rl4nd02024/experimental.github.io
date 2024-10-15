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

const relevantCategories = ['PAPI', 'ILS', 'VOR', 'DME', 'RWY', 'FUEL', 'SEI', 'CLOSE TAXI', 'CLOSE RWY'];

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
    // En una implementación real, aquí se haría una llamada a la API
    // Por ahora, simularemos la obtención de datos
    const notamResultsDiv = document.getElementById('notam-results');
    notamResultsDiv.innerHTML = `<h2>NOTAMs para ${airportCode}</h2><p>Cargando NOTAMs...</p>`;

    setTimeout(() => {
        const simulatedNOTAMs = simulateNOTAMs(airportCode);
        displayNOTAMs(airportCode, simulatedNOTAMs);
    }, 1000);
}

function simulateNOTAMs(airportCode) {
    // Esta función simula la generación de NOTAMs relevantes
    const notams = [];
    relevantCategories.forEach(category => {
        if (Math.random() > 0.7) {
            notams.push({
                code: `${category[0]}${Math.floor(Math.random() * 10000)}/23`,
                validity: `${new Date().toLocaleDateString()} - ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}`,
                details: `${category} ${Math.random() > 0.5 ? 'fuera de servicio' : 'en mantenimiento'}`
            });
        }
    });
    return notams;
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
                <td><strong>${notam.code}</strong></td>
                <td>${notam.validity}</td>
                <td>${notam.details}</td>
            </tr>
        `;
    });

    tableHTML += '</table>';
    notamResultsDiv.innerHTML = tableHTML;
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
