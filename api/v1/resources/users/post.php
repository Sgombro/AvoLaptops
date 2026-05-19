<?php


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../PHPMailer/src/Exception.php';
require __DIR__ . '/../../PHPMailer/src/PHPMailer.php';
require __DIR__ . '/../../PHPMailer/src/SMTP.php';


function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

if (!isset($_POST['email'], $_POST["password"], $_POST["name"], $_POST["surname"])) {
    $payload["status"] = "401 Unauthorized";
    header("HTTP/1.1 401 Unauthorized");
    $payload["message"] = "Credenziali non valide";
    echo json_encode($payload);
    exit();
}

$name = $_POST['name'];

$surname = $_POST['surname'];
//credenziali
$email = $_POST['email'];

if(strlen($_POST["password"]) < 8){
	$payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        $payload["message"] = "La password deve essere lunga 8 cifre";
	echo json_encode($payload);
	exit();
} 

$pass = hash("sha256", $_POST["password"]);

$domain = explode("@", $email);

try{
    if($domain[1] == "gmail.com"){
        $otp_code = random_int(100000, 999999);    

        $query = "INSERT INTO users VALUES(default, ?, ?, ?, ?, 'teacher', 0, ?, current_time())";

        $stmt = mysqli_prepare($conn, $query);

        mysqli_stmt_bind_param($stmt, "ssssi", $name, $surname, $email, $pass, $otp_code);

        mysqli_stmt_execute($stmt);

        header("HTTP/1.1 200 Created");

        $payload["status"] = "201 Created";

        $payload["message"] = "Verifica l'account con il codice OTP inviato via mail";
        
        //invio mail
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->SMTPDebug = SMTP::DEBUG_OFF;
            $mail->Host = 'smtp.gmail.com';
            $mail->Username = 'example@gmail.com';
            $mail->SMTPAuth = true;  
            $mail->Password = 'example1234';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; //Enable implicit TLS encryption
            $mail->Port = 587;
            $mail->setFrom('example@gmail.com', 'CODICE OTP');
            $mail->addAddress($_POST['email']); 
            $mail->isHTML(true);
            $mail->Subject = 'Verifica la mail';
            $mail->Body = 'Il codice OTP per la verifica della mail è: ' . $otp_code;
            $mail->send();

        //invio token non verificato
        $query = "SELECT * from users WHERE email = ? AND password = ?";

        $stmt = mysqli_prepare($conn, $query);

        mysqli_stmt_bind_param($stmt, "ss", $email, $pass);

        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);

        $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

        if (count($rows) == 0) {
            $payload["status"] = "401 Unauthorized";
            header("HTTP/1.1 401 Unauthorized");
            $payload["message"] = "Credenziali non valide";
        } else {
            $jwt = [];
            $jwt["header"] = [
                "alg" => "HS256",
                "typ" => "JWT"
            ];
            $jwt["payload"] = [
                "id-user" => -1,
                "name" => "",
                "surname" => "",
                "email" => "",
                "password" => "",
                "verified" => 0,
                "admin" => false,
                "start" => time()
            ];
            $jwt["signature"] = "";

            $secret = "ILOVEBARCELONAPLSIWANTTOGETBACK";

            foreach($rows as $row){
                $jwt["payload"]["id-user"] = $row["id_user"];
                $jwt["payload"]["name"] = $row["name"];
                $jwt["payload"]["surname"] = $row["surname"];
                $jwt["payload"]["email"] = $row["email"];
                $jwt["payload"]["password"] = $row["password"];
                $jwt["payload"]["verified"] = $row["verified"];
                if($row["role"] == "admin"){
                    $jwt["payload"]["admin"] = true;
                }
            }

            $jwt["signature"] = base64url_encode(hash_hmac("sha256", (
            base64url_encode(json_encode($jwt['header'])) . "." .
            base64url_encode(json_encode($jwt['payload']))), $secret, true));

            $jwt_token = base64url_encode(json_encode($jwt['header'])) . "." .
            base64url_encode(json_encode($jwt['payload'])) . "." . $jwt["signature"];

            $payload["message"] = "Successful";
            $payload["token"] = $jwt_token;

        }


        } catch (Exception $e) {
            $payload += ["message" => "Email non inviata correttamente"];
        }  
    }
    else{
        $payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        $payload["message"] = "Solo account @itisavogadro si possono registrare";   
    }
}
catch (mysqli_sql_exception $e){
    $payload["status"] = "406 Not Acceptable";
    header("HTTP/1.1 406 Not Acceptable");
    $payload["message"] = "Utente esistente, se non ti sei registrato te riprova tra 5 minuti";   
}

?>
