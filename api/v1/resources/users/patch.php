<?php
include __DIR__ . "/../../checks/check_token.php";

if(!isset($_PATCH['password'])){
    $payload['status'] = "400 Bad Request";
    header("HTTP/1.1 400 Bad Request");
    $payload["message"] = "Immetti la nuova password";
    echo json_encode($payload);
    exit();
}

if(strlen($_PATCH["password"]) < 8){
	$payload["status"] = "400 Bad Request";
        header("HTTP/1.1 400 Bad Request");
        $payload["message"] = "La password deve essere lunga 8 cifre";
	echo json_encode($payload);
	exit();
} 

$query = "UPDATE users SET password = ? WHERE email = ?";

$stmt = mysqli_prepare($conn, $query);

$hash_pass = hash("sha256", $_PATCH["password"]);

mysqli_stmt_bind_param($stmt, "ss", $hash_pass, $token_decoded["payload"]['email']);

mysqli_stmt_execute($stmt);



?>