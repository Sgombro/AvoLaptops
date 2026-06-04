<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";

if (!isset($_POST['id-model']) || !is_numeric($_POST['id-model'])
    || !isset($_POST['id-locker']) || !is_numeric($_POST['id-locker'])) {
    $payload['status']  = '400 Bad Request';
    $payload['message'] = 'id-model e id-locker sono obbligatori.';
    header('HTTP/1.1 400 Bad Request');
    echo json_encode($payload);
    exit();
}

$idModel  = (int)$_POST['id-model'];
$idLocker = (int)$_POST['id-locker'];
$status   = 'available';

$stmt = mysqli_prepare($conn, 'INSERT INTO laptops (id_model, id_locker, status) VALUES (?, ?, ?)');
mysqli_stmt_bind_param($stmt, 'iis', $idModel, $idLocker, $status);
mysqli_stmt_execute($stmt);

$payload['status']    = '201 Created';
$payload['id_laptop'] = mysqli_insert_id($conn);
header('HTTP/1.1 201 Created');
?>
