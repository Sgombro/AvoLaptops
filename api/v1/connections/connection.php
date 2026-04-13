<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'avolaptop';

$conn = mysqli_connect($host, $user, $pass, $dbname);

mysqli_set_charset($conn, "utf8");

if(!$conn){
    die("Connessione fallita: " . mysqli_connect_error());
}
?>