// register.js - Logica per la registrazione utente

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messaggio = document.getElementById('messaggio');
    
    // Validazione
    if (password !== confirmPassword) {
        messaggio.innerHTML = '<p class="error">Le password non coincidono</p>';
        return;
    }
    
    if (password.length < 6) {
        messaggio.innerHTML = '<p class="error">La password deve essere di almeno 6 caratteri</p>';
        return;
    }
    
    messaggio.innerHTML = '<p>Registrazione in corso...</p>';
    
    try {
        const risposta = await fetch(API_URL + '/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name, 
                email: email, 
                password: password 
            })
        });
        
        const dati = await risposta.json();
        
        if (risposta.ok) {
            // Se richiede verifica email
            if (dati.requires_verification) {
                messaggio.innerHTML = '<p class="success">Registrazione effettuata! Controlla la tua email per verificare l\'account.</p>';
                // Reindirizza alla pagina di verifica dopo 3 secondi
                setTimeout(() => {
                    window.location.href = 'verify-email.html?email=' + encodeURIComponent(email);
                }, 3000);
            } else {
                // Se non richiede verifica (per admin)
                messaggio.innerHTML = '<p class="success">Registrazione effettuata! <a href="login.html">Accedi</a></p>';
            }
        } else {
            messaggio.innerHTML = '<p class="error">Errore: ' + dati.message + '</p>';
        }
    } catch (errore) {
        messaggio.innerHTML = '<p class="error">Errore di connessione. API non disponibile.</p>';
    }
});