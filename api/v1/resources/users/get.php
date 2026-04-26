<?php

include __DIR__ . "/../../checks/check_token.php";
include __DIR__ . "/../../checks/check_admin.php";

$query = "SELECT * from users WHERE id_user = 1";

$result = mysqli_query($conn, $query);

$row = mysqli_fetch_assoc($result);

$params_type = "";
$params_value = array();

foreach($row as $attribute => $value){
    $temp = $attribute;
    $attribute = str_replace("_", "-", $attribute);
    if(isset($_GET[$attribute])){
        if(gettype($_GET[$attribute]) == "string"){
            $params_type .= "s";
        }
        else{
            $params_type .= "i";
        }
        $params_value[] = $_GET[$attribute];
        if($params_count == false){
            $params_count = true;
            $params .=  $temp . " = " . "?"  . " ";
        }
        else
            $params .= "AND " . $temp . " = " . "?"  . " ";
    }
}


if($params_count)
    $params = " WHERE " . $params;

$query = "SELECT * from users";

$query .= $params;

//echo $query;
if($params_type == ""){
    $result = mysqli_query($conn, $query);
}
else{
    $refs = [];
    foreach ($params_value as $key => $value) {
        $refs[$key] = &$params_value[$key];
    }

    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, $params_type, ...$refs);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
}


$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

if(count($rows) == 0){
    $payload["status"] = "404 Not Found"; 
    header("HTTP/1.1 404 Not Found");
    echo json_encode($payload);
    exit();
}

$payload["users"] = $rows;

?>