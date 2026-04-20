<?php
    session_start();
    if (!isset($_SESSION['last_activity'])) {
        $_SESSION['last_activity'] = time(); // Salva il timestamp dell'attività
    }
    $inactivity_timeout = 30 * 60; // 30 minuti in secondi (30 * 60)
    $current_time = time();
    if ($current_time - $_SESSION['last_activity'] > $inactivity_timeout) {
        // Sessione inattiva: distrugge la sessione e reindirizza
        session_unset(); // Rimuove tutte le variabili di sessione
        session_destroy(); // Distrugge la sessione
        exit();
    } else {
        // Sessione attiva: aggiorna l'orario dell'ultima attività
        $_SESSION['last_activity'] = $current_time;
    }
?>