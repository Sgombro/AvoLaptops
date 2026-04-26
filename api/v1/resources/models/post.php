<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";


$query = "INSERT INTO models VALUES(default, ?, ?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "sssiis", $_POST["brand"], $_POST["model"], $_POST["cpu"], $_POST["ram"], $_POST["storage"], $_POST["os"]);

mysqli_stmt_execute($stmt);

$payload["status"] = "201 Created";

header("HTTP/1.1 201 Created");

?>