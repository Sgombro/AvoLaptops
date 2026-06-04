<?php


include __DIR__ . "/../../checks/check_token.php";
//query parameter binding
$query = "SELECT laptops.id_laptop, laptops.status, models.*, lockers.* from laptops 
INNER JOIN models ON laptops.id_model = models.id_model 
INNER JOIN lockers ON laptops.id_locker = lockers.id_locker WHERE id_laptop = 1";

$result = mysqli_query($conn, $query);

$row = mysqli_fetch_assoc($result);

$params_type = "";
$params_value = array();

function qualify_column($column){
    $ambiguous_keys = ["id_model", "id_locker"];
    if(in_array($column, $ambiguous_keys)){
        return "laptops." . $column;
    }
    return $column;
}

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
            $params .=  qualify_column($temp) . " = ? ";
        }
        else
            $params .= "AND " . qualify_column($temp) . " = ? ";
    }
}

$availabilityDate = isset($_GET["date"]) ? $_GET["date"] : null;
$availabilityStart = isset($_GET["time-start"]) ? $_GET["time-start"] : null;
$availabilityEnd = isset($_GET["time-end"]) ? $_GET["time-end"] : null;

if ($availabilityDate !== null || $availabilityStart !== null || $availabilityEnd !== null) {
    if ($availabilityDate === null || $availabilityStart === null || $availabilityEnd === null) {
        $payload["status"] = "400 Bad Request";
        $payload["message"] = "Parametri di disponibilita' incompleti.";
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($payload);
        exit();
    }

    $dateOk = preg_match('/^\d{4}-\d{2}-\d{2}$/', $availabilityDate);
    $timeOk = preg_match('/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/', $availabilityStart)
        && preg_match('/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/', $availabilityEnd);
    if (!$dateOk || !$timeOk || $availabilityEnd <= $availabilityStart) {
        $payload["status"] = "400 Bad Request";
        $payload["message"] = "Data o orari non validi.";
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($payload);
        exit();
    }

    $availabilityClause = "NOT EXISTS (SELECT 1 FROM reservations r "
        . "WHERE r.id_laptop = laptops.id_laptop "
        . "AND r.date = ? "
        . "AND r.status = 'active' "
        . "AND r.time_start < ? "
        . "AND r.time_end > ?)";

    if ($params_count == false) {
        $params_count = true;
        $params = $availabilityClause . " ";
    } else {
        $params .= "AND " . $availabilityClause . " ";
    }

    $params_type .= "sss";
    $params_value[] = $availabilityDate;
    $params_value[] = $availabilityEnd;
    $params_value[] = $availabilityStart;
}

if($params_count)
    $params = " WHERE " . $params;
else if($numelements == 3 and $uri_elements[0] == "lockers"){
    $params_count = true;
    $params = " WHERE lockers.id_locker = " . $uri_elements[1];
}

$query = "SELECT laptops.id_laptop, laptops.status, models.*, lockers.* from laptops 
INNER JOIN models ON laptops.id_model = models.id_model 
INNER JOIN lockers ON laptops.id_locker = lockers.id_locker";

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

$payload["laptops"] = [];

foreach($rows as $row){
    $counter = 0;
    $laptop = [];
    $laptop["model"] = [];
    $laptop["locker"] = [];
    foreach($row as $attribute => $element){
    if($counter >= 0 and $counter <= 1){
            $laptop += [$attribute => $element];
        }    
        else if($counter >= 2 and $counter <= 8){
                $laptop["model"] += [$attribute => $element];
            }

        else{
            $laptop["locker"] += [$attribute => $element];
        }
        $counter++;
    }
    array_push($payload["laptops"], $laptop);
}

?>