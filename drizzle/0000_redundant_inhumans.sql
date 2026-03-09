CREATE TABLE `assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`assessmentId` int NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`passed` boolean NOT NULL,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`type` enum('quiz','assignment','exam') NOT NULL DEFAULT 'quiz',
	`passingScore` int NOT NULL DEFAULT 70,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`timeLimit` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`certificateNumber` varchar(255) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`coverUrl` varchar(500),
	`trailerUrl` varchar(500),
	`courseHours` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`minimumGrade` int NOT NULL DEFAULT 70,
	`maxInstallments` int NOT NULL DEFAULT 1,
	`professorId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` enum('active','completed','dropped') NOT NULL DEFAULT 'active',
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`progress` int NOT NULL DEFAULT 0,
	`finalGrade` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `studentCourse_unique` UNIQUE(`studentId`,`courseId`)
);
--> statement-breakpoint
CREATE TABLE `lesson_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('pdf','document','spreadsheet','video','link') NOT NULL,
	`url` varchar(500) NOT NULL,
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`lessonId` int NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`completedAt` timestamp,
	`watchedMinutes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `studentLesson_unique` UNIQUE(`studentId`,`lessonId`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`type` enum('video','live','text','material') NOT NULL,
	`content` longtext,
	`videoUrl` varchar(500),
	`liveUrl` varchar(500),
	`order` int NOT NULL DEFAULT 0,
	`durationMinutes` int DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('payment_reminder','course_completed','approval','overdue') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` longtext NOT NULL,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`installments` int NOT NULL DEFAULT 1,
	`paidInstallments` int NOT NULL DEFAULT 0,
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`pixKey` varchar(255),
	`dueDate` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`text` longtext NOT NULL,
	`isCorrect` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`title` longtext NOT NULL,
	`type` enum('multiple_choice','true_false','short_answer') NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`assessmentId` int NOT NULL,
	`questionId` int NOT NULL,
	`selectedOptionId` int,
	`answer` longtext,
	`isCorrect` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`role` enum('user','admin','professor') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `studentId_idx` ON `assessment_results` (`studentId`);--> statement-breakpoint
CREATE INDEX `assessmentId_idx` ON `assessment_results` (`assessmentId`);--> statement-breakpoint
CREATE INDEX `lessonId_idx` ON `assessments` (`lessonId`);--> statement-breakpoint
CREATE INDEX `courseId_idx` ON `assessments` (`courseId`);--> statement-breakpoint
CREATE INDEX `studentId_idx` ON `certificates` (`studentId`);--> statement-breakpoint
CREATE INDEX `courseIdx` ON `certificates` (`courseId`);--> statement-breakpoint
CREATE INDEX `professorId_idx` ON `courses` (`professorId`);--> statement-breakpoint
CREATE INDEX `isActive_idx` ON `courses` (`isActive`);--> statement-breakpoint
CREATE INDEX `studentId_idx` ON `enrollments` (`studentId`);--> statement-breakpoint
CREATE INDEX `courseId_idx` ON `enrollments` (`courseId`);--> statement-breakpoint
CREATE INDEX `lessonId_idx` ON `lesson_materials` (`lessonId`);--> statement-breakpoint
CREATE INDEX `studentId_idx` ON `lesson_progress` (`studentId`);--> statement-breakpoint
CREATE INDEX `lessonId_idx` ON `lesson_progress` (`lessonId`);--> statement-breakpoint
CREATE INDEX `moduleId_idx` ON `lessons` (`moduleId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `lessons` (`type`);--> statement-breakpoint
CREATE INDEX `courseId_idx` ON `modules` (`courseId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `studentId_idx` ON `payments` (`studentId`);--> statement-breakpoint
CREATE INDEX `courseId_idx` ON `payments` (`courseId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `questionId_idx` ON `question_options` (`questionId`);--> statement-breakpoint
CREATE INDEX `assessmentId_idx` ON `questions` (`assessmentId`);--> statement-breakpoint
CREATE INDEX `studentId_idx` ON `student_answers` (`studentId`);--> statement-breakpoint
CREATE INDEX `assessmentId_idx` ON `student_answers` (`assessmentId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);