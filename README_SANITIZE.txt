
Cose da configurare prima di usare il progetto:
1) Credenziali database
   - api/v1/connections/connection.php
     Imposta $host, $user, $pass, $dbname con i valori reali.

2) Segreto JWT (deve essere uguale in tutti i file sotto)
   - api/v1/checks/check_token.php
   - api/v1/access/login.php
   - api/v1/resources/users/post.php
     Sostituisci CHANGE_ME_JWT_SECRET con un segreto sicuro.

3) Credenziali SMTP per invio OTP
   - api/v1/resources/users/post.php
     Sostituisci:
       CHANGE_ME_SMTP_USER
       CHANGE_ME_SMTP_PASSWORD
     e controlla Host/Port/SMTPSecure secondo il tuo provider.

Note:
- I placeholder sono stati messi solo nella copia sanitizzata.
- Se usi un dominio diverso da gmail.com per la registrazione, aggiorna anche la logica nel file users/post.php.
