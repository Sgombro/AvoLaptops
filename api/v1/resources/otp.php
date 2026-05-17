<?php

include __DIR__ . "/../checks/check_token.php";

$email = $token_decoded['payload']['email'];

$otp_code = $_POST['otp'];

$query = "SELECT otp, otp_time from users WHERE email = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "s", $email);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

foreach($rows as $row){
    if($row['otp_time'] == "null" or $row['otp'] != $otp_code){
        $payload["status"] = "406 Not Acceptable";
        header("HTTP/1.1 406 Not Acceptable");
        $payload["message"] = "OTP not valid";   
        exit();
    }
    else if($row['otp'] == $otp_code){
        $payload["status"] = "200 OK";
        
        $payload["message"] = "OTP verified successfully";   

        $query = "UPDATE users SET verified = 1 WHERE email = ?";

        $stmt = mysqli_prepare($conn, $query);

        mysqli_stmt_bind_param($stmt, "s", $email);

        mysqli_stmt_execute($stmt);
    }
}

?>