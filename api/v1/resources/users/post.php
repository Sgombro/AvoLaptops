<?php
include __DIR__ . "/../../checks/check_token.php";

$query = "INSERT INTO users VALUES(default, ?, ?, ?, ?, teacher)";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "ssss", $_POST["name"], $_POST["surname"], $_POST["email"], $_POST["password"]);

mysqli_stmt_execute($stmt);

$payload["status"] = "201 Created";

header("HTTP/1.1 201 Created");

?>