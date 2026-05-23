<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";

$id = $_DELETE["id"];

$query = "DELETE from models WHERE id_model = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "i", $id);

mysqli_stmt_execute($stmt);

?>