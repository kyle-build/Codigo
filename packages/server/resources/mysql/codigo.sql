CREATE DATABASE IF NOT EXISTS `codigo_lowcode`;
USE `codigo_lowcode`;

DROP TABLE IF EXISTS `user`;

CREATE TABLE IF NOT EXISTS `user` (
    `id` INT PRIMARY KEY,
    `username` VARCHAR(255),
    `password` VARCHAR(255),
    `phone` VARCHAR(255),
    `open_id` VARCHAR(255),
    `head_img` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `page`;

CREATE TABLE IF NOT EXISTS `page` (
    `id` INT PRIMARY KEY,
    `account_id` INT,
    `page_name` VARCHAR(255),
    `tdk` VARCHAR(255),
    `components` TEXT,
    `desc` VARCHAR(255),
    `lockEditing` BOOLEAN DEFAULT FALSE,
    `user_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `resources`;

CREATE TABLE IF NOT EXISTS `resources` (
    `id` INT PRIMARY KEY,
    `url` VARCHAR(255) UNIQUE,
    `type` VARCHAR(255),
    `name` VARCHAR(255),
    `account_id` INT,
    `user_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `component`;

CREATE TABLE IF NOT EXISTS `component` (
    `id` INT PRIMARY KEY,
    `type` VARCHAR(255),
    `page_id` INT,
    `account_id` INT,
    `options` TEXT,
    `user_id` INT,
    `page_id1` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `component_data`;

CREATE TABLE IF NOT EXISTS `component_data` (
    `id` INT PRIMARY KEY,
    `page_id` INT,
    `user` VARCHAR(255),
    `props` TEXT,
    `page_id1` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `page_collaborator`;

CREATE TABLE IF NOT EXISTS `page_collaborator` (
    `id` VARCHAR(36) PRIMARY KEY,
    `page_id` INT,
    `user_id` INT,
    `role` VARCHAR(50) DEFAULT 'viewer',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `operation_log`;

CREATE TABLE IF NOT EXISTS `operation_log` (
    `id` VARCHAR(36) PRIMARY KEY,
    `page_id` INT,
    `actor_id` INT,
    `event` VARCHAR(255),
    `target` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
