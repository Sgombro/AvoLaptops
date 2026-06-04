<?php
include __DIR__ . "/../../checks/check_token.php";

// ── Admin: modifica ruolo / verifica di un altro utente ──────────────────────
if (!empty($_PATCH_ID)) {
    include __DIR__ . "/../../checks/check_admin.php";

    $fields = [];
    $types  = '';
    $values = [];

    if (isset($_PATCH['role']) && in_array($_PATCH['role'], ['admin', 'teacher'])) {
        $fields[] = 'role = ?';
        $types   .= 's';
        $values[] = $_PATCH['role'];
    }
    if (isset($_PATCH['verified'])) {
        $fields[] = 'verified = ?';
        $types   .= 'i';
        $values[] = (int)$_PATCH['verified'];
    }

    if (empty($fields)) {
        $payload['status']  = '400 Bad Request';
        $payload['message'] = 'Nessun campo da aggiornare.';
        header('HTTP/1.1 400 Bad Request');
        echo json_encode($payload);
        exit();
    }

    $values[] = (int)$_PATCH_ID;
    $types   .= 'i';

    $stmt = mysqli_prepare($conn, 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id_user = ?');
    mysqli_stmt_bind_param($stmt, $types, ...$values);
    mysqli_stmt_execute($stmt);

    $payload['status'] = '200 OK';
    return; // lascia che index.php faccia echo
}

// ── Utente: cambio propria password ──────────────────────────────────────────
if (!isset($_PATCH['password'])) {
    $payload['status'] = "400 Bad Request";
    header("HTTP/1.1 400 Bad Request");
    $payload["message"] = "Immetti la nuova password";
    echo json_encode($payload);
    exit();
}

if (strlen($_PATCH["password"]) < 8) {
    $payload["status"] = "400 Bad Request";
    header("HTTP/1.1 400 Bad Request");
    $payload["message"] = "La password deve essere lunga 8 cifre";
    echo json_encode($payload);
    exit();
}

$query = "UPDATE users SET password = ? WHERE email = ?";
$stmt  = mysqli_prepare($conn, $query);
$hash_pass = hash("sha256", $_PATCH["password"]);
mysqli_stmt_bind_param($stmt, "ss", $hash_pass, $token_decoded["payload"]['email']);
mysqli_stmt_execute($stmt);
