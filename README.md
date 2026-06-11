# AvoLaptop — Documentazione Backend API

> **Progetto:** Sistema di prenotazione PC portatili per l'Istituto Tecnico I.T.I.S. Avogadro  
> **Versione API:** v1  
> **Stack:** PHP 8.x · MariaDB 12 · Apache (mod_rewrite) · PHPMailer  
> **Autore:** Adam Ramli  
> **Anno scolastico:** 2025/2026

---

## Indice

1. [Panoramica del progetto](#1-panoramica-del-progetto)
2. [Struttura delle directory](#2-struttura-delle-directory)
3. [Database — Schema e logica](#3-database--schema-e-logica)
4. [Architettura del routing](#4-architettura-del-routing)
5. [Autenticazione e sicurezza](#5-autenticazione-e-sicurezza)
6. [Riferimento endpoint (URI)](#6-riferimento-endpoint-uri)
   - [POST /login](#post-login)
   - [GET /homepage](#get-homepage)
   - [POST /users](#post-users)
   - [GET /users](#get-users)
   - [PATCH /users](#patch-users)
   - [DELETE /users/{id}](#delete-usersid)
   - [POST /otp](#post-otp)
   - [GET /laptops](#get-laptops)
   - [POST /laptops](#post-laptops)
   - [DELETE /laptops/{id}](#delete-laptopsid)
   - [GET /lockers](#get-lockers)
   - [POST /lockers](#post-lockers)
   - [DELETE /lockers/{id}](#delete-lockersid)
   - [GET /models](#get-models)
   - [POST /models](#post-models)
   - [DELETE /models/{id}](#delete-modelsid)
   - [GET /reservations](#get-reservations)
   - [POST /reservations](#post-reservations)
   - [DELETE /reservations/{id}](#delete-reservationsid)
7. [Codici di risposta HTTP utilizzati](#7-codici-di-risposta-http-utilizzati)
8. [Formato delle risposte JSON](#8-formato-delle-risposte-json)
9. [Automazione — Eventi MariaDB](#9-automazione--eventi-mariadb)
10. [Considerazioni sulla sicurezza](#10-considerazioni-sulla-sicurezza)
11. [Dipendenze esterne](#11-dipendenze-esterne)

---

## 1. Panoramica del progetto

AvoLaptop è un'API REST sviluppata in PHP che permette ai **docenti** dell'istituto di prenotare PC portatili da armadi (locker) distribuiti nelle aule. Gli **amministratori** gestiscono il parco macchine, i modelli disponibili e gli armadi.

Il sistema espone un'unica base URI:

```
https://<host>/api/v1/<risorsa>
```

Tutte le risposte sono in formato **JSON** (`Content-Type: application/json`).

---

## 2. Struttura delle directory

```
avolaptop/
└── api/
    └── v1/
        ├── index.php                  ← Router principale (front controller)
        ├── .htaccess                  ← Riscrittura URL verso index.php
        ├── connections/
        │   └── connection.php         ← Connessione al database
        ├── checks/
        │   ├── check_token.php        ← Middleware verifica JWT
        │   └── check_admin.php        ← Middleware verifica ruolo admin
        ├── access/
        │   └── login.php              ← Autenticazione e generazione JWT
        ├── home/
        │   └── homepage.php           ← Endpoint di test
        ├── resources/
        │   ├── otp.php                ← Verifica codice OTP
        │   ├── laptops/
        │   │   ├── get.php
        │   │   ├── post.php
        │   │   └── delete.php
        │   ├── lockers/
        │   │   ├── get.php
        │   │   ├── post.php
        │   │   └── delete.php
        │   ├── models/
        │   │   ├── get.php
        │   │   ├── post.php
        │   │   └── delete.php
        │   ├── reservations/
        │   │   ├── get.php
        │   │   ├── post.php
        │   │   └── delete.php
        │   └── users/
        │       ├── get.php
        │       ├── post.php
        │       ├── patch.php
        │       └── delete.php
        └── PHPMailer/                 ← Libreria per invio email (SMTP)
```

---

## 3. Database — Schema e logica

Il database si chiama `avolaptop` ed è gestito con **MariaDB 12**. Contiene cinque tabelle principali, collegate tramite chiavi esterne con cascade su UPDATE e DELETE.

### Diagramma delle relazioni

```
models (1) ──────< laptops >────── (1) lockers
                      │
                      │ (1)
                      ▼
                 reservations >────── (1) users
```

---

### Tabella `models`

Catalogo dei modelli di laptop disponibili.

| Colonna    | Tipo          | Note                                  |
|------------|---------------|---------------------------------------|
| `id_model` | INT, PK, AUTO | Identificatore univoco del modello    |
| `brand`    | VARCHAR(100)  | Marca (es. Lenovo, HP, Dell)          |
| `model`    | VARCHAR(100)  | Nome commerciale (es. ThinkPad E15)   |
| `cpu`      | VARCHAR(100)  | Processore (nullable)                 |
| `ram`      | INT           | RAM in GB (nullable)                  |
| `storage`  | INT           | Storage in GB (nullable)              |
| `os`       | VARCHAR(50)   | Sistema operativo (nullable)          |

**Scopo:** disaccoppia la specifica tecnica del laptop dalla singola unità fisica. Più laptop fisici possono condividere lo stesso modello.

---

### Tabella `lockers`

Armadi fisici in cui sono riposti i laptop.

| Colonna       | Tipo          | Note                                               |
|---------------|---------------|----------------------------------------------------|
| `id_locker`   | INT, PK, AUTO | Identificatore univoco dell'armadio                |
| `name_locker` | VARCHAR(100)  | Nome descrittivo (es. "Armadietto A")              |
| `location`    | ENUM          | Posizione nell'istituto (aule T01–T06, lab, ecc.)  |

Il campo `location` è un ENUM che elenca tutte le aule dell'istituto: aule teoriche (`T01`–`T06`), aule pratiche (`P101`–`P306`), laboratori (`Lab Informatica 1`–`Lab Fisica`), `Aula Magna`, `Biblioteca`, `Palestra`. Questo garantisce che non vengano inserite posizioni inesistenti.

---

### Tabella `laptops`

Unità fisiche di laptop, collegate a un modello e a un armadio.

| Colonna     | Tipo          | Note                                                    |
|-------------|---------------|---------------------------------------------------------|
| `id_laptop` | INT, PK, AUTO | Identificatore univoco del laptop                       |
| `id_model`  | INT, FK       | Riferimento a `models`                                  |
| `id_locker` | INT, FK       | Riferimento a `lockers`                                 |
| `status`    | ENUM          | `available` · `unavailable` · `maintenance`             |

Il campo `status` riflette la disponibilità in tempo reale:
- `available`: il laptop è libero e prenotabile.
- `unavailable`: è attualmente in uso (aggiornato automaticamente dagli eventi DB).
- `maintenance`: guasto o fuori servizio; non può essere prenotato e non viene toccato dagli eventi automatici.

---

### Tabella `users`

Utenti del sistema (docenti e amministratori).

| Colonna    | Tipo            | Note                                                        |
|------------|-----------------|-------------------------------------------------------------|
| `id_user`  | INT, PK, AUTO   | Identificatore univoco                                      |
| `name`     | VARCHAR(100)    | Nome                                                        |
| `surname`  | VARCHAR(100)    | Cognome                                                     |
| `email`    | VARCHAR(150), UNIQUE | Email (solo domini `@gmail.com` accettati in fase di registrazione) |
| `password` | CHAR(64)        | Hash SHA-256 della password                                 |
| `role`     | ENUM            | `admin` · `teacher` (default: `teacher`)                    |
| `verified` | TINYINT(1)      | `0` = non verificato, `1` = email verificata                |
| `otp`      | MEDIUMINT       | Codice OTP a 6 cifre generato alla registrazione            |
| `otp_time` | TIMESTAMP       | Timestamp di generazione OTP (aggiornato automaticamente)   |

Un utente con `verified = 0` non può effettuare il login. L'evento `ev_control_otp` elimina automaticamente gli account non verificati dopo 1 minuto dalla generazione dell'OTP, prevenendo la registrazione di account "fantasma".

---

### Tabella `reservations`

Prenotazioni effettuate dagli utenti.

| Colonna          | Tipo          | Note                                                      |
|------------------|---------------|-----------------------------------------------------------|
| `id_reservation` | INT, PK       | Stesso ID per più righe della stessa prenotazione (gruppo)|
| `id_user`        | INT, FK, PK   | Utente che ha effettuato la prenotazione                  |
| `id_laptop`      | INT, FK, PK   | Laptop prenotato                                          |
| `date`           | DATE          | Giorno della prenotazione                                 |
| `time_start`     | TIME          | Orario di inizio                                          |
| `time_end`       | TIME          | Orario di fine                                            |
| `status`         | ENUM          | `active` · `completed`                                    |
| `class`          | ENUM          | Classe che utilizza i laptop (es. `3AI`, `5BL`)           |
| `classroom`      | ENUM          | Aula in cui vengono portati i laptop                      |

**Chiave primaria composta:** `(id_reservation, id_user, id_laptop)`. Questo design permette di raggruppare più laptop sotto un unico `id_reservation`, rappresentando una prenotazione multipla fatta in un'unica operazione. Il campo `class` elenca tutte le classi dell'istituto per i diversi indirizzi (informatica, meccanica, elettronica, ecc.).

---

## 4. Architettura del routing

Il routing è implementato tramite un **front controller** (`index.php`) combinato con la riscrittura URL di Apache.

### `.htaccess`

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

Tutte le richieste che non corrispondono a file o directory esistenti vengono instradate verso `index.php`. Il flag `QSA` (Query String Append) preserva i parametri GET.

### Logica di parsing dell'URI in `index.php`

```php
$uri_elements = array_slice(explode("/", $requestUri), 4);
$called_resource = explode("?", $uri_elements[count($uri_elements) - 1])[0];
```

L'URI viene spezzata per `/` e si saltano i primi 4 segmenti (`/api/v1/`) per ottenere la risorsa chiamata. I parametri query string vengono separati dal nome della risorsa.

### Tabella di routing

| Metodo   | Risorsa         | File incluso                               | Auth richiesta |
|----------|-----------------|--------------------------------------------|----------------|
| `GET`    | `homepage`      | `home/homepage.php`                        | No             |
| `GET`    | `laptops`       | `resources/laptops/get.php`                | JWT            |
| `GET`    | `reservations`  | `resources/reservations/get.php`           | JWT            |
| `GET`    | `users`         | `resources/users/get.php`                  | JWT + Admin    |
| `GET`    | `lockers`       | `resources/lockers/get.php`                | JWT            |
| `GET`    | `models`        | `resources/models/get.php`                 | JWT            |
| `POST`   | `login`         | `access/login.php`                         | No             |
| `POST`   | `users`         | `resources/users/post.php`                 | No             |
| `POST`   | `laptops`       | `resources/laptops/post.php`               | JWT + Admin    |
| `POST`   | `reservations`  | `resources/reservations/post.php`          | JWT            |
| `POST`   | `lockers`       | `resources/lockers/post.php`               | JWT + Admin    |
| `POST`   | `models`        | `resources/models/post.php`                | JWT + Admin    |
| `POST`   | `otp`           | `resources/otp.php`                        | JWT (non verified) |
| `PATCH`  | `users`         | `resources/users/patch.php`                | JWT            |
| `DELETE` | `laptops/{id}`  | `resources/laptops/delete.php`             | JWT + Admin    |
| `DELETE` | `reservations/{id}` | `resources/reservations/delete.php`    | JWT (owner o Admin) |
| `DELETE` | `users/{id}`    | `resources/users/delete.php`               | JWT + Admin    |
| `DELETE` | `lockers/{id}`  | `resources/lockers/delete.php`             | JWT + Admin    |
| `DELETE` | `models/{id}`   | `resources/models/delete.php`              | JWT + Admin    |

Qualsiasi metodo non previsto restituisce `405 Method Not Allowed`. Qualsiasi risorsa non esistente restituisce `404 Not Found`.

---

## 5. Autenticazione e sicurezza

### 5.1 Hashing della password

Le password non vengono mai salvate in chiaro. Al momento della registrazione e del login viene applicato l'algoritmo **SHA-256**:

```php
$pass = hash("sha256", $_POST["password"]);
```

Il digest risultante (64 caratteri esadecimali) viene salvato nella colonna `password CHAR(64)`.

### 5.2 JWT — JSON Web Token

L'API utilizza un sistema JWT **implementato manualmente** (senza librerie esterne) per autenticare le richieste successive al login.

**Struttura del token:**

```
base64url(header) . base64url(payload) . base64url(firma HMAC-SHA256)
```

**Header:**
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload:**
```json
{
  "id-user": 42,
  "name": "Mario",
  "surname": "Rossi",
  "email": "mario.rossi@gmail.com",
  "password": "<sha256>",
  "verified": 1,
  "admin": false,
  "start": 1749600000
}
```

Il campo `start` contiene il timestamp UNIX di emissione del token.

**Firma:**
```php
$signature = base64url_encode(
    hash_hmac("sha256", $header_enc . "." . $payload_enc, $secret, true)
);
```

**Scadenza del token:**
- Token ordinario: **86400 secondi (24 ore)** dalla creazione.
- Token per verifica OTP: **300 secondi (5 minuti)** dalla creazione.

```php
if ($payload['start'] + 86400 <= time() && $called_resource != "otp") {
    $valid = false;
}
else if ($called_resource == "otp" && $payload['start'] + 300 <= time()) {
    $valid = false;
}
```

**Confronto sicuro della firma:** per prevenire attacchi di timing, la verifica usa `hash_equals()` invece del semplice operatore `==`:

```php
$valid = hash_equals($expected_signature, $signature);
```

### 5.3 Come inviare il token

Il token va passato come **header HTTP personalizzato** `token`:

```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Se il token è assente, scaduto o non valido, l'API risponde con `498 Invalid Token`.

### 5.4 Controllo del ruolo admin

Il middleware `check_admin.php` viene incluso dopo `check_token.php` negli endpoint riservati. Verifica che il campo `admin` nel payload del JWT sia `true`:

```php
if (!$token_decoded["payload"]["admin"]) {
    // 401 Unauthorized
}
```

### 5.5 Prepared Statements — Prevenzione SQL Injection

Tutte le query che accettano input dell'utente usano **prepared statements** con binding dei parametri:

```php
$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE email = ? AND password = ?");
mysqli_stmt_bind_param($stmt, "ss", $email, $pass);
mysqli_stmt_execute($stmt);
```

Questo approccio garantisce che i dati forniti dal client non vengano mai interpretati come codice SQL, prevenendo completamente gli attacchi di SQL Injection.

### 5.6 Verifica OTP e flusso di registrazione

Al momento della registrazione, l'utente viene creato con `verified = 0` e riceve via email un codice OTP a 6 cifre generato con `random_int(100000, 999999)`. Viene emesso contestualmente un JWT con `verified = 0` valido 5 minuti, da usare esclusivamente per chiamare `POST /otp`.

```
[POST /users] → crea utente (verified=0) → invia email OTP → restituisce JWT temporaneo
[POST /otp]   → verifica codice → imposta verified=1 nel DB
[POST /login] → login normale con credenziali → restituisce JWT definitivo (24h)
```

Un account non verificato entro 1 minuto dalla registrazione viene **eliminato automaticamente** dall'evento `ev_control_otp`, mantenendo il database pulito.

### 5.7 Validazione dell'input

Oltre ai prepared statements, la logica applicativa include validazioni esplicite:

- **Password:** minimo 8 caratteri.
- **Dominio email:** solo `@gmail.com` accettato in registrazione.
- **Orari prenotazione:** regex `/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/` — formato `HH:MM:SS`.
- **Data prenotazione:** deve essere uguale o successiva alla data odierna.
- **Orario start/end:** `time_end > time_start`; se la data è oggi, entrambi devono essere nel futuro.

### 5.8 Gestione delle race condition nelle prenotazioni

Per prevenire doppie prenotazioni in caso di richieste concorrenti, il `POST /reservations` utilizza le **transazioni MySQL** con blocco di riga (`FOR UPDATE`):

```php
mysqli_begin_transaction($conn);

// lock di riga per ogni laptop
$stmt = mysqli_prepare($conn, "SELECT id_laptop, status FROM laptops WHERE id_laptop = ? FOR UPDATE");

// ... verifica conflitti ...

mysqli_commit($conn);   // oppure mysqli_rollback($conn)
```

Questo garantisce che tra il controllo di disponibilità e l'inserimento non possa intervenire un'altra richiesta che prenoti lo stesso laptop nello stesso slot orario.

---

## 6. Riferimento endpoint (URI)

La base URL è: `https://<host>/api/v1/`

---

### POST /login

Autenticazione dell'utente. Non richiede token.

**Body (form-data):**

| Campo      | Tipo   | Obbligatorio | Descrizione        |
|------------|--------|--------------|--------------------|
| `email`    | string | Sì           | Email dell'utente  |
| `password` | string | Sì           | Password in chiaro |

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "message": "Successful",
  "token": "<JWT>"
}
```

**Risposta 401:** credenziali errate o account non verificato.

---

### GET /homepage

Endpoint di test. Non richiede autenticazione.

**Risposta 200 OK:**
```json
{ "status": "200 OK" }
```

---

### POST /users

Registrazione di un nuovo utente (docente). Non richiede token.

**Body (form-data):**

| Campo      | Tipo   | Obbligatorio | Descrizione                          |
|------------|--------|--------------|--------------------------------------|
| `name`     | string | Sì           | Nome                                 |
| `surname`  | string | Sì           | Cognome                              |
| `email`    | string | Sì           | Indirizzo email (`@gmail.com`)       |
| `password` | string | Sì           | Password (min. 8 caratteri)         |

**Risposta 201 Created:**
```json
{
  "status": "201 Created",
  "message": "Verifica l'account con il codice OTP inviato via mail",
  "token": "<JWT temporaneo 5min>"
}
```

**Risposte errore:** `401` (password corta, dominio non valido), `406` (utente già esistente).

---

### GET /users

Lista utenti. Richiede **JWT + ruolo Admin**.

**Query parameters opzionali:** qualsiasi colonna della tabella `users` con notazione kebab-case (es. `id-user`, `name`, `surname`, `email`, `role`, `verified`).

**Esempi:**
```
GET /api/v1/users
GET /api/v1/users?role=admin
GET /api/v1/users?email=mario.rossi@gmail.com
```

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "users": [
    {
      "id_user": 1,
      "name": "Admin",
      "surname": "Sistema",
      "email": "admin@itisavogadro.it",
      "password": "<sha256>",
      "role": "admin",
      "verified": 1,
      "otp": null,
      "otp_time": null
    }
  ]
}
```

---

### PATCH /users

Modifica la password dell'utente autenticato. Richiede **JWT valido**.

**Body (raw, URL-encoded):**

| Campo      | Tipo   | Obbligatorio | Descrizione                         |
|------------|--------|--------------|-------------------------------------|
| `password` | string | Sì           | Nuova password (min. 8 caratteri)   |

L'identità dell'utente da modificare viene ricavata direttamente dal payload del JWT, senza necessità di specificare un ID.

**Risposta 200 OK:**
```json
{ "status": "200 OK" }
```

---

### DELETE /users/{id}

Elimina un utente. Richiede **JWT + ruolo Admin**.

```
DELETE /api/v1/users/42
```

**Risposta 200 OK:**
```json
{ "status": "200 OK" }
```

---

### POST /otp

Verifica il codice OTP per confermare l'email. Richiede il **JWT temporaneo** (5 minuti) emesso alla registrazione.

**Body (form-data):**

| Campo | Tipo   | Obbligatorio | Descrizione        |
|-------|--------|--------------|--------------------|
| `otp` | string | Sì           | Codice OTP a 6 cifre ricevuto via email |

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "message": "Account verificato con successo"
}
```

**Risposta 406:** codice OTP non valido.

---

### GET /laptops

Lista laptop con dettagli modello e armadio. Richiede **JWT valido**.

**Query parameters opzionali:** qualsiasi colonna di `laptops`, `models` o `lockers` in formato kebab-case.

**Esempi:**
```
GET /api/v1/laptops
GET /api/v1/laptops?status=available
GET /api/v1/laptops?id-locker=2
GET /api/v1/laptops?brand=Lenovo
```

**Percorso annidato (laptop di un locker specifico):**
```
GET /api/v1/lockers/2/laptops
```

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "laptops": [
    {
      "id_laptop": 1,
      "status": "available",
      "model": {
        "id_model": 1,
        "brand": "Lenovo",
        "model": "ThinkPad E15",
        "cpu": "Intel Core i5-1235U",
        "ram": 16,
        "storage": 512,
        "os": "Windows 11 Pro"
      },
      "locker": {
        "id_locker": 1,
        "name_locker": "Armadietto A",
        "location": "T03"
      }
    }
  ]
}
```

---

### POST /laptops

Aggiunge un nuovo laptop. Richiede **JWT + ruolo Admin**.

**Body (form-data):**

| Campo      | Tipo   | Obbligatorio | Descrizione                                    |
|------------|--------|--------------|------------------------------------------------|
| `id-model` | int    | Sì           | ID del modello (FK → `models.id_model`)        |
| `id-locker`| int    | Sì           | ID dell'armadio (FK → `lockers.id_locker`)     |
| `status`   | string | Sì           | `available`, `unavailable` o `maintenance`     |

**Risposta 201 Created:**
```json
{ "status": "201 Created" }
```

---

### DELETE /laptops/{id}

Elimina un laptop. Richiede **JWT + ruolo Admin**.

```
DELETE /api/v1/laptops/5
```

---

### GET /lockers

Lista armadi. Richiede **JWT valido**.

**Query parameters opzionali:** `id-locker`, `name-locker`, `location`.

```
GET /api/v1/lockers
GET /api/v1/lockers?location=T03
```

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "lockers": [
    { "id_locker": 1, "name_locker": "Armadietto A", "location": "T03" }
  ]
}
```

---

### POST /lockers

Crea un nuovo armadio. Richiede **JWT + ruolo Admin**.

**Body (form-data):**

| Campo      | Tipo   | Obbligatorio | Descrizione                          |
|------------|--------|--------------|--------------------------------------|
| `name`     | string | Sì           | Nome dell'armadio                    |
| `location` | string | No           | Posizione (valore ENUM valido)       |

**Risposta 201 Created:**
```json
{ "status": "201 Created" }
```

---

### DELETE /lockers/{id}

Elimina un armadio. Richiede **JWT + ruolo Admin**. Per via del `CASCADE`, elimina anche tutti i laptop contenuti nell'armadio e le relative prenotazioni.

```
DELETE /api/v1/lockers/3
```

---

### GET /models

Lista modelli di laptop. Richiede **JWT valido**.

**Query parameters opzionali:** `id-model`, `brand`, `model`, `cpu`, `ram`, `storage`, `os`.

```
GET /api/v1/models
GET /api/v1/models?brand=HP
GET /api/v1/models?ram=16
```

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "models": [
    {
      "id_model": 1,
      "brand": "Lenovo",
      "model": "ThinkPad E15",
      "cpu": "Intel Core i5-1235U",
      "ram": 16,
      "storage": 512,
      "os": "Windows 11 Pro"
    }
  ]
}
```

---

### POST /models

Aggiunge un nuovo modello. Richiede **JWT + ruolo Admin**.

**Body (form-data):**

| Campo     | Tipo   | Obbligatorio | Descrizione              |
|-----------|--------|--------------|--------------------------|
| `brand`   | string | Sì           | Marca                    |
| `model`   | string | Sì           | Nome del modello         |
| `cpu`     | string | No           | Processore               |
| `ram`     | int    | No           | RAM in GB                |
| `storage` | int    | No           | Storage in GB            |
| `os`      | string | No           | Sistema operativo        |

**Risposta 201 Created:**
```json
{ "status": "201 Created" }
```

---

### DELETE /models/{id}

Elimina un modello. Richiede **JWT + ruolo Admin**. Per via del `CASCADE`, elimina anche tutti i laptop di quel modello e le relative prenotazioni.

```
DELETE /api/v1/models/3
```

---

### GET /reservations

Lista prenotazioni con dati completi (laptop, modello, armadio, utente). Richiede **JWT valido**.

**Query parameters opzionali:** `id-reservation`, `id-user`, `id-laptop`, `date`, `status`, `class`, `classroom`.

```
GET /api/v1/reservations
GET /api/v1/reservations?status=active
GET /api/v1/reservations?id-user=42
GET /api/v1/reservations?date=2026-06-12
GET /api/v1/reservations?classroom=Palestra
```

**Risposta 200 OK:**
```json
{
  "status": "200 OK",
  "reservations": [
    {
      "id_reservation": 7,
      "date": "2026-06-12",
      "time_start": "15:00:00",
      "time_end": "16:00:00",
      "status": "active",
      "class": "1AI",
      "classroom": "Palestra",
      "laptop": {
        "id_laptop": 3,
        "status": "available",
        "model": {
          "id_model": 2,
          "brand": "HP",
          "model": "ProBook 450 G9",
          "cpu": "Intel Core i5-1235U",
          "ram": 8,
          "storage": 256,
          "os": "Windows 11 Pro"
        },
        "locker": {
          "id_locker": 1,
          "name_locker": "Armadietto A",
          "location": "T03"
        }
      },
      "user": {
        "id_user": 1,
        "name": "Admin",
        "surname": "Sistema",
        "email": "admin@itisavogadro.it",
        "role": "admin"
      }
    }
  ]
}
```

---

### POST /reservations

Crea una nuova prenotazione per uno o più laptop. Richiede **JWT valido**.

**Body (form-data):**

| Campo        | Tipo     | Obbligatorio | Descrizione                                         |
|--------------|----------|--------------|-----------------------------------------------------|
| `class`      | string   | Sì           | Classe richiedente (es. `3AI`, `5BL`)               |
| `classroom`  | string   | Sì           | Aula dove verranno usati i laptop                   |
| `date`       | string   | Sì           | Data in formato `YYYY-MM-DD` (non nel passato)      |
| `time-start` | string   | Sì           | Orario inizio `HH:MM:SS`                            |
| `time-end`   | string   | Sì           | Orario fine `HH:MM:SS` (deve essere > time-start)   |
| `id-laptop[]`| int[]    | Sì           | Array di ID laptop da prenotare (almeno 1)          |

**Flusso di validazione interno:**
1. Controllo campi obbligatori.
2. Validazione data (non nel passato).
3. Validazione formato orari con regex.
4. Controllo `time_end > time_start`.
5. Se `date == oggi`: controllo che gli orari siano nel futuro.
6. Avvio transazione + lock di riga su ogni laptop (`FOR UPDATE`).
7. Per ogni laptop: verifica che non sia in `maintenance`.
8. Per ogni laptop: verifica che non ci siano prenotazioni `active` sovrapposte (query con `time_start < time-end AND time_end > time-start`).
9. Se tutto OK: inserimento di una riga per ogni laptop con lo stesso `id_reservation`.

**Risposta 201 Created:**
```json
{
  "status": "201 Created",
  "id_reservation": 8
}
```

**Risposta 409 Conflict:** laptop in manutenzione o con sovrapposizione oraria.

---

### DELETE /reservations/{id}

Cancella una prenotazione. Richiede **JWT valido**. 

- Un **docente** può cancellare solo le proprie prenotazioni.
- Un **admin** può cancellare qualsiasi prenotazione.
- Non è possibile cancellare prenotazioni con `status = 'completed'`.

```
DELETE /api/v1/reservations/7
```

**Risposta 200 OK:**
```json
{ "status": "200 OK" }
```

**Risposta 401:** prenotazione completata o non di proprietà dell'utente.

---

## 7. Codici di risposta HTTP utilizzati

| Codice | Significato            | Utilizzo nell'API                                                |
|--------|------------------------|------------------------------------------------------------------|
| `200`  | OK                     | Operazione riuscita (GET, PATCH, DELETE, login)                  |
| `201`  | Created                | Risorsa creata con successo (POST)                               |
| `400`  | Bad Request            | Parametri mancanti o dati non validi                             |
| `401`  | Unauthorized           | Credenziali errate, token mancante, account non verificato, autorizzazione insufficiente |
| `404`  | Not Found              | Risorsa non trovata                                              |
| `405`  | Method Not Allowed     | Metodo HTTP non supportato per quell'endpoint                    |
| `406`  | Not Acceptable         | OTP errato, utente già esistente                                 |
| `409`  | Conflict               | Laptop in manutenzione o prenotazione sovrapposta                |
| `498`  | Invalid Token          | Token JWT assente, malformato o scaduto                          |

---

## 8. Formato delle risposte JSON

Ogni risposta contiene sempre il campo `status` con il codice HTTP come stringa. In caso di errore è quasi sempre presente anche `message` con una descrizione leggibile.

**Risposta di successo generica:**
```json
{ "status": "200 OK" }
```

**Risposta di errore:**
```json
{
  "status": "401 Unauthorized",
  "message": "Credenziali non valide"
}
```

**Risposta con dati:**
```json
{
  "status": "200 OK",
  "laptops": [ ... ]
}
```

---

## 9. Automazione — Eventi MariaDB

Il database include quattro **eventi schedulati** che girano ogni minuto e automatizzano la gestione dello stato dell'applicazione senza intervento manuale.

### `ev_complete_reservations`

Marca come `completed` tutte le prenotazioni `active` la cui data/ora di fine è già passata.

```sql
UPDATE reservations
SET status = 'completed'
WHERE status = 'active'
  AND (date < CURDATE() OR (date = CURDATE() AND time_end <= CURTIME()))
```

### `ev_laptop_unavailable`

Imposta i laptop come `unavailable` non appena inizia una loro prenotazione attiva.

```sql
UPDATE laptops l SET l.status = 'unavailable'
WHERE l.status = 'available'
  AND EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id_laptop = l.id_laptop AND r.status = 'active'
      AND r.date = CURDATE()
      AND r.time_start <= CURTIME() AND r.time_end > CURTIME()
  )
```

### `ev_laptop_available`

Riporta i laptop a `available` al termine della loro prenotazione. **Non tocca** i laptop in `maintenance`.

```sql
UPDATE laptops l SET l.status = 'available'
WHERE l.status = 'unavailable'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id_laptop = l.id_laptop AND r.status = 'active'
      AND r.date = CURDATE()
      AND r.time_start <= CURTIME() AND r.time_end > CURTIME()
  )
```

### `ev_control_otp`

Elimina gli account non verificati (`verified = 0`) per cui è passato più di 1 minuto dalla generazione dell'OTP.

```sql
DELETE FROM users
WHERE otp_time IS NOT NULL AND verified = 0
  AND otp_time < NOW() - INTERVAL 1 MINUTE
```

Questi quattro eventi lavorano in sinergia: garantiscono che lo `status` dei laptop rispecchi sempre la realtà, che le prenotazioni vengano chiuse automaticamente e che il database non si riempia di utenti-fantasma.

---

## 10. Considerazioni sulla sicurezza

| Aspetto                          | Implementazione                                              |
|----------------------------------|--------------------------------------------------------------|
| Autenticazione stateless         | JWT HS256 implementato manualmente, nessuna sessione server  |
| Protezione password              | SHA-256 prima di qualsiasi operazione sul DB                 |
| SQL Injection                    | Prepared statements con `mysqli_prepare` + `bind_param`      |
| Timing attacks sulla firma JWT   | `hash_equals()` per confronto costante nel tempo             |
| Accesso alle risorse             | Middleware `check_token.php` e `check_admin.php` inclusi     |
| Verifica email                   | OTP 6 cifre via SMTP + JWT temporaneo 5 minuti              |
| Account non verificati           | Eliminazione automatica dopo 1 minuto (evento DB)            |
| Race condition prenotazioni      | Transazioni + `SELECT ... FOR UPDATE` (row-level locking)    |
| Validazione input lato server    | Regex, controlli di tipo, range date/ora                     |
| Routing                          | Front controller unico; `.htaccess` redirige tutto a `index.php` |

> **Nota per lo sviluppo futuro:** il `secret` del JWT è hardcoded nel sorgente. In un ambiente di produzione andrebbe spostato in una variabile d'ambiente o in un file di configurazione esterno non versionato.

---

## 11. Dipendenze esterne

| Libreria    | Versione  | Utilizzo                                        |
|-------------|-----------|--------------------------------------------------|
| PHPMailer   | 6.x       | Invio email SMTP (Gmail) per verifica OTP        |
| MariaDB     | 12.2.2    | Database relazionale                             |
| PHP         | 8.5.x     | Runtime del backend                              |
| Apache      | 2.4+      | Web server con `mod_rewrite` per il routing      |

PHPMailer viene configurato con SMTP su Gmail (porta 587, STARTTLS) per l'invio dei codici OTP durante la registrazione.

---

*Progetto di maturità — I.T.I.S. Avogadro, a.s. 2025/2026*
