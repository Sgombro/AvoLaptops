<?php
// ===== CORS HEADERS =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Gestisci la preflight request OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ===== FINE CORS =====

$host = 'localhost';
$user = 'root';
$pass = 'CHANGE_ME_DB_PASSWORD';
$dbname = 'avolaptop';

$conn = mysqli_connect($host, $user, $pass, $dbname);

mysqli_set_charset($conn, "utf8");

if(!$conn){
    die("Connessione fallita: " . mysqli_connect_error());
}
?>
