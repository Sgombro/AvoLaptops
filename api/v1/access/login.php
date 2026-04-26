<?php

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

//verifica credenziali
if(!isset($_POST['email'], $_POST["password"])){
    $payload["status"] = "401 Unauthorized";
    header("HTTP/1.1 401 Unauthorized");
    $payload["login_status"] = "Not valid credentials";
    echo json_encode($payload);
    exit();
}
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
    $jwt = [];
    $jwt["header"] = [
        "alg" => "HS256",
        "typ" => "JWT"
    ];
    $jwt["payload"] = [
        "id-user" => -1,
        "name" => "",
        "surname" => "",
        "email" => "",
        "password" => "",
        "admin" => false
    ];
    $jwt["signature"] = "";

    $secret = "ILOVEBARCELONAPLSIWANTTOGETBACK";

    foreach($rows as $row){
        $jwt["payload"]["id-user"] = $row["id_user"];
        $jwt["payload"]["name"] = $row["name"];
        $jwt["payload"]["surname"] = $row["surname"];
        $jwt["payload"]["email"] = $row["email"];
        $jwt["payload"]["password"] = $row["password"];
        if($row["role"] == "admin"){
            $jwt["payload"]["admin"] = true;
        }
    }

    $jwt["signature"] = base64url_encode(hash_hmac("sha256", (
    base64url_encode(json_encode($jwt['header'])) . "." .
    base64url_encode(json_encode($jwt['payload']))), $secret, true));

    $jwt_token = base64url_encode(json_encode($jwt['header'])) . "." .
    base64url_encode(json_encode($jwt['payload'])) . "." . $jwt["signature"];

    $payload["login_status"] = "Successful";
    $payload["token"] = $jwt_token;
}
