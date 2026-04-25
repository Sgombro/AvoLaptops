// prenotazioni.js - Logica per le prenotazioni

async function caricaPrenotazioni() {
    const container = document.getElementById('lista-prenotazioni');
    const token = localStorage.getItem('token');
    
    if (!token) {
        container.innerHTML = '<p>Devi effettuare il <a href="login.html">login</a> per vedere le prenotazioni</p>';
        return;
    }
    
    try {
        const risposta = await fetch(API_URL + '/reservations', {
            method: 'GET',
            headers: getHeaders()
        });
        
        const prenotazioni = await risposta.json();
        
        if (risposta.ok) {
            if (prenotazioni.length === 0) {
                container.innerHTML = '<p>Nessuna prenotazione effettuata</p>';
            } else {
                let html = '<table>';
                html += '<tr><th>ID</th><th>Laptop</th><th>Locker</th><th>Data Inizio</th><th>Data Fine</th><th>Stato</th><th>Azione</th></tr>';
                
                prenotazioni.forEach(p => {
                    html += '<tr>';
                    html += '<td>' + p.id + '</td>';
                    html += '<td>' + (p.laptop ? p.laptop.brand + ' ' + p.laptop.model : 'N/A') + '</td>';
                    html += '<td>' + (p.locker ? p.locker.name : 'N/A') + '</td>';
                    html += '<td>' + (p.start_date || 'N/A') + '</td>';
                    html += '<td>' + (p.end_date || 'N/A') + '</td>';
                    html += '<td>' + p.status + '</td>';
                    if (p.status === 'pending') {
                        html += '<td><button class="btn" onclick="annullaPrenotazione(' + p.id + ')">Annulla</button></td>';
                    } else {
                        html += '<td>-</td>';
                    }
                    html += '</tr>';
                });
                html += '</table>';
                container.innerHTML = html;
            }
        } else {
            container.innerHTML = '<p>Errore: ' + prenotazioni.message + '</p>';
        }
    } catch (errore) {
        container.innerHTML = '<p>API non disponibile</p>';
    }
}

async function annullaPrenotazione(id) {
    if (!confirm('Sei sicuro di voler annullare questa prenotazione?')) {
        return;
    }
    
    try {
        const risposta = await fetch(API_URL + '/reservations/' + id, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (risposta.ok) {
            alert('Prenotazione annullata');
            caricaPrenotazioni();
        } else {
            const dati = await risposta.json();
            alert('Errore: ' + dati.message);
        }
    } catch (errore) {
        alert('Errore di connessione');
    }
}

caricaPrenotazioni();