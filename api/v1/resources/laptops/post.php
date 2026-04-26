<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";


$query = "INSERT INTO laptops VALUES(default, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "iis", $_POST["id-model"], $_POST["id-locker"], $_POST["id-locker"]);

mysqli_stmt_execute($stmt);

$payload["status"] = "201 Created";

header("HTTP/1.1 201 Created");

?>