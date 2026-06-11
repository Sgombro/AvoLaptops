<?php 

include __DIR__ . "/../../checks/check_token.php";

$id = $_DELETE["id"];

$query = "SELECT id_user, status from reservations WHERE id_reservation = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "i", $id);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

foreach($rows as $row){
    if ($token_decoded["payload"]["admin"] or $row['id_user'] == $token_decoded["payload"]["id-user"]) {
        if($row['status'] == "completed"){
            $payload["status"] = "401 Unauthorized";
            header("HTTP/1.1 401 Unauthorized");
            $payload["message"]  = "Non puoi eliminare prenotazioni completate";
            echo json_encode($payload);
            exit();
        }
    }
    else{
        $payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode($payload);
        exit();
    }
}

$query = "DELETE from reservations WHERE id_reservation = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "i", $id);

mysqli_stmt_execute($stmt);

?>