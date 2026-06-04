<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";

if (empty($_PATCH_ID)) {
    $payload['status']  = '400 Bad Request';
    $payload['message'] = 'ID laptop mancante.';
    header('HTTP/1.1 400 Bad Request');
    echo json_encode($payload);
    exit();
}

$fields = [];
$types  = '';
$values = [];

if (isset($_PATCH['id-model']) && is_numeric($_PATCH['id-model'])) {
    $fields[] = 'id_model = ?';
    $types   .= 'i';
    $values[] = (int)$_PATCH['id-model'];
}
if (isset($_PATCH['id-locker']) && is_numeric($_PATCH['id-locker'])) {
    $fields[] = 'id_locker = ?';
    $types   .= 'i';
    $values[] = (int)$_PATCH['id-locker'];
}
if (isset($_PATCH['status']) && in_array($_PATCH['status'], ['available', 'unavailable'])) {
    $fields[] = 'status = ?';
    $types   .= 's';
    $values[] = $_PATCH['status'];
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

$stmt = mysqli_prepare($conn, 'UPDATE laptops SET ' . implode(', ', $fields) . ' WHERE id_laptop = ?');
mysqli_stmt_bind_param($stmt, $types, ...$values);
mysqli_stmt_execute($stmt);

$payload['status'] = '200 OK';
?>
