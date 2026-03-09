CREATE TABLE `device_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`lastUsed` timestamp NOT NULL DEFAULT (now()),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `device_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `registration_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`type` enum('text','select','number','textarea','checkbox','date') NOT NULL,
	`required` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`options` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registration_fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_registration_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fieldId` int NOT NULL,
	`value` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_registration_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `device_accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `deviceId_idx` ON `device_accounts` (`deviceId`);--> statement-breakpoint
CREATE INDEX `deviceUser_idx` ON `device_accounts` (`deviceId`,`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `password_reset_tokens` (`userId`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `password_reset_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `expiresAt_idx` ON `password_reset_tokens` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `registration_fields` (`active`);--> statement-breakpoint
CREATE INDEX `order_idx` ON `registration_fields` (`order`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `user_registration_data` (`userId`);--> statement-breakpoint
CREATE INDEX `fieldId_idx` ON `user_registration_data` (`fieldId`);--> statement-breakpoint
CREATE INDEX `userField_idx` ON `user_registration_data` (`userId`,`fieldId`);