// laptop-dettaglio.js - Logica per dettaglio laptop

async function caricaDettaglio() {
    const id = getUrlParam('id');
    const container = document.getElementById('dettaglio');
    
    if (!id) {
        container.innerHTML = '<p>ID laptop non specificato</p>';
        return;
    }
    
    try {
        const risposta = await fetch(API_URL + '/laptops/' + id, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const laptop = await risposta.json();
        
        if (risposta.ok) {
            let html = '<div style="border:1px solid #ddd; padding:20px;">';
            html += '<h2>' + laptop.brand + ' ' + laptop.model + '</h2>';
            html += '<p><strong>ID:</strong> ' + laptop.id + '</p>';
            html += '<p><strong>Prezzo:</strong> €' + laptop.price + '/giorno</p>';
            html += '<p><strong>Stato:</strong> ' + (laptop.available ? 'Disponibile' : 'Non disponibile') + '</p>';
            html += '<p><strong>Descrizione:</strong> ' + (laptop.description || 'N/A') + '</p>';
            html += '<p><strong>Specifiche:</strong> ' + (laptop.specs || 'N/A') + '</p>';
            if (laptop.locker) {
                html += '<p><strong>Locker:</strong> ' + laptop.locker.name + ' - ' + laptop.locker.location + '</p>';
            }
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>Errore: ' + laptop.message + '</p>';
        }
    } catch (errore) {
        container.innerHTML = '<p>API non disponibile</p>';
    }
}

caricaDettaglio();