<?php
include __DIR__ . "/../../checks/check_token.php";

$query = "SELECT r.id_reservation, r.date, r.time_start, r.time_end, r.status, u.*, laptops.id_laptop, laptops.status, m.*, l.* from reservations r
INNER JOIN laptops ON laptops.id_laptop = r.id_laptop
INNER JOIN models m ON laptops.id_model = m.id_model 
INNER JOIN lockers l ON laptops.id_locker = l.id_locker
INNER JOIN users u ON u.id_user = r.id_user WHERE id_reservation = 1";

$result = mysqli_query($conn, $query);

$row = mysqli_fetch_assoc($result);

$params_type = "";
$params_value = array();

function qualify_column($column){
    $ambiguous_keys = ["id_user", "id_laptop", "id_model", "id_locker", "status"];
    if(in_array($column, $ambiguous_keys)){
        if($column === "id_user") return "u.id_user";
        if($column === "id_laptop") return "laptops.id_laptop";
        if($column === "id_model") return "m.id_model";
        if($column === "id_locker") return "l.id_locker";
        if($column === "status") return "r.status";
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

unset($result);


if($params_count)
    $params = " WHERE " . $params;

$query = "SELECT r.id_reservation, r.date, r.time_start, r.time_end, r.status, u.*, laptops.id_laptop, laptops.status, m.*, l.* from reservations r
INNER JOIN laptops ON laptops.id_laptop = r.id_laptop
INNER JOIN models m ON laptops.id_model = m.id_model 
INNER JOIN lockers l ON laptops.id_locker = l.id_locker
INNER JOIN users u ON u.id_user = r.id_user";

$query .= $params;

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



$payload["reservations"] = [];

    foreach($rows as $row){
        $counter = 0;
        $user = [];
        $laptop = [];
        $laptop["model"] = [];
        $laptop["locker"] = [];
        $reservation = [];
        foreach($row as $attribute => $element){
            if($counter >= 11 and $counter <= 12){
                    $laptop += [$attribute => $element];
                }    
                else if($counter >= 13 and $counter <= 18){
                        $laptop["model"] += [$attribute => $element];
                    }

                else if($counter >= 19 and $counter <= 21){
                    $laptop["locker"] += [$attribute => $element];
                }
                else if($counter >= 5 and $counter <= 10){
                    $user += [$attribute => $element];
                }
                else{
                    $reservation += [$attribute => $element];
                }
                $counter++;
        }

        $reservation["laptop"] = $laptop;
        $reservation["user"] = $user;

    array_push($payload["reservations"], $reservation);
    }
?>