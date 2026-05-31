# AvoLaptops API - Documentazione Tecnica

## Panoramica

AvoLaptops è un'API REST che gestisce un sistema di prenotazione e gestione di laptop. L'API fornisce endpoints per l'autenticazione, la gestione degli utenti, dei laptop, delle prenotazioni e degli armadietti di stoccaggio.

**Base URL**: `/api/v1/`

**Formato risposta**: JSON

---

## Autenticazione

### JWT Token

L'API utilizza JWT (JSON Web Token) per l'autenticazione. È necessario includere il token nell'header delle richieste protette.

**Header richiesto per endpoint protetti:**
```
Authorization: Bearer <jwt_token>
```

**Struttura JWT:**
- **Algorithm**: HS256

**Payload JWT contiene:**
```json
{
  "id-user": "integer",
  "name": "string",
  "surname": "string",
  "email": "string",
  "password": "string (hashed)",
  "verified": "0|1",
  "admin": "boolean",
  "start": "timestamp"
}
```

### Hashing Password

Le password sono hashate utilizzando l'algoritmo **SHA-256** prima di essere salvate nel database.

---

## Endpoint

### 1. LOGIN

**POST** `/login`

Autentica un utente e restituisce un JWT token.

**Parametri (form-data):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `email` | string | ✓ | Email dell'utente |
| `password` | string | ✓ | Password dell'utente (minimo 8 caratteri) |

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "message": "Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Credenziali non valide | Email o password errati |
| 401 | Verifica il tuo indirizzo mail prima, riprova tra 5 minuti | Utente non verificato |

---

### 2. REGISTRAZIONE UTENTE

**POST** `/users`

Registra un nuovo utente con email Gmail. Un codice OTP viene inviato per la verifica.

**Parametri (form-data):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `email` | string | ✓ | Email Gmail dell'utente |
| `password` | string | ✓ | Password (minimo 8 caratteri) |
| `name` | string | ✓ | Nome dell'utente |
| `surname` | string | ✓ | Cognome dell'utente |

