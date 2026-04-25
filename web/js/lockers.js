// lockers.js - Logica per la lista lockers

async function caricaLockers() {
    const container = document.getElementById('lista-lockers');
    
    try {
        const risposta = await fetch(API_URL + '/lockers', {
            method: 'GET',
            headers: getHeaders()
        });
        
        const lockers = await risposta.json();
        
        if (risposta.ok) {
            if (lockers.length === 0) {
                container.innerHTML = '<p>Nessun locker disponibile</p>';
            } else {
                let html = '';
                lockers.forEach(l => {
                    html += '<div class="locker">';
                    html += '<h3>' + l.name + '</h3>';
                    html += '<p>Posizione: ' + l.location + '</p>';
                    html += '<p>Capienza: ' + l.current_capacity + '/' + l.capacity + '</p>';
                    html += '<p>Stato: ' + (l.available ? 'Disponibile' : 'Pieno') + '</p>';
                    html += '<button onclick="vediLocker(' + l.id + ')">Dettagli</button>';
                    html += '</div>';
                });
                container.innerHTML = html;
            }
        } else {
            container.innerHTML = '<p>Errore: ' + lockers.message + '</p>';
        }
    } catch (errore) {
        container.innerHTML = '<p>API non disponibile</p>';
    }
}

function vediLocker(id) {
    window.location.href = 'locker-dettaglio.html?id=' + id;
}

caricaLockers();