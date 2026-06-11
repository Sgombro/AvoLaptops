<?php
include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";


try {
    $query = "INSERT INTO laptops VALUES(default, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $query);

    mysqli_stmt_bind_param($stmt, "iis", $_POST["id-model"], $_POST["id-locker"], $_POST["status"]);

    mysqli_stmt_execute($stmt);

    $payload["status"] = "201 Created";

    header("HTTP/1.1 201 Created");

} catch (mysqli_sql_exception $th) {
    $payload["status"] = "400 Bad Request";
    $payload["message"]  = "Stai inserendo dati errati.";
    header("HTTP/1.1 400 Bad Request");
    echo json_encode($payload);
    exit();
}


?>