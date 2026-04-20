<?php

include __DIR__ . "/../checks/check_login.php";

session_unset(); // Rimuove tutte le variabili di sessione
session_destroy(); // Distrugge la sessione
echo json_encode($payload);
exit();

?>