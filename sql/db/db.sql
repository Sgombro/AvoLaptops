CREATE DATABASE IF NOT EXISTS avolaptop;
USE avolaptop;

-- MODELS
CREATE TABLE models (
    id_model INT PRIMARY KEY AUTO_INCREMENT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    cpu VARCHAR(100),
    ram INT,
    storage INT,
    os VARCHAR(50)
);

-- LOCKERS
CREATE TABLE lockers (
    id_locker INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200)
);

-- LAPTOPS
CREATE TABLE laptops (
    id_laptop INT PRIMARY KEY AUTO_INCREMENT,
    id_model INT NOT NULL,
    id_locker INT NOT NULL,
    status ENUM('available', 'unavailable') DEFAULT 'available',
    FOREIGN KEY (id_model) REFERENCES models(id_model)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_locker) REFERENCES lockers(id_locker)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- USERS
CREATE TABLE users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher') NOT NULL
);

-- RESERVATIONS
CREATE TABLE reservations (
    id_reservation INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    id_laptop INT NOT NULL,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_laptop) REFERENCES laptops(id_laptop)
        ON DELETE CASCADE ON UPDATE CASCADE
);