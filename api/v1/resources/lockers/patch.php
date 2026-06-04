<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";

if (empty($_PATCH_ID)) {
    $payload['status']  = '400 Bad Request';
    $payload['message'] = 'ID locker mancante.';
    header('HTTP/1.1 400 Bad Request');
    echo json_encode($payload);
    exit();
}

$fields = [];
$types  = '';
$values = [];

if (isset($_PATCH['name']) && trim($_PATCH['name']) !== '') {
    $fields[] = 'name_locker = ?';
    $types   .= 's';
    $values[] = trim($_PATCH['name']);
}
if (isset($_PATCH['location'])) {
    $fields[] = 'location = ?';
    $types   .= 's';
    $values[] = trim($_PATCH['location']);
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

$stmt = mysqli_prepare($conn, 'UPDATE lockers SET ' . implode(', ', $fields) . ' WHERE id_locker = ?');
mysqli_stmt_bind_param($stmt, $types, ...$values);
mysqli_stmt_execute($stmt);

$payload['status'] = '200 OK';
?>
