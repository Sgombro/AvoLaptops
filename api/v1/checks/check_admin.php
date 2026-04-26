<?php 

if (!$token_decoded["payload"]["admin"]) {
    $payload["status"] = "401 Unauthorized";
    header("HTTP/1.1 401 Unauthorized");
    echo json_encode($payload);
    exit();
}

?>