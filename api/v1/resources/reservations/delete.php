<?php 

include __DIR__ . "/../../checks/check_token.php";


$id = $_DELETE["id"];
$idLaptop = null;
if (isset($_GET["id-laptop"]) && $_GET["id-laptop"] !== "") {
    $idLaptop = (int)$_GET["id-laptop"];
}

$query = $idLaptop !== null
    ? "SELECT id_user from reservations WHERE id_reservation = ? AND id_laptop = ?"
    : "SELECT id_user from reservations WHERE id_reservation = ?";


$stmt = mysqli_prepare($conn, $query);

if ($idLaptop !== null) {
    mysqli_stmt_bind_param($stmt, "ii", $id, $idLaptop);
} else {
    mysqli_stmt_bind_param($stmt, "i", $id);
}

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

if (count($rows) === 0) {
    $payload["status"] = "404 Not Found";
    header("HTTP/1.1 404 Not Found");
    echo json_encode($payload);
    exit();
}

foreach($rows as $row){
    if ($token_decoded["payload"]["admin"] or $row['id_user'] == $token_decoded["payload"]["id-user"]) {
        break;
    }
    else{
        $payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode($payload);
        exit();
    }
}

$query = $idLaptop !== null
    ? "DELETE from reservations WHERE id_reservation = ? AND id_laptop = ?"
    : "DELETE from reservations WHERE id_reservation = ?";


$stmt = mysqli_prepare($conn, $query);

if ($idLaptop !== null) {
    mysqli_stmt_bind_param($stmt, "ii", $id, $idLaptop);
} else {
    mysqli_stmt_bind_param($stmt, "i", $id);
}

mysqli_stmt_execute($stmt);

?>