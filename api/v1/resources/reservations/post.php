<?php
include __DIR__ . "/../../checks/check_token.php";



// ── Validazione data ──────────────────────────────────────────────────────────
$today = date('Y-m-d');
if (!isset($_POST["date"]) || $_POST["date"] < $today) {
    $payload["status"] = "400 Bad Request";
    $payload["message"]  = "La data della prenotazione deve essere una data futura.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

// ── Validazione orari ─────────────────────────────────────────────────────────
$timeRegex = '/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/';

if (!isset($_POST["time-start"]) || !preg_match($timeRegex, $_POST["time-start"])) {
    $payload["status"] = "400 Bad Request";
    $payload["message"]  = "Orario di inizio non valido. Formato richiesto: HH:MM:SS";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

if (!isset($_POST["time-end"]) || !preg_match($timeRegex, $_POST["time-end"])) {
    $payload["status"] = "400 Bad Request";
    $payload["message"]  = "Orario di fine non valido. Formato richiesto: HH:MM:SS";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

if ($_POST["time-end"] <= $_POST["time-start"]) {
    $payload["status"] = "400 Bad Request";
    $payload["message"]  = "L'orario di fine deve essere successivo all'orario di inizio.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

// ── Se la prenotazione è per oggi, gli orari non possono essere nel passato ───
if ($_POST["date"] === $today) {
    $now = date('H:i:s');
    if ($_POST["time-start"] <= $now) {
        $payload["status"] = "400 Bad Request";
        $payload["message"]  = "L'orario di inizio deve essere successivo all'orario attuale.";
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($payload);
        exit();
    }
    if ($_POST["time-end"] <= $now) {
        $payload["status"] = "400 Bad Request";
        $payload["message"]  = "L'orario di fine deve essere successivo all'orario attuale.";
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($payload);
        exit();
    }
}

// ── Validazione laptop ────────────────────────────────────────────────────────
if (!isset($_POST["id-laptop"]) || !is_array($_POST["id-laptop"]) || count($_POST["id-laptop"]) === 0) {
    $payload["status"] = "400 Bad Request";
    $payload["message"]  = "Seleziona almeno un laptop.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

$laptopIds = $_POST["id-laptop"];

// ── Avvia transazione per evitare race condition ──────────────────────────────
mysqli_begin_transaction($conn);

// ── Controlla esistenza e sovrapposizione temporale per ogni laptop ───────────
$conflicted = [];

foreach ($laptopIds as $idLaptop) {

    // Verifica che il laptop esista (con lock di riga per la transazione)
    $checkStmt = mysqli_prepare($conn, "SELECT id_laptop FROM laptops WHERE id_laptop = ? FOR UPDATE");
    mysqli_stmt_bind_param($checkStmt, "s", $idLaptop);
    mysqli_stmt_execute($checkStmt);
    if (!mysqli_fetch_assoc(mysqli_stmt_get_result($checkStmt))) {
        mysqli_rollback($conn);
        $payload["status"] = "404 Not Found";
        $payload["message"]  = "Laptop $idLaptop non trovato.";
        header("HTTP/1.1 404 Not Found");
        echo json_encode($payload);
        exit();
    }

    // Verifica sovrapposizione temporale nella stessa data
    // Due intervalli [A_start, A_end) e [B_start, B_end) si sovrappongono se:
    //   A_start < B_end  AND  A_end > B_start
    $overlapStmt = mysqli_prepare($conn,
        "SELECT id_reservation FROM reservations
         WHERE id_laptop   = ?
           AND date        = ?
           AND status      = 'active'
           AND time_start  < ?
           AND time_end    > ?"
    );
    mysqli_stmt_bind_param($overlapStmt, "ssss",
        $idLaptop,
        $_POST["date"],
        $_POST["time-end"],
        $_POST["time-start"]
    );
    mysqli_stmt_execute($overlapStmt);

    if (mysqli_fetch_assoc(mysqli_stmt_get_result($overlapStmt))) {
        $conflicted[] = $idLaptop;
    }
}

if (count($conflicted) > 0) {
    mysqli_rollback($conn);
    $payload["status"] = "409 Conflict";
    $payload["message"]  = "I seguenti laptop hanno già una prenotazione in quell'orario: " . implode(", ", $conflicted);
    header("HTTP/1.1 409 Conflict");
    echo json_encode($payload);
    exit();
}

// ── Genera un id_reservation unico per tutto il gruppo ───────────────────────
$result = mysqli_query($conn, "SELECT COALESCE(MAX(id_reservation), 0) + 1 AS next_id FROM reservations");
$nextId = mysqli_fetch_assoc($result)["next_id"];

// ── Inserisci una riga per ogni laptop con lo stesso id_reservation ───────────
// NOTA: lo status del laptop NON viene toccato qui.
//       Ci pensano gli eventi schedulati ev_laptop_unavailable / ev_laptop_available
//       che girano ogni minuto e riflettono lo stato reale in tempo reale.
$stmtR = mysqli_prepare($conn,
    "INSERT INTO reservations (id_reservation, id_user, id_laptop, date, time_start, time_end, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')"
);

foreach ($laptopIds as $idLaptop) {
    mysqli_stmt_bind_param($stmtR, "iissss",
        $nextId,
        $token_decoded["payload"]["id-user"],
        $idLaptop,
        $_POST["date"],
        $_POST["time-start"],
        $_POST["time-end"]
    );
    mysqli_stmt_execute($stmtR);
}

mysqli_commit($conn);

$payload["status"]         = "201 Created";
$payload["id_reservation"] = $nextId;
header("HTTP/1.1 201 Created");
echo json_encode($payload);
?>