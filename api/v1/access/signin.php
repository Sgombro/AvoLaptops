<?php 

if (!isset($_POST['email'], $_POST["password"], $_POST["name"], $_POST["surname"])) {
    $payload["login_status"] = "Not valid credentials";
    echo json_encode($payload);
    exit();
}

$name = $_POST['name'];

$surname = $_POST['surname'];
//credenziali
$email = $_POST['email'];

$pass = hash("sha256", $_POST["password"]);

$domain = explode("@", $email);

try{
    if($domain[1] == "itisavogadro.it"){
        $query = "INSERT INTO users(name, surname, email, password) VALUES(?,?,?,?)";

        $stmt = mysqli_prepare($conn, $query);

        mysqli_stmt_bind_param($stmt, "ssss", $name, $surname, $email, $pass);

        mysqli_stmt_execute($stmt);

        header("HTTP/1.1 200 Created");
        $payload["status"] = "201 Created";
        $payload["signin_status"] = "Successful";  
    }
    else{
        $payload["status"] = "401 Unauthorized";
        header("HTTP/1.1 401 Unauthorized");
        $payload["signin_status"] = "Not valid email domain";   
    }
}
catch (mysqli_sql_exception $e){
    $payload["status"] = "406 Not Acceptable";
    header("HTTP/1.1 406 Not Acceptable");
    $payload["signin_status"] = "User exists";   
}


?>