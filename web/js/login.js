// login.js - Logica per la pagina di login

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messaggio = document.getElementById('messaggio');
    
    messaggio.innerHTML = 'Accesso in corso...';
    
    try {
        const risposta = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        
        const dati = await risposta.json();
        
        if (risposta.ok) {
            // Verifica se richiede 2FA
            if (dati.requires_2fa) {
                // Mostra form per codice 2FA
                mostra2FA(email, password);
            } else {
                // Login normale
                localStorage.setItem('token', dati.token);
                localStorage.setItem('utente', JSON.stringify(dati.user));
                messaggio.innerHTML = '<p style="color:green">Login effettuato!</p>';
                setTimeout(() => window.location.href = 'laptops.html', 500);
            }
        } else {
            messaggio.innerHTML = '<p class="error">Errore: ' + dati.message + '</p>';
        }
    } catch (errore) {
        messaggio.innerHTML = '<p class="error">Errore di connessione. API non disponibile.</p>';
    }
});

// Funzione per mostrare il form 2FA
function mostra2FA(email, password) {
    const messaggio = document.getElementById('messaggio');
    
    // Sostituisci il form con quello 2FA
    const formHtml = `
        <div id="2fa-form">
            <p>Inserisci il codice 2FA inviato alla tua email:</p>
            <div class="form-group">
                <label>Codice 2FA (6 cifre):</label>
                <input type="text" id="2fa-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000">
            </div>
            <button type="button" onclick="verifica2FA('${email}', '${password}')">Accedi</button>
            <button type="button" onclick="location.reload()" style="background:#6c757d; margin-left:10px;">Indietro</button>
        </div>
    `;
    
    document.getElementById('loginForm').style.display = 'none';
    messaggio.innerHTML = formHtml;
}

// Funzione per verificare il codice 2FA
async function verifica2FA(email, password) {
    const code = document.getElementById('2fa-code').value;
    const messaggio = document.getElementById('messaggio');
    
    if (code.length !== 6 || isNaN(code)) {
        messaggio.innerHTML = '<p class="error">Il codice deve essere di 6 cifre</p>';
        return;
    }
    
    messaggio.innerHTML = '<p>Verifica in corso...</p>';
    
    try {
        const risposta = await fetch(API_URL + '/auth/login-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email, 
                password: password,
                code: code 
            })
        });
        
        const dati = await risposta.json();
        
        if (risposta.ok) {
            localStorage.setItem('token', dati.token);
            localStorage.setItem('utente', JSON.stringify(dati.user));
            messaggio.innerHTML = '<p style="color:green">Login effettuato!</p>';
            setTimeout(() => window.location.href = 'laptops.html', 500);
        } else {
            messaggio.innerHTML = '<p class="error">Errore: ' + dati.message + '</p>';
        }
    } catch (errore) {
        messaggio.innerHTML = '<p class="error">Errore di connessione</p>';
    }
}