**Risposta Success (201):**
```json
{
  "status": "201 Created",
  "message": "Verifica l'account con il codice OTP inviato via mail",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Credenziali non valide | Campi obbligatori mancanti |
| 401 | La password deve essere lunga 8 cifre | Password troppo corta |
| 401 | Solo account @gmail si possono registrare | Dominio email non supportato |
| 406 | Utente esistente, se non ti sei registrato te riprova tra 5 minuti | Email già registrata |

---

### 3. VERIFICA OTP

**POST** `/otp`

Verifica l'account utilizzando il codice OTP inviato via email.

**Parametri (form-data):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `otp` | integer | ✓ | Codice OTP ricevuto via email (6 cifre) |

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "message": "Account verificato con successo"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 406 | Codice non valido | OTP errato o scaduto |

---

### 4. MODIFICA PASSWORD

**PATCH** `/users`

Modifica la password dell'utente autenticato.

**Parametri (raw body):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `password` | string | ✓ | Nuova password (minimo 8 caratteri) |

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Content-Type:**
```
application/x-www-form-urlencoded
```

**Risposta Success (200):**
```json
{
  "status": "200 OK"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 400 | Immetti la nuova password | Campo password mancante |
| 400 | La password deve essere lunga 8 cifre | Password troppo corta |
| 401 | Token non valido | JWT assente o non valido |

---

### 5. OTTIENI UTENTI

**GET** `/users`

Recupera informazioni sugli utenti. Filtrabile per parametri query.

**Header richiesto:**
```
Authorization: Bearer <jwt_token> (admin only)
```

**Query Parameters (opzionali):**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id-user` | integer | ID utente |
| `name` | string | Nome utente |
| `surname` | string | Cognome utente |
| `email` | string | Email utente |
| `role` | string | Ruolo (teacher, admin) |
| `verified` | integer | 0 o 1 |

**Esempio richiesta:**
```
GET /users?email=user@gmail.com&role=teacher
```

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "users": [
    {
      "id_user": 1,
      "name": "Mario",
      "surname": "Rossi",
      "email": "mario@gmail.com",
      "role": "teacher",
      "verified": 1
    }
  ]
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 403 | Accesso negato | Solo admin può accedere |
| 404 | Not Found | Nessun utente trovato |

---

### 6. ELIMINA UTENTE

**DELETE** `/users/{id}`

Elimina un utente dal sistema.

**Path Parameters:**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id` | integer | ID dell'utente da eliminare |

**Header richiesto:**
```
Authorization: Bearer <jwt_token> (admin only)
```

**Risposta Success (200):**
```json
{
  "status": "200 OK"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 403 | Accesso negato | Solo admin può accedere |

---

### 7. OTTIENI LAPTOP

**GET** `/laptops`

Recupera l'elenco dei laptop con informazioni sul modello e l'armadietto.

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (opzionali):**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id-laptop` | integer | ID laptop |
| `status` | string | Stato laptop (available, unavailable) |
| `id-model` | integer | ID modello |
| `id-locker` | integer | ID armadietto |

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "laptops": [
    {
      "id_laptop": 1,
      "status": "available",
      "model": {
        "id_model": 1,
        "name": "Dell XPS 13",
        "brand": "Dell",
        "specs": "Intel i7, 16GB RAM"
      },
      "locker": {
        "id_locker": 1,
        "name": "Armadietto A1",
        "location": "Aula 101"
      }
    }
  ]
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 404 | Not Found | Nessun laptop trovato |

---

### 8. CREA LAPTOP

**POST** `/laptops`

Crea un nuovo laptop nel sistema.

**Parametri (form-data):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id-model` | integer | ✓ | ID del modello di laptop |
| `id-locker` | integer | ✓ | ID dell'armadietto di stoccaggio |

**Header richiesto:**
```
Authorization: Bearer <jwt_token> (admin only)
```

**Risposta Success (201):**
```json
{
  "status": "201 Created"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 403 | Accesso negato | Solo admin può accedere |

---

### 9. OTTIENI PRENOTAZIONI

**GET** `/reservations`

Recupera le prenotazioni con dettagli di laptop, modello, armadietto e utente.

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (opzionali):**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id-reservation` | integer | ID prenotazione |
| `date` | date | Data prenotazione (YYYY-MM-DD) |
| `status` | string | Stato (active, completed, cancelled) |
| `id-laptop` | integer | ID laptop |
| `id-user` | integer | ID utente |

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "reservations": [
    {
      "id_reservation": 1,
      "date": "2026-06-15",
      "time_start": "14:00:00",
      "time_end": "16:00:00",
      "status": "active",
      "user": {
        "id_user": 5,
        "name": "Marco",
        "surname": "Bianchi",
        "email": "marco@gmail.com",
        "role": "teacher"
      },
      "laptop": {
        "id_laptop": 2,
        "status": "unavailable",
        "model": {
          "id_model": 2,
          "name": "MacBook Pro",
          "brand": "Apple"
        },
        "locker": {
          "id_locker": 1,
          "name": "Armadietto A1"
        }
      }
    }
  ]
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 404 | Not Found | Nessuna prenotazione trovata |

---

### 10. CREA PRENOTAZIONE

**POST** `/reservations`

Crea una nuova prenotazione per uno o più laptop.

**Parametri (form-data):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `date` | date | ✓ | Data prenotazione (YYYY-MM-DD), deve essere futura |
| `time-start` | time | ✓ | Orario inizio (HH:MM:SS) |
| `time-end` | time | ✓ | Orario fine (HH:MM:SS) |
| `id-laptop` | array | ✓ | Array di ID laptop da prenotare |

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Validazioni:**

- Data deve essere futura
- Orario fine deve essere successivo all'orario inizio
- Se prenotazione per oggi, orari non possono essere nel passato
- Formato orario: HH:MM:SS (00:00:00 - 23:59:59)
- Almeno un laptop deve essere selezionato
- Nessun laptop può avere prenotazioni sovrapposte nella stessa data

**Esempio richiesta (multipart/form-data):**
```
date: 2026-06-20
time-start: 09:00:00
time-end: 11:00:00
id-laptop: [1, 2, 3]
```

**Risposta Success (201):**
```json
{
  "status": "201 Created",
  "id_reservation": 5
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 400 | La data della prenotazione deve essere una data futura | Data passata |
| 400 | Orario di inizio non valido. Formato richiesto: HH:MM:SS | Formato orario errato |
| 400 | Orario di fine non valido. Formato richiesto: HH:MM:SS | Formato orario errato |
| 400 | L'orario di fine deve essere successivo all'orario di inizio | Orario inizio >= orario fine |
| 400 | L'orario di inizio deve essere successivo all'orario attuale | Orario nel passato (prenotazione oggi) |
| 400 | L'orario di fine deve essere successivo all'orario attuale | Orario nel passato (prenotazione oggi) |
| 400 | Seleziona almeno un laptop | Array id-laptop vuoto |
| 401 | Token non valido | JWT assente o non valido |
| 404 | Laptop {id} non trovato | ID laptop non esiste |
| 409 | I seguenti laptop hanno già una prenotazione in quell'orario: {ids} | Conflitto di prenotazione |

---

### 11. ELIMINA PRENOTAZIONE

**DELETE** `/reservations/{id}`

Elimina una prenotazione.

**Path Parameters:**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id` | integer | ID della prenotazione da eliminare |

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Nota:**
- L'utente può eliminare solo le proprie prenotazioni, tranne se admin
- L'admin può eliminare qualsiasi prenotazione

**Risposta Success (200):**
```json
{
  "status": "200 OK"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 401 | Accesso negato | Utente non proprietario della prenotazione |

---

### 12. OTTIENI ARMADIETTI

**GET** `/lockers`

Recupera l'elenco degli armadietti.

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (opzionali):**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id-locker` | integer | ID armadietto |
| `name` | string | Nome armadietto |
| `location` | string | Ubicazione |

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "lockers": [
    {
      "id_locker": 1,
      "name": "Armadietto A1",
      "location": "Aula 101"
    },
    {
      "id_locker": 2,
      "name": "Armadietto B1",
      "location": "Aula 102"
    }
  ]
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 404 | Not Found | Nessun armadietto trovato |

---

### 13. CREA ARMADIETTO

**POST** `/lockers`

Crea un nuovo armadietto.

**Parametri (form-data):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `name` | string | ✓ | Nome dell'armadietto |
| `location` | string | ✓ | Ubicazione dell'armadietto |

**Header richiesto:**
```
Authorization: Bearer <jwt_token> (admin only)
```

**Risposta Success (201):**
```json
{
  "status": "201 Created"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 403 | Accesso negato | Solo admin può accedere |

---

### 14. OTTIENI MODELLI

**GET** `/models`

Recupera l'elenco dei modelli di laptop disponibili.

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (opzionali):**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id-model` | integer | ID modello |
| `name` | string | Nome modello |
| `brand` | string | Brand produttore |

**Risposta Success (200):**
```json
{
  "status": "200 OK",
  "models": [
    {
      "id_model": 1,
      "name": "Dell XPS 13",
      "brand": "Dell",
      "specs": "Intel i7, 16GB RAM, 512GB SSD"
    }
  ]
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 404 | Not Found | Nessun modello trovato |

---

### 15. ELIMINA MODELLO

**DELETE** `/models/{id}`

Elimina un modello di laptop.

**Path Parameters:**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `id` | integer | ID del modello da eliminare |

**Header richiesto:**
```
Authorization: Bearer <jwt_token> (admin only)
```

**Risposta Success (200):**
```json
{
  "status": "200 OK"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 403 | Accesso negato | Solo admin può accedere |

---

### 16. HOMEPAGE

**GET** `/homepage`

Endpoint di verifica dello stato dell'API (richiede autenticazione).

**Header richiesto:**
```
Authorization: Bearer <jwt_token>
```

**Risposta Success (200):**
```json
{
  "status": "200 OK"
}
```

**Errori:**

| Codice | Messaggio | Causa |
|--------|-----------|-------|
| 401 | Token non valido | JWT assente o non valido |
| 405 | Method Not Allowed | Solo GET supportato |

---

## Codici HTTP

| Codice | Significato |
|--------|-------------|
| 200 | OK - Richiesta completata con successo |
| 201 | Created - Risorsa creata con successo |
| 400 | Bad Request - Errore nei parametri della richiesta |
| 401 | Unauthorized - Autenticazione richiesta o fallita |
| 403 | Forbidden - Accesso negato (permessi insufficienti) |
| 404 | Not Found - Risorsa non trovata |
| 405 | Method Not Allowed - Metodo HTTP non supportato |
| 406 | Not Acceptable - Richiesta non accettabile |
| 409 | Conflict - Conflitto nella richiesta (es. prenotazione sovrapposta) |

---

## Gestione degli Errori

Tutti gli errori seguono il seguente formato JSON:

```json
{
  "status": "HTTP_STATUS_CODE",
  "message": "Descrizione dell'errore"
}
```

Ogni errore restituisce anche l'header HTTP corrispondente.

---

## Specifiche Tecniche

### Filtraggio Query

Per tutti gli endpoint GET, è possibile filtrare i risultati utilizzando query parameters. I campi con underscores nel database vengono convertiti in parametri con trattini:

```
Campo DB: id_user    →    Parametro: id-user
Campo DB: time_start →    Parametro: time-start
```

### Transazioni

Le prenotazioni utilizzano transazioni MySQL per garantire consistenza:
- **Row-level locking** per evitare race conditions
- **Rollback automatico** in caso di conflitti
- **Atomic operations** per batch di prenotazioni

### Validazione Orari

- Formato richiesto: **HH:MM:SS** (24 ore)
- Intervallo valido: 00:00:00 - 23:59:59
- Verifica della sovrapposizione: due prenotazioni si sovrappongono se `A_start < B_end` AND `A_end > B_start`

### Ruoli Utente

| Ruolo | Permessi |
|-------|----------|
| **teacher** | Lettura, creazione prenotazioni, modifica password propria |
| **admin** | Tutte le operazioni, gestione utenti e inventario |

---

## Note di Sicurezza

- Le password sono sempre hashate con SHA-256
- I JWT token contengono il payload non criptato (verificare la firma)
- L'API richiede HTTPS in produzione
- I token scadono dopo un determinato periodo (controllare il timestamp `start`)
- Tutti i parametri sono sottoposti a prepared statements per prevenire SQL injection
