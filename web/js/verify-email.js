// verify-email.js - Logica per la verifica email

// Prendi email dalla URL
const email = getUrlParam('email');

if (email) {
    document.getElementById('email-info').innerHTML = 
        'Inserisci il codice di verifica inviato a: <strong>' + email + '</strong>';
}

document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verification-code').value;
    const messaggio = document.getElementById('messaggio');
    
    // Validazione
    if (code.length !== 6 || isNaN(code)) {
        messaggio.innerHTML = '<p class="error">Il codice deve essere di 6 cifre</p>';
        return;
    }
    
    messaggio.innerHTML = '<p>Verifica in corso...</p>';
    
    try {
        const risposta = await fetch(API_URL + '/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email, 
                code: code 
            })
        });
        
        const dati = await risposta.json();
        
        if (risposta.ok) {
            messaggio.innerHTML = '<p class="success">Email verificata con successo! <a href="login.html">Accedi</a></p>';
        } else {
            messaggio.innerHTML = '<p class="error">Errore: ' + dati.message + '</p>';
        }
    } catch (errore) {
        messaggio.innerHTML = '<p class="error">Errore di connessione. API non disponibile.</p>';
    }
});