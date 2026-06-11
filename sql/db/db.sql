-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Giu 11, 2026 alle 13:22
-- Versione del server: 12.2.2-MariaDB
-- Versione PHP: 8.5.6

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
  `status` enum('available','unavailable','maintenance') NOT NULL DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `laptops`
--

INSERT INTO `laptops` (`id_laptop`, `id_model`, `id_locker`, `status`) VALUES
(1, 1, 1, 'available'),
(2, 1, 1, 'available'),
(3, 2, 1, 'available'),
(4, 1, 2, 'available'),
(5, 2, 2, 'available'),
(41, 2, 3, 'maintenance');

-- --------------------------------------------------------

--
-- Struttura della tabella `lockers`
--

CREATE TABLE `lockers` (
  `id_locker` int(11) NOT NULL,
  `name_locker` varchar(100) NOT NULL,
  `location` enum('T01','T02','T03','T04','T05','T06','P101','P102','P103','P104','P105','P106','P201','P202','P203','P204','P205','P206','P301','P302','P303','P304','P305','P306','Lab Informatica 1','Lab Informatica 2','Lab Informatica 3','Lab Informatica 4','Lab Elettronica','Lab Meccanica','Lab Chimica','Lab Fisica','Aula Magna','Biblioteca','Palestra') DEFAULT 'T01'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `lockers`
--

INSERT INTO `lockers` (`id_locker`, `name_locker`, `location`) VALUES
(1, 'Armadietto A', 'T03'),
(2, 'Armadietto B', NULL),
(3, 'Armadietto C', NULL);

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
(1, 'Lenovo', 'ThinkPad E15', 'Intel Core i5-1235U', 16, 512, 'Windows 11 Pro'),
(2, 'HP', 'ProBook 450 G9', 'Intel Core i5-1235U', 8, 256, 'Windows 11 Pro'),
(3, 'Dell', 'Latitude 5530', 'Intel Core i7-1255U', 16, 512, 'Windows 11 Pro'),
(23, 'Acer', 'Sigma Aspire 5020', 'Intel core isigma', 32, 512, 'Windows '),
(24, 'Acer', 'Sigma Aspire 5020', 'Intel core isigma', 32, 512, 'Windows '),
(25, 'Acer', 'Sigma Aspire 5020', NULL, 32, 512, 'Windows ');

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
  `status` enum('active','completed') NOT NULL DEFAULT 'active',
  `class` enum('1AL','1BL','1CL','2AL','2BL','2CL','3AL','3BL','3CL','4AL','4BL','4CL','5AL','5BL','5CL','1AI','1BI','1CI','1DI','1II','1LI','2AI','2BI','2CI','2DI','2II','3AI','3BI','3CI','4AI','4BI','4CI','5AI','5BI','5CI','1EM','1FM','2EM','2FM','3AM','3BM','4AM','4BM','5AM','5BM','1GE','1HE','2GE','2HE','3AE','3BE','4AE','4BE','5AE','5BE') NOT NULL,
  `classroom` enum('T01','T02','T03','T04','T05','T06','P101','P102','P103','P104','P105','P106','P201','P202','P203','P204','P205','P206','P301','P302','P303','P304','P305','P306','Lab Informatica 1','Lab Informatica 2','Lab Informatica 3','Lab Informatica 4','Lab Elettronica','Lab Meccanica','Lab Chimica','Lab Fisica','Aula Magna','Biblioteca','Palestra') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `reservations`
--

INSERT INTO `reservations` (`id_reservation`, `id_user`, `id_laptop`, `date`, `time_start`, `time_end`, `status`, `class`, `classroom`) VALUES
(4, 95, 1, '2026-05-25', '20:53:00', '23:53:00', 'completed', '1AL', 'T01'),
(4, 95, 2, '2026-05-25', '20:53:00', '23:53:00', 'completed', '1AL', 'T01'),
(4, 95, 3, '2026-05-25', '20:53:00', '23:53:00', 'completed', '1AL', 'T01'),
(5, 98, 4, '2026-05-26', '11:34:00', '12:34:00', 'completed', '1AL', 'T01'),
(5, 98, 5, '2026-05-26', '11:34:00', '12:34:00', 'completed', '1AL', 'T01'),
(6, 98, 1, '2026-05-26', '10:38:00', '12:34:00', 'completed', '1AL', 'T01'),
(6, 98, 2, '2026-05-26', '10:38:00', '12:34:00', 'completed', '1AL', 'T01'),
(6, 98, 3, '2026-05-26', '10:38:00', '12:34:00', 'completed', '1CI', 'T01'),
(7, 1, 3, '2026-06-12', '15:00:00', '16:00:00', 'active', '1AI', 'Palestra'),
(7, 1, 4, '2026-06-12', '15:00:00', '16:00:00', 'active', '1AI', 'Palestra'),
(7, 1, 5, '2026-06-12', '15:00:00', '16:00:00', 'active', '1AI', 'Palestra');

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
  `role` enum('admin','teacher') NOT NULL DEFAULT 'teacher',
  `verified` tinyint(1) NOT NULL,
  `otp` mediumint(9) DEFAULT NULL,
  `otp_time` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id_user`, `name`, `surname`, `email`, `password`, `role`, `verified`, `otp`, `otp_time`) VALUES
(1, 'Admin', 'Sistema', 'admin@itisavogadro.it', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'admin', 1, NULL, NULL),
(56, 'Adam', 'Ramli', 'ramliadam2007@gmail.com', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'teacher', 1, 140159, '2026-05-20 19:43:34'),
(94, 'ricardo', 'valbuena', 'orazioilpazzo5@gmail.com', 'e966a70e4eb238382ad51fd2a5d974a3cd400d93094ad35efc249e35cac17036', 'teacher', 1, 970291, '2026-05-23 20:40:51'),
(95, 'daniele', 'gianella', 'daniele.gianella8@gmail.com', 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', 'teacher', 1, 837188, '2026-05-25 08:22:51'),
(98, 'Paolo', 'Nesi', 'paolo.nesi.sanmauro@gmail.com', '0a1dfd09d798d16a95907f130c00ef6bebb7379682fb0890147fbd8ae243b7cb', 'teacher', 1, 921185, '2026-05-26 08:34:23');

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
  MODIFY `id_laptop` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT per la tabella `lockers`
--
ALTER TABLE `lockers`
  MODIFY `id_locker` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `models`
--
ALTER TABLE `models`
  MODIFY `id_model` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

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
CREATE DEFINER=`root`@`localhost` EVENT `ev_complete_reservations` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-05-23 21:55:24' ON COMPLETION PRESERVE ENABLE DO UPDATE reservations
    SET status = 'completed'
    WHERE status = 'active'
    AND (date < CURDATE() OR (date = CURDATE() AND time_end <= CURTIME()))$$

CREATE DEFINER=`root`@`localhost` EVENT `ev_laptop_available` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-05-23 21:55:24' ON COMPLETION PRESERVE ENABLE DO UPDATE laptops l
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

CREATE DEFINER=`root`@`localhost` EVENT `ev_laptop_unavailable` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-05-23 21:55:24' ON COMPLETION PRESERVE ENABLE DO UPDATE laptops l
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

CREATE DEFINER=`root`@`localhost` EVENT `ev_control_otp` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-05-23 21:55:24' ON COMPLETION PRESERVE ENABLE DO DELETE FROM users
    WHERE otp_time IS NOT NULL AND verified = 0
    AND otp_time < NOW() - INTERVAL 1 MINUTE$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
