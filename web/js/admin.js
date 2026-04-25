// admin.js - Logica per la dashboard admin

function verificaAdmin() {
    const utente = JSON.parse(localStorage.getItem('utente') || '{}');
    if (utente.role !== 'admin') {
        document.getElementById('lista-utenti').innerHTML = '<p>Accesso negato. Solo per amministratori.</p>';
        return false;
    }
    return true;
}

async function caricaUtenti() {
    if (!verificaAdmin()) return;
    
    const container = document.getElementById('lista-utenti');
    
    try {
        const risposta = await fetch(API_URL + '/users', {
            method: 'GET',
            headers: getHeaders()
        });
        
        const utenti = await risposta.json();
        
        if (risposta.ok) {
            if (utenti.length === 0) {
                container.innerHTML = '<p>Nessun utente trovato</p>';
            } else {
                let html = '<table>';
                html += '<tr><th>ID</th><th>Nome</th><th>Email</th><th>Ruolo</th><th>Stato</th><th>Azione</th></tr>';
                
                utenti.forEach(u => {
                    html += '<tr>';
                    html += '<td>' + u.id + '</td>';
                    html += '<td>' + (u.name || 'N/A') + '</td>';
                    html += '<td>' + u.email + '</td>';
                    html += '<td>' + u.role + '</td>';
                    html += '<td>' + (u.approved ? 'Approvato' : 'In attesa') + '</td>';
                    if (!u.approved) {
                        html += '<td><button class="btn" onclick="approvaUtente(' + u.id + ')">Approva</button></td>';
                    } else {
                        html += '<td>-</td>';
                    }
                    html += '</tr>';
                });
                html += '</table>';
                container.innerHTML = html;
            }
        } else {
            container.innerHTML = '<p>Errore: ' + utenti.message + '</p>';
        }
    } catch (errore) {
        container.innerHTML = '<p>API non disponibile</p>';
    }
}

async function approvaUtente(id) {
    try {
        const risposta = await fetch(API_URL + '/users/' + id + '/approve', {
            method: 'PATCH',
            headers: getHeaders()
        });
        
        if (risposta.ok) {
            alert('Utente approvato');
            caricaUtenti();
        } else {
            const dati = await risposta.json();
            alert('Errore: ' + dati.message);
        }
    } catch (errore) {
        alert('Errore di connessione');
    }
}

caricaUtenti();