CREATE TABLE `dynamic_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`contentType` enum('html','text','markdown') NOT NULL DEFAULT 'html',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dynamic_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `dynamic_content_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE INDEX `key_idx` ON `dynamic_content` (`key`);