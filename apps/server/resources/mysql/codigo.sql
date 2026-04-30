CREATE DATABASE IF NOT EXISTS `codigo_lowcode`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `codigo_lowcode`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `operation_log`;
DROP TABLE IF EXISTS `page_collaborator`;
DROP TABLE IF EXISTS `page_version`;
DROP TABLE IF EXISTS `component_data`;
DROP TABLE IF EXISTS `component`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `page`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `template`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS `user` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `head_img` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `open_id` VARCHAR(255) NOT NULL,
    `global_role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `admin_permissions` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `account_id` INT NOT NULL,
    `page_name` VARCHAR(255) NOT NULL,
    `components` TEXT NOT NULL,
    `schema_version` INT NOT NULL DEFAULT 1,
    `tdk` VARCHAR(255) NOT NULL,
    `desc` VARCHAR(255) NOT NULL,
    `pageCategory` VARCHAR(20) NOT NULL DEFAULT 'marketing',
    `layoutMode` VARCHAR(20) NOT NULL DEFAULT 'absolute',
    `lockEditing` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `resources` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `account_id` INT NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `component` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(255) NOT NULL,
    `page_id` INT NOT NULL,
    `account_id` INT NOT NULL,
    `options` TEXT NOT NULL,
    `node_id` VARCHAR(255) NOT NULL,
    `parent_node_id` VARCHAR(255) NULL,
    `slot` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `styles` TEXT NULL,
    `meta` TEXT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `component_data` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `page_id` INT NOT NULL,
    `user` VARCHAR(255) NOT NULL,
    `props` TEXT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page_version` (
    `id` VARCHAR(36) NOT NULL,
    `page_id` INT NOT NULL,
    `account_id` INT NOT NULL,
    `version` INT NOT NULL,
    `desc` VARCHAR(255) NOT NULL,
    `schema_data` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page_collaborator` (
    `id` VARCHAR(36) NOT NULL,
    `page_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `operation_log` (
    `id` VARCHAR(36) NOT NULL,
    `page_id` INT NOT NULL,
    `actor_id` INT NOT NULL,
    `event` VARCHAR(255) NOT NULL,
    `target` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `template` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `desc` VARCHAR(255) NOT NULL,
    `tags` TEXT NULL,
    `page_title` VARCHAR(100) NOT NULL,
    `page_category` VARCHAR(50) NOT NULL,
    `layout_mode` VARCHAR(50) NOT NULL,
    `device_type` VARCHAR(50) NOT NULL,
    `canvas_width` INT NOT NULL,
    `canvas_height` INT NOT NULL,
    `active_page_path` VARCHAR(100) NOT NULL,
    `pages_count` INT NOT NULL DEFAULT 1,
    `cover_url` VARCHAR(255) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `version` INT NOT NULL DEFAULT 1,
    `preset` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_template_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
