<?php
include __DIR__ . "/../../checks/check_token.php";

if(!isset($_PATCH['password'])){
    $payload['status'] = "400 Bad Request";
    header("HTTP/1.1 400 Bad Request");
}

$query = "UPDATE users SET password = ? WHERE email = ?";

$stmt = mysqli_prepare($conn, $query);

$hash_pass = hash("sha256", $_PATCH["password"]);

mysqli_stmt_bind_param($stmt, "ss", $hash_pass, $token_decoded["payload"]['email']);

mysqli_stmt_execute($stmt);



?>