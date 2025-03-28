-- Initialize database with proper charset and collation
CREATE DATABASE IF NOT EXISTS parqueo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'parqueo_user'@'%' IDENTIFIED BY 'parqueo_password';
GRANT ALL PRIVILEGES ON parqueo_db.* TO 'parqueo_user'@'%';
GRANT CREATE, DROP ON *.* TO 'parqueo_user'@'%';
FLUSH PRIVILEGES;

USE parqueo_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('DRIVER', 'OWNER') DEFAULT 'DRIVER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create parking_lots table
CREATE TABLE IF NOT EXISTS parking_lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    total_spaces INT NOT NULL,
    available_spaces INT NOT NULL,
    operating_hours VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    amenities TEXT,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (latitude, longitude),
    INDEX idx_owner (owner_id)
);

-- Create parking_updates table for audit trail
CREATE TABLE IF NOT EXISTS parking_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parking_lot_id INT NOT NULL,
    previous_spaces INT NOT NULL,
    new_spaces INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE
);
