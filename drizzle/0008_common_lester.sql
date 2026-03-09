CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('info','warning','error','security') NOT NULL,
	`source` varchar(100) NOT NULL,
	`message` text,
	`metadata` json,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `level_idx` ON `system_logs` (`level`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `system_logs` (`source`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `system_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `system_logs` (`createdAt`);