<?php
include __DIR__ . "/../../checks/check_token.php";

// ── Validazione data ──────────────────────────────────────────────────────────
$today = date('Y-m-d');
if (!isset($_POST["date"]) || $_POST["date"] < $today) {
    $payload["status"] = "400 Bad Request";
    $payload["error"]  = "La data della prenotazione deve essere una data futura.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

// ── Validazione orari ─────────────────────────────────────────────────────────
$timeRegex = '/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/';

if (!isset($_POST["time-start"]) || !preg_match($timeRegex, $_POST["time-start"])) {
    $payload["status"] = "400 Bad Request";
    $payload["error"]  = "Orario di inizio non valido. Formato richiesto: HH:MM:SS";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

if (!isset($_POST["time-end"]) || !preg_match($timeRegex, $_POST["time-end"])) {
    $payload["status"] = "400 Bad Request";
    $payload["error"]  = "Orario di fine non valido. Formato richiesto: HH:MM:SS";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

if ($_POST["time-end"] <= $_POST["time-start"]) {
    $payload["status"] = "400 Bad Request";
    $payload["error"]  = "L'orario di fine deve essere successivo all'orario di inizio.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

// ── Validazione laptop ────────────────────────────────────────────────────────
if (!isset($_POST["id-laptop"]) || !is_array($_POST["id-laptop"]) || count($_POST["id-laptop"]) === 0) {
    $payload["status"] = "400 Bad Request";
    $payload["error"]  = "Seleziona almeno un laptop.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}

$laptopIds = $_POST["id-laptop"];

// ── Controlla che tutti i laptop siano available ──────────────────────────────
$unavailable = [];
foreach ($laptopIds as $idLaptop) {
    $checkStmt = mysqli_prepare($conn, "SELECT status FROM laptops WHERE id_laptop = ?");
    mysqli_stmt_bind_param($checkStmt, "s", $idLaptop);
    mysqli_stmt_execute($checkStmt);
    $laptop = mysqli_fetch_assoc(mysqli_stmt_get_result($checkStmt));

    if (!$laptop) {
        $payload["status"] = "404 Not Found";
        $payload["error"]  = "Laptop $idLaptop non trovato.";
        header("HTTP/1.1 404 Not Found");
        echo json_encode($payload);
        exit();
    }

    if ($laptop["status"] !== "available") {
        $unavailable[] = $idLaptop;
    }
}

if (count($unavailable) > 0) {
    $payload["status"] = "409 Conflict";
    $payload["error"]  = "I seguenti laptop non sono disponibili: " . implode(", ", $unavailable);
    header("HTTP/1.1 409 Conflict");
    echo json_encode($payload);
    exit();
}

// ── Genera un id_reservation unico per tutto il gruppo ───────────────────────
$result = mysqli_query($conn, "SELECT COALESCE(MAX(id_reservation), 0) + 1 AS next_id FROM reservations");
$nextId = mysqli_fetch_assoc($result)["next_id"];

// ── Inserisci una riga per ogni laptop con lo stesso id_reservation ───────────
$stmtR = mysqli_prepare($conn,
    "INSERT INTO reservations (id_reservation, id_user, id_laptop, date, time_start, time_end, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')"
);
$stmtL = mysqli_prepare($conn,
    "UPDATE laptops SET status = 'unavailable' WHERE id_laptop = ?"
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

    mysqli_stmt_bind_param($stmtL, "s", $idLaptop);
    mysqli_stmt_execute($stmtL);
}

$payload["status"]       = "201 Created";
$payload["id_reservation"] = $nextId;
header("HTTP/1.1 201 Created");
?>