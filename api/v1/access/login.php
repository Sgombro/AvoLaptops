<?php
// ===== DEBUG - Mostra TUTTI gli errori =====
error_reporting(E_ALL);
ini_set('display_errors', 1);
// ===== FINE DEBUG =====

require_once '../connections/connection.php';

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// ===== MODIFICA: Accetta sia JSON che POST normale =====
// Controlla se la richiesta è in JSON
$input = file_get_contents('php://input');
$json_data = json_decode($input, true);

if ($json_data && isset($json_data['email'], $json_data['password'])) {
    // Richiesta in formato JSON (dal tuo HTML)
    $email = $json_data['email'];
    $password = $json_data['password'];
} else {
    // Richiesta in formato POST normale (da Postman form-data)
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;
}
// ===== FINE MODIFICA =====

//verifica credenziali
if(!isset($email, $password)){
    $payload["status"] = "401 Unauthorized";
    header("HTTP/1.1 401 Unauthorized");
    $payload["message"] = "Credenziali non valide";
    echo json_encode($payload);
    exit();
}

$pass = hash("sha256", $password);

$query = "SELECT * from users WHERE email = ? AND password = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "ss", $email, $pass);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

foreach($rows as $row){
    if(!$row['verified']){
        $payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        $payload["message"] = "Verifica il tuo indirizzo mail prima, riprova tra 5 minuti";
        echo json_encode($payload);
        exit();
    }
}

if (count($rows) == 0) {
    $payload["status"] = "401 Unauthorized";
    header("HTTP/1.1 401 Unauthorized");
    $payload["message"] = "Credenziali non valide";
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
        "verified" => 0,
        "admin" => false,
        "start" => time()
    ];
    $jwt["signature"] = "";

    $secret = "CHANGE_ME_JWT_SECRET";

    foreach($rows as $row){
        $jwt["payload"]["id-user"] = $row["id_user"];
        $jwt["payload"]["name"] = $row["name"];
        $jwt["payload"]["surname"] = $row["surname"];
        $jwt["payload"]["email"] = $row["email"];
        $jwt["payload"]["password"] = $row["password"];
        $jwt["payload"]["verified"] = $row["verified"];
        if($row["role"] == "admin"){
            $jwt["payload"]["admin"] = true;
        }
    }

    $jwt["signature"] = base64url_encode(hash_hmac("sha256", (
    base64url_encode(json_encode($jwt['header'])) . "." .
    base64url_encode(json_encode($jwt['payload']))), $secret, true));

    $jwt_token = base64url_encode(json_encode($jwt['header'])) . "." .
    base64url_encode(json_encode($jwt['payload'])) . "." . $jwt["signature"];

    $payload["message"] = "Successful";
    $payload["token"] = $jwt_token;
}

echo json_encode($payload);