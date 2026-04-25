// locker-dettaglio.js - Logica per dettaglio locker

async function caricaLocker() {
    const id = getUrlParam('id');
    const container = document.getElementById('dettaglio-locker');
    
    if (!id) {
        container.innerHTML = '<p>ID locker non specificato</p>';
        return;
    }
    
    try {
        const risposta = await fetch(API_URL + '/lockers/' + id, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const locker = await risposta.json();
        
        if (risposta.ok) {
            let html = '<div style="border:1px solid #ddd; padding:20px;">';
            html += '<h2>' + locker.name + '</h2>';
            html += '<p><strong>Posizione:</strong> ' + locker.location + '</p>';
            html += '<p><strong>Capienza:</strong> ' + locker.current_capacity + '/' + locker.capacity + '</p>';
            html += '<p><strong>Stato:</strong> ' + (locker.available ? 'Disponibile' : 'Pieno') + '</p>';
            
            // Mostra laptop contenuti
            if (locker.laptops && locker.laptops.length > 0) {
                html += '<h3>Laptop in questo locker:</h3>';
                html += '<table>';
                html += '<tr><th>Brand</th><th>Modello</th><th>Stato</th></tr>';
                locker.laptops.forEach(l => {
                    html += '<tr>';
                    html += '<td>' + l.brand + '</td>';
                    html += '<td>' + l.model + '</td>';
                    html += '<td>' + (l.available ? 'Disponibile' : 'In uso') + '</td>';
                    html += '</tr>';
                });
                html += '</table>';
            } else {
                html += '<p>Nessun laptop in questo locker</p>';
            }
            
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>Errore: ' + locker.message + '</p>';
        }
    } catch (errore) {
        container.innerHTML = '<p>API non disponibile</p>';
    }
}

caricaLocker();