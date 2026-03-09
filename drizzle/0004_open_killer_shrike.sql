ALTER TABLE `student_profiles` ADD `professionalBio` text;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `formation` text;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `professionalPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `professionalEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `otherContacts` text;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `linkedin` varchar(500);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `instagram` varchar(500);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `website` varchar(500);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `facebook` varchar(500);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `youtube` varchar(500);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `otherSocial` text;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `paymentStatus` enum('pending','paid','expired') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `paymentDate` timestamp;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `annualExpiryDate` timestamp;