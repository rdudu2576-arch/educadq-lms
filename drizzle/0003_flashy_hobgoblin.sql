CREATE TABLE `page_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(100) NOT NULL,
	`sectionKey` varchar(100) NOT NULL,
	`contentKey` varchar(100) NOT NULL,
	`content` longtext NOT NULL,
	`contentType` enum('text','html','markdown') NOT NULL DEFAULT 'text',
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_content_pageKey_unique` UNIQUE(`pageKey`)
);
--> statement-breakpoint
CREATE INDEX `pageKey_idx` ON `page_content` (`pageKey`);--> statement-breakpoint
CREATE INDEX `sectionKey_idx` ON `page_content` (`sectionKey`);--> statement-breakpoint
CREATE INDEX `unique_content_idx` ON `page_content` (`pageKey`,`sectionKey`,`contentKey`);