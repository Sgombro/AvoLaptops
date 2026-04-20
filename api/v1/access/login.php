<?php

//credenziali
$email = $_POST['email'];

$pass = hash("sha256", $_POST["password"]);

//$pass = $_POST["password"];

$query = "SELECT * from users WHERE email = ? AND password = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "ss", $email, $pass);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

if (count($rows) == 0) {
    $payload["status"] = "401 Unauthorized";
    header("HTTP/1.1 401 Unauthorized");
    $payload["login_status"] = "Not valid credentials";
} else {
    $payload["login_status"] = "Successful";
    $_SESSION["logged"] = true; //sessione
    include __DIR__ . "/../checks/check_session";
}
