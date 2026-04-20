<?php

//connessione database
include __DIR__ . "/connections/connection.php";

//payload JSON
header("Content-type: application/json");

//payload
$payload = ["status" => "200 OK"]; 

//URI inviata
$requestUri = $_SERVER['REQUEST_URI'];

$uri_elements = array_slice(explode("/", $requestUri), 4); 

//risorsa chiamata
$called_resource = explode("?", $uri_elements[count($uri_elements) - 1])[0];

//elementi URI presi come Array
$uri_elements[count($uri_elements) - 1] = $called_resource;

//numero elementi
$numelements = count($uri_elements);

//query da inviare
$query = "";

$_SESSION["logged"] = false; //sessione

//$uri_elements;
//echo $uri_elements;
//print_r($uri_elements);
//echo $requestUri;
//print_r($called_resource);

switch ($_SERVER["REQUEST_METHOD"]) {
    case 'GET':
            switch ($called_resource) {
                case 'homepage':
                    include __DIR__ . "/home/homepage.php";
                    break;
                
                default:
                $payload["status"] = "405 Method Not Allowed";
                header("HTTP/1.1 405 Method Not Allowed");
                break;
        }


        break;

    case 'POST':
        switch ($called_resource) {
            case 'login':
                include __DIR__ . "/access/login.php";
                break;
            case 'users':
                include __DIR__ . "/access/signin.php";
                break;
            case 'logout':
                include __DIR__ . "/access/logout.php";
                break;
            
            default:
                $payload["status"] = "405 Method Not Allowed";
                header("HTTP/1.1 405 Method Not Allowed");
                break;
        }
        break;

    case 'PUT':
        switch ($called_resource) {
            
            default:
                $payload["status"] = "405 Method Not Allowed";
                header("HTTP/1.1 405 Method Not Allowed");
                break;
        }
        # code...

    case 'DELETE':        
        switch ($called_resource) {
            default:
                $payload["status"] = "405 Method Not Allowed";
                header("HTTP/1.1 405 Method Not Allowed");
                break;
        }
        break;
    
        default: 
        $payload["status"] = "405 Method Not Allowed";
        header("HTTP/1.1 405 Method Not Allowed");
        break;
}

echo json_encode($payload);