// laptops.js - Logica per la lista laptop

async function caricaLaptop() {
    const container = document.getElementById('lista-laptop');
    
    try {
        const risposta = await fetch(API_URL + '/laptops', {
            method: 'GET',
            headers: getHeaders()
        });
        
        const laptop = await risposta.json();
        
        if (risposta.ok) {
            if (laptop.length === 0) {
                container.innerHTML = '<p>Nessun laptop disponibile</p>';
            } else {
                let html = '';
                laptop.forEach(l => {
                    const stato = l.available ? 'disponibile' : 'non-disponibile';
                    html += '<div class="laptop">';
                    html += '<h3>' + l.brand + ' ' + l.model + '</h3>';
                    html += '<p>Prezzo: €' + l.price + '/giorno</p>';
                    html += '<p>Stato: <span class="' + stato + '">' + (l.available ? 'Disponibile' : 'Non disponibile') + '</span></p>';
                    if (l.locker) {
                        html += '<p>Locker: ' + l.locker.name + '</p>';
                    }
                    html += '<button onclick="vediDettaglio(' + l.id + ')">Dettagli</button>';
                    html += '</div>';
                });
                container.innerHTML = html;
            }
        } else {
            container.innerHTML = '<p class="error">Errore: ' + laptop.message + '</p>';
        }
    } catch (errore) {
        container.innerHTML = '<p>API non disponibile. Contatta l\'amministratore.</p>';
    }
}

function vediDettaglio(id) {
    window.location.href = 'laptop-dettaglio.html?id=' + id;
}

// Avvia caricamento
caricaLaptop();