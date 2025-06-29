-- Create Database
CREATE DATABASE IF NOT EXISTS `fibonacci_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- สร้าง user dbadmin และให้สิทธิ์
CREATE USER IF NOT EXISTS 'dbadmin'@'%' IDENTIFIED BY 'dbadmin1793';
GRANT ALL PRIVILEGES ON fibonacci_db.* TO 'dbadmin'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'dbadmin'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE `fibonacci_db`;

-- Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `picture` varchar(500) DEFAULT NULL,
  `googleId` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  UNIQUE KEY `IDX_2e8e4f3a7c8b9e0f1a2b3c4d5e` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Fibonacci Calculations Table
CREATE TABLE IF NOT EXISTS `fibonacci_calculations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `index` int(11) NOT NULL,
  `result` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_user_index` (`userId`, `index`),
  KEY `FK_fibonacci_user` (`userId`),
  CONSTRAINT `FK_fibonacci_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Data (Optional - for testing)
-- Sample User
INSERT INTO `users` (`email`, `name`, `googleId`, `picture`) VALUES
('test@example.com', 'Test User', 'google_test_123', 'https://via.placeholder.com/150');

-- Sample Fibonacci Calculations
INSERT INTO `fibonacci_calculations` (`userId`, `index`, `result`) VALUES
(1, 0, '0'),
(1, 1, '1'),
(1, 2, '1'),
(1, 3, '2'),
(1, 4, '3'),
(1, 5, '5'),
(1, 10, '55'),
(1, 15, '610');

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_fibonacci_userid_createdat` ON `fibonacci_calculations` (`userId`, `createdAt` DESC);
CREATE INDEX IF NOT EXISTS `idx_fibonacci_index` ON `fibonacci_calculations` (`index`);
CREATE INDEX IF NOT EXISTS `idx_users_email` ON `users` (`email`);
CREATE INDEX IF NOT EXISTS `idx_users_googleid` ON `users` (`googleId`);

-- Show table structure
DESCRIBE `users`;
DESCRIBE `fibonacci_calculations`;

-- Show created tables
SHOW TABLES;