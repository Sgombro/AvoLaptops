<?php
require_once 'connections/connection.php';

echo "<h2>Test Connessione Database</h2>";

// Test 1: Verifica connessione
if($conn) {
    echo "✓ Connessione al database OK<br>";
} else {
    echo "✗ Errore connessione: " . mysqli_connect_error() . "<br>";
    exit();
}

// Test 2: Leggi tutti gli utenti
echo "<h2>Utenti nel database:</h2>";
$query = "SELECT id_user, email, password, verified, role FROM users";
$result = mysqli_query($conn, $query);

if($result) {
    while($row = mysqli_fetch_assoc($result)) {
        echo "ID: {$row['id_user']}, Email: {$row['email']}, Verified: {$row['verified']}, Role: {$row['role']}<br>";
        echo "Password hash: {$row['password']}<br><br>";
    }
} else {
    echo "Errore query: " . mysqli_error($conn);
}

// Test 3: Testa hash password
echo "<h2>Test Password Hash</h2>";
if(isset($_POST['test_email'], $_POST['test_password'])) {
    $email = $_POST['test_email'];
    $password_provided = $_POST['test_password'];
    $password_hashed = hash("sha256", $password_provided);
    
    echo "Email: $email<br>";
    echo "Password fornita: $password_provided<br>";
    echo "Hash SHA256: $password_hashed<br><br>";
    
    // Cerca nel database
    $query = "SELECT * FROM users WHERE email = ? AND password = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "ss", $email, $password_hashed);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
    
    echo "Risultati trovati: " . count($rows) . "<br>";
    
    if(count($rows) > 0) {
        echo "✓ Credenziali CORRETTE<br>";
        echo "Verified: {$rows[0]['verified']}<br>";
    } else {
        echo "✗ Credenziali non trovate<br>";
        
        // Cerca solo per email
        $query2 = "SELECT password FROM users WHERE email = ?";
        $stmt2 = mysqli_prepare($conn, $query2);
        mysqli_stmt_bind_param($stmt2, "s", $email);
        mysqli_stmt_execute($stmt2);
        $result2 = mysqli_stmt_get_result($stmt2);
        $user = mysqli_fetch_assoc($result2);
        
        if($user) {
            echo "Email trovata ma password diversa<br>";
            echo "Password nel DB: {$user['password']}<br>";
        } else {
            echo "Email non trovata nel database<br>";
        }
    }
}
?>

<h2>Form Test Login</h2>
<form method="POST">
    Email: <input type="email" name="test_email" value="user@example.com"><br>
    Password: <input type="password" name="test_password" value="password"><br>
    <button type="submit">Testa</button>
</form>
