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

//$uri_elements;
//echo $uri_elements;
//print_r($uri_elements);
//echo $requestUri;
//print_r($called_resource);

switch ($_SERVER["REQUEST_METHOD"]) {
    case 'GET':

        if (count($_GET) != 0) {

            switch ($uri_elements[$called_resource]) {
                case 'film':
                    break;
                default:
                    break;
            }
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
            
            default:
                # code...
                break;
        }
        break;

    case 'PUT':
        # code...
        break;

    case 'DELETE':
        # code...
        break;
    default:
        # code...
        break;
}

echo json_encode($payload);