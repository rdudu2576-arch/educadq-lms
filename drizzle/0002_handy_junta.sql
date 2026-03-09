CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`event` varchar(100) NOT NULL,
	`affectedFile` varchar(255),
	`description` text,
	`userId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fraud_detection` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fraudType` varchar(100) NOT NULL,
	`description` text,
	`ipAddress` varchar(45),
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`isBlocked` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fraud_detection_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrity_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleName` varchar(100) NOT NULL,
	`status` enum('ok','warning','failed') NOT NULL DEFAULT 'ok',
	`codeHash` varchar(255),
	`lastCheckTime` timestamp NOT NULL DEFAULT (now()),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integrity_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`publicName` varchar(255),
	`bio` text,
	`score` int NOT NULL DEFAULT 0,
	`level` varchar(50) NOT NULL DEFAULT 'iniciante',
	`isPublic` boolean NOT NULL DEFAULT false,
	`profileImageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `subscription_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentDate` timestamp,
	`expirationDate` timestamp,
	`method` varchar(50) NOT NULL,
	`transactionId` varchar(255),
	`transactionGateway` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `event_idx` ON `audit_logs` (`event`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `audit_logs` (`severity`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `audit_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `fraud_detection` (`userId`);--> statement-breakpoint
CREATE INDEX `fraudType_idx` ON `fraud_detection` (`fraudType`);--> statement-breakpoint
CREATE INDEX `isBlocked_idx` ON `fraud_detection` (`isBlocked`);--> statement-breakpoint
CREATE INDEX `moduleName_idx` ON `integrity_checks` (`moduleName`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `integrity_checks` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `student_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `score_idx` ON `student_profiles` (`score`);--> statement-breakpoint
CREATE INDEX `isPublic_idx` ON `student_profiles` (`isPublic`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `subscription_payments` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscription_payments` (`status`);--> statement-breakpoint
CREATE INDEX `expirationDate_idx` ON `subscription_payments` (`expirationDate`);