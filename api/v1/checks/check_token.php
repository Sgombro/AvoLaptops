<?php

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function decode_jwt($token, $secret, $called_resource) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return ["valid" => false];
    }

    [$header_enc, $payload_enc, $signature] = $parts;

    // Decodifica header e payload
    $header  = json_decode(base64url_decode($header_enc), true);
    $payload = json_decode(base64url_decode($payload_enc), true);

    // Ricalcola la firma e verifica
    $expected_signature = base64url_encode(
        hash_hmac("sha256", $header_enc . "." . $payload_enc, $secret, true)
    );

    $valid = hash_equals($expected_signature, $signature);

    if($payload['start'] + 86400 <= time() and $called_resource != "otp"){
        $valid = false;
    }
    else if($called_resource == "otp" and $payload['start'] + 300 <= time()){
        $valid = false;
    }

    if(!$payload['verified'] and $called_resource != "otp"){
        $payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        $payload["message"] = "Verifica prima la tua mail.";
        $valid = false;
    }

    return [
        "header"    => $header,
        "payload"   => $payload,
        "valid"     => $valid
    ];
}

if(!isset(getallheaders()["token"])){
    $payload["status"] = "498 Invalid Token";
    header("HTTP/1.1 498 Invalid Token");
    echo json_encode($payload);
    exit();
}

$_SERVER["token"] = getallheaders()["token"];

$secret = "CHANGE_ME_JWT_SECRET";
$token_decoded = decode_jwt($_SERVER["token"], $secret, $called_resource);

if (!$token_decoded["valid"]) {
    $payload["status"] = "498 Invalid Token";
    header("HTTP/1.1 498 Invalid Token");
    echo json_encode($payload);
    exit();
}

?>