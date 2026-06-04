<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";

if (empty($_PATCH_ID)) {
    $payload['status']  = '400 Bad Request';
    $payload['message'] = 'ID modello mancante.';
    header('HTTP/1.1 400 Bad Request');
    echo json_encode($payload);
    exit();
}

$fields = [];
$types  = '';
$values = [];

if (isset($_PATCH['brand']) && trim($_PATCH['brand']) !== '') {
    $fields[] = 'brand = ?';
    $types   .= 's';
    $values[] = trim($_PATCH['brand']);
}
if (isset($_PATCH['model']) && trim($_PATCH['model']) !== '') {
    $fields[] = 'model = ?';
    $types   .= 's';
    $values[] = trim($_PATCH['model']);
}
if (isset($_PATCH['cpu']) && trim($_PATCH['cpu']) !== '') {
    $fields[] = 'cpu = ?';
    $types   .= 's';
    $values[] = trim($_PATCH['cpu']);
}
if (isset($_PATCH['ram']) && is_numeric($_PATCH['ram'])) {
    $fields[] = 'ram = ?';
    $types   .= 'i';
    $values[] = (int)$_PATCH['ram'];
}
if (isset($_PATCH['storage']) && is_numeric($_PATCH['storage'])) {
    $fields[] = 'storage = ?';
    $types   .= 'i';
    $values[] = (int)$_PATCH['storage'];
}
if (isset($_PATCH['os']) && trim($_PATCH['os']) !== '') {
    $fields[] = 'os = ?';
    $types   .= 's';
    $values[] = trim($_PATCH['os']);
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

$stmt = mysqli_prepare($conn, 'UPDATE models SET ' . implode(', ', $fields) . ' WHERE id_model = ?');
mysqli_stmt_bind_param($stmt, $types, ...$values);
mysqli_stmt_execute($stmt);

$payload['status'] = '200 OK';
?>
