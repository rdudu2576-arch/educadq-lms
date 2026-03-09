CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`cover` varchar(500),
	`content` longtext NOT NULL,
	`excerpt` varchar(500),
	`author` varchar(255) NOT NULL,
	`authorId` int,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `slug` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `transactionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `zip` varchar(10);--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `published_idx` ON `articles` (`isPublished`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `courses` (`slug`);