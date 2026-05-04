-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Mag 04, 2026 alle 08:08
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `avolaptop`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `laptops`
--

CREATE TABLE `laptops` (
  `id_laptop` int(11) NOT NULL,
  `id_model` int(11) NOT NULL,
  `id_locker` int(11) NOT NULL,
  `status` enum('available','unavailable') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `laptops`
--

INSERT INTO `laptops` (`id_laptop`, `id_model`, `id_locker`, `status`) VALUES
(1, 1, 1, 'available'),
(2, 2, 1, 'available'),
(3, 4, 1, 'available'),
(6, 2, 2, 'available'),
(7, 5, 2, 'available'),
(8, 8, 2, 'available'),
(9, 11, 2, 'available'),
(10, 16, 2, 'available'),
(11, 3, 3, 'available'),
(12, 6, 3, 'available'),
(13, 9, 3, 'available'),
(14, 12, 3, 'available'),
(15, 17, 3, 'available'),
(16, 4, 4, 'available'),
(17, 7, 4, 'available'),
(18, 13, 4, 'available'),
(19, 18, 4, 'available'),
(20, 19, 4, 'available'),
(21, 1, 5, 'available'),
(22, 5, 5, 'available'),
(23, 10, 5, 'available'),
(24, 14, 5, 'available'),
(25, 20, 5, 'available'),
(27, 6, 6, 'available'),
(28, 11, 6, 'available'),
(29, 15, 6, 'available'),
(30, 17, 6, 'available'),
(31, 3, 7, 'available'),
(32, 8, 7, 'available'),
(33, 12, 7, 'available'),
(34, 16, 7, 'available'),
(35, 19, 7, 'available'),
(36, 4, 8, 'available'),
(37, 9, 8, 'available'),
(38, 13, 8, 'available'),
(39, 18, 8, 'available'),
(40, 20, 8, 'available');

-- --------------------------------------------------------

--
-- Struttura della tabella `lockers`
--

CREATE TABLE `lockers` (
  `id_locker` int(11) NOT NULL,
  `name_locker` varchar(100) NOT NULL,
  `location` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `lockers`
--

INSERT INTO `lockers` (`id_locker`, `name_locker`, `location`) VALUES
(1, 'Armadietto A1', 'Piano Terra - Corridoio Principale'),
(2, 'Armadietto A2', 'Piano Terra - Corridoio Principale'),
(3, 'Armadietto B1', 'Primo Piano - Ala Nord'),
(4, 'Armadietto B2', 'Primo Piano - Ala Nord'),
(5, 'Armadietto C1', 'Primo Piano - Ala Sud'),
(6, 'Armadietto C2', 'Secondo Piano - Sala Professori'),
(7, 'Armadietto D1', 'Secondo Piano - Laboratorio Informatica'),
(8, 'Armadietto D2', 'Secondo Piano - Laboratorio Informatica');

-- --------------------------------------------------------

--
-- Struttura della tabella `models`
--

CREATE TABLE `models` (
  `id_model` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `cpu` varchar(100) DEFAULT NULL,
  `ram` int(11) DEFAULT NULL,
  `storage` int(11) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `models`
--

INSERT INTO `models` (`id_model`, `brand`, `model`, `cpu`, `ram`, `storage`, `os`) VALUES
(1, 'Apple', 'MacBook Pro 14', 'Apple M3 Pro', 18, 512, 'macOS Sonoma'),
(2, 'Apple', 'MacBook Air 13', 'Apple M2', 8, 256, 'macOS Sonoma'),
(3, 'Apple', 'MacBook Pro 16', 'Apple M3 Max', 36, 1024, 'macOS Sonoma'),
(4, 'Dell', 'XPS 15 9530', 'Intel Core i7-13700H', 16, 512, 'Windows 11 Pro'),
(5, 'Dell', 'Latitude 5540', 'Intel Core i5-1345U', 8, 256, 'Windows 11 Pro'),
(6, 'Dell', 'Precision 5680', 'Intel Core i9-13900H', 32, 1024, 'Windows 11 Pro'),
(7, 'Lenovo', 'ThinkPad X1 Carbon', 'Intel Core i7-1365U', 16, 512, 'Windows 11 Pro'),
(8, 'Lenovo', 'IdeaPad 5 Pro', 'AMD Ryzen 7 6800H', 16, 512, 'Windows 11 Home'),
(9, 'Lenovo', 'ThinkPad T14s Gen 4', 'AMD Ryzen 5 7540U', 16, 256, 'Windows 11 Pro'),
(10, 'HP', 'EliteBook 840 G10', 'Intel Core i7-1355U', 16, 512, 'Windows 11 Pro'),
(11, 'HP', 'ProBook 450 G10', 'Intel Core i5-1335U', 8, 256, 'Windows 11 Home'),
(12, 'HP', 'ZBook Studio G10', 'Intel Core i9-13900H', 32, 1024, 'Windows 11 Pro'),
(13, 'Asus', 'ZenBook 14 OLED', 'Intel Core i7-1360P', 16, 512, 'Windows 11 Home'),
(14, 'Asus', 'ProArt Studiobook 16', 'AMD Ryzen 9 7945HX', 32, 1024, 'Windows 11 Pro'),
(15, 'Asus', 'VivoBook 15', 'Intel Core i5-1235U', 8, 512, 'Windows 11 Home'),
(16, 'Microsoft', 'Surface Laptop 5', 'Intel Core i5-1245U', 8, 256, 'Windows 11 Home'),
(17, 'Microsoft', 'Surface Pro 9', 'Intel Core i7-1255U', 16, 256, 'Windows 11 Pro'),
(18, 'Acer', 'Swift X 14', 'AMD Ryzen 7 7745HX', 16, 512, 'Windows 11 Home'),
(19, 'Acer', 'Aspire 5', 'Intel Core i5-1235U', 8, 256, 'Windows 11 Home'),
(20, 'Acer', 'ConceptD 5', 'Intel Core i7-13700H', 32, 1024, 'Windows 11 Pro');

-- --------------------------------------------------------

--
-- Struttura della tabella `reservations`
--

CREATE TABLE `reservations` (
  `id_reservation` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_laptop` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `status` enum('active','completed') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `reservations`
--

INSERT INTO `reservations` (`id_reservation`, `id_user`, `id_laptop`, `date`, `time_start`, `time_end`, `status`) VALUES
(1, 19, 2, '2026-04-25', '08:00:00', '10:00:00', 'completed'),
(1, 21, 8, '2026-04-25', '08:00:00', '10:00:00', 'completed'),
(120, 19, 1, '2026-04-28', '08:00:00', '10:00:00', 'completed'),
(121, 20, 7, '2026-04-28', '10:00:00', '12:00:00', 'completed'),
(122, 21, 11, '2026-04-29', '09:00:00', '11:00:00', 'completed'),
(123, 22, 15, '2026-04-29', '13:00:00', '15:00:00', 'completed'),
(124, 23, 22, '2026-04-30', '08:00:00', '10:00:00', 'completed');

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` char(64) NOT NULL,
  `role` enum('admin','teacher') NOT NULL DEFAULT 'teacher'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id_user`, `name`, `surname`, `email`, `password`, `role`) VALUES
(1, 'Admin', 'Sistema', 'admin@itisavogadro.it', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'admin'),
(16, 'Marco', 'Rossi', 'marco.rossi@scuola.it', '556d4da067d2ce10916fb6a48acc76cbd2ceb175e470154ab0b9e34a97566b2f', 'admin'),
(17, 'Giulia', 'Ferrari', 'giulia.ferrari@scuola.it', 'a76b3941ec1e8e5b3d9cf2b53dcdfc84e5bdb8a1e1a1db0f8b8b89cf6ca16c06', 'admin'),
(18, 'Luca', 'Bianchi', 'luca.bianchi@scuola.it', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin'),
(19, 'Anna', 'Esposito', 'anna.esposito@scuola.it', '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b', 'teacher'),
(20, 'Paolo', 'Romano', 'paolo.romano@scuola.it', 'a5c6a678d99b7e8a5a2cfe8b2f1c87f9e8d9b1d9b3f8c3e1a2b4d5e6f7a8b9c0', 'teacher'),
(21, 'Chiara', 'Colombo', 'chiara.colombo@scuola.it', 'b3d5e7f9a1c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4', 'teacher'),
(22, 'Davide', 'Ricci', 'davide.ricci@scuola.it', 'c4e6f8a0b2d4e6f8a0c2d4e6f8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6', 'teacher'),
(23, 'Silvia', 'Marino', 'silvia.marino@scuola.it', 'd5f7a9b1c3e5f7a9b1d3e5f7a9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7', 'teacher'),
(24, 'Roberto', 'Greco', 'roberto.greco@scuola.it', 'e6a8b0c2d4f6a8b0c2e4f6a8b0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8', 'teacher'),
(25, 'Francesca', 'Bruno', 'francesca.bruno@scuola.it', 'f7b9c1d3e5a7b9c1d3f5a7b9c1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9', 'teacher'),
(26, 'Adam', 'Ramli', 'ramliadam2007@itisavogadro.it', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'teacher'),
(30, 'Gianny', 'Daniele', 'gianny@itisavogadro.it', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'teacher'),
(32, 'Gianny', 'Daniele', 'ramliadam@itisavogadro.it', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'teacher');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `laptops`
--
ALTER TABLE `laptops`
  ADD PRIMARY KEY (`id_laptop`),
  ADD KEY `id_model` (`id_model`),
  ADD KEY `id_locker` (`id_locker`);

--
-- Indici per le tabelle `lockers`
--
ALTER TABLE `lockers`
  ADD PRIMARY KEY (`id_locker`);

--
-- Indici per le tabelle `models`
--
ALTER TABLE `models`
  ADD PRIMARY KEY (`id_model`);

--
-- Indici per le tabelle `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id_reservation`,`id_user`,`id_laptop`) USING BTREE,
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_laptop` (`id_laptop`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `laptops`
--
ALTER TABLE `laptops`
  MODIFY `id_laptop` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT per la tabella `lockers`
--
ALTER TABLE `lockers`
  MODIFY `id_locker` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT per la tabella `models`
--
ALTER TABLE `models`
  MODIFY `id_model` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `laptops`
--
ALTER TABLE `laptops`
  ADD CONSTRAINT `laptops_ibfk_1` FOREIGN KEY (`id_model`) REFERENCES `models` (`id_model`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `laptops_ibfk_2` FOREIGN KEY (`id_locker`) REFERENCES `lockers` (`id_locker`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limiti per la tabella `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`id_laptop`) REFERENCES `laptops` (`id_laptop`) ON DELETE CASCADE ON UPDATE CASCADE;

DELIMITER $$
--
-- Eventi
--
CREATE DEFINER=`root`@`localhost` EVENT `ev_complete_reservations` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-04-26 19:14:39' ON COMPLETION NOT PRESERVE ENABLE DO UPDATE reservations
    SET status = 'completed'
    WHERE status = 'active'
    AND (date < CURDATE() OR (date = CURDATE() AND time_end <= CURTIME()))$$

CREATE DEFINER=`root`@`localhost` EVENT `ev_laptop_available` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-04-26 19:14:49' ON COMPLETION NOT PRESERVE ENABLE DO UPDATE laptops l
    SET l.status = 'available'
    WHERE l.status = 'unavailable'
    AND NOT EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.id_laptop = l.id_laptop
        AND r.status = 'active'
        AND r.date = CURDATE()
        AND r.time_start <= CURTIME()
        AND r.time_end > CURTIME()
    )$$

CREATE DEFINER=`root`@`localhost` EVENT `ev_laptop_unavailable` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-04-26 19:14:58' ON COMPLETION NOT PRESERVE ENABLE DO UPDATE laptops l
    SET l.status = 'unavailable'
    WHERE l.status = 'available'
    AND EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.id_laptop = l.id_laptop
        AND r.status = 'active'
        AND r.date = CURDATE()
        AND r.time_start <= CURTIME()
        AND r.time_end > CURTIME()
    )$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
