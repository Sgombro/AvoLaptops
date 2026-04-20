<?php
if(!isset($_SESSION["logged"])){
    $payload["status"] = "401 Unauthorized";
    $payload["login_status"] = "You must login";
    header("HTTP/1.1 401 Unauthorized");
    echo json_encode($payload);
    exit();
}
else if(!$_SESSION["logged"]){
    $payload["status"] = "401 Unauthorized";
    $payload["login_status"] = "You must login";
    header("HTTP/1.1 401 Unauthorized");
    echo json_encode($payload);
    exit();
}
?>