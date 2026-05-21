<?php
$host = 'localhost';
$user = 'root';
$pass = 'AdamLakbir2007';
$dbname = 'avolaptop';

$conn = mysqli_connect($host, $user, $pass, $dbname);

mysqli_set_charset($conn, "utf8");

if(!$conn){
    die("Connessione fallita: " . mysqli_connect_error());
}
?>
