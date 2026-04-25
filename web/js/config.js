// config.js - Configurazione centrale
// Cambia qui l'URL quando l'API sarà pronta

const API_URL = 'http://localhost:3000/api';

// Funzione per ottenere header con token
function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

// Funzione per ottenere parametro dalla URL
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Verifica se utente è loggato
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Verifica se utente è admin
function isAdmin() {
    const utente = JSON.parse(localStorage.getItem('utente') || '{}');
    return utente.role === 'admin';
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = 'login.html';
}