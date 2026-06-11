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

$params = "";

$_SESSION["logged"] = false; //sessione

$params_count = false;
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
            case 'laptops':
                include __DIR__ . "/resources/laptops/get.php";
                break;
            case 'reservations':
                include __DIR__ . "/resources/reservations/get.php";
                break;
            case 'users':
                include __DIR__ . "/resources/users/get.php";
                break;
            case 'lockers':
                include __DIR__ . "/resources/lockers/get.php";
                break;
            case 'models':
                include __DIR__ . "/resources/models/get.php";
                break;
            default:
                if($called_resource == 'login'){
                    $payload["status"] = "405 Method Not Allowed";
                    header("HTTP/1.1 405 Method Not Allowed");
                }
                else{
                    $payload["status"] = "404 Not Found";
                    header("HTTP/1.1 404 Not Found");
                }
                break;
        }


        break;

    case 'POST':
        switch ($called_resource) {
            case 'login':
                include __DIR__ . "/access/login.php";
                break;
            case 'users':
                include __DIR__ . "/resources/users/post.php";
                break;
            case 'laptops':
                include __DIR__ . "/resources/laptops/post.php";
                break;
            case 'reservations':
                include __DIR__ . "/resources/reservations/post.php";
                break;
            case 'lockers':
                include __DIR__ . "/resources/lockers/post.php";
                break;
            case 'models':
                include __DIR__ . "/resources/models/post.php";
                break;
            case 'otp':
                include __DIR__ . "/resources/otp.php";
                break;

            default:
                if($called_resource == 'homepage'){
                    $payload["status"] = "405 Method Not Allowed";
                    header("HTTP/1.1 405 Method Not Allowed");
                }
                else{
                    $payload["status"] = "404 Not Found";
                    header("HTTP/1.1 404 Not Found");
                }
                break;
        }
        break;
    
    case 'PATCH':
        parse_str(file_get_contents('php://input'), $_PATCH);
        switch ($called_resource) {
            case 'users':
                include __DIR__ . "/resources/users/patch.php";
                break;
            default:
                if($called_resource == 'homepage'
                or $called_resource == 'login'
                or $called_resource == 'models'
                or $called_resource == 'laptops'
                or $called_resource == 'lockers'
                or $called_resource == 'reservations'){
                    $payload["status"] = "405 Method Not Allowed";
                    header("HTTP/1.1 405 Method Not Allowed");
                }
                else{
                    $payload["status"] = "404 Not Found";
                    header("HTTP/1.1 404 Not Found");
                }
                break;
        }
        break;

    case 'DELETE':
        $_DELETE['id'] = $uri_elements[1];
        switch ($uri_elements[0]) {
            case 'laptops':
                include __DIR__ . "/resources/laptops/delete.php";
                break;
            case 'reservations':
                include __DIR__ . "/resources/reservations/delete.php";
                break;
            case 'users':
                include __DIR__ . "/resources/users/delete.php";
                break;
            case 'lockers':
                include __DIR__ . "/resources/lockers/delete.php";
                break;
            case 'models':
                include __DIR__ . "/resources/models/delete.php";
                break;
            default:
                if($called_resource == 'homepage'
                or $called_resource == 'login'){
                    $payload["status"] = "405 Method Not Allowed";
                    header("HTTP/1.1 405 Method Not Allowed");
                }
                else{
                    $payload["status"] = "404 Not Found";
                    header("HTTP/1.1 404 Not Found");
                }
                break;
        }
        break;

    default:
        $payload["status"] = "405 Method Not Allowed";
        header("HTTP/1.1 405 Method Not Allowed");
        break;
}

echo json_encode($payload);
