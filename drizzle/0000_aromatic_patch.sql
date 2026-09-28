CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `activities_lead` ON `activities` (`lead_id`);--> statement-breakpoint
CREATE TABLE `intakes` (
	`lead_id` text PRIMARY KEY NOT NULL,
	`token_hash` text DEFAULT '' NOT NULL,
	`expires_at` text DEFAULT '' NOT NULL,
	`answers` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `intakes_token` ON `intakes` (`token_hash`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`product` text DEFAULT 'unsure' NOT NULL,
	`stage` text DEFAULT 'New' NOT NULL,
	`source` text DEFAULT 'Website' NOT NULL,
	`origin_rep` text DEFAULT '' NOT NULL,
	`owner_email` text DEFAULT '' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`next_action` text DEFAULT '' NOT NULL,
	`next_at` text DEFAULT '' NOT NULL,
	`preferred_time` text DEFAULT '' NOT NULL,
	`timezone` text DEFAULT '' NOT NULL,
	`calendar_event` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_contact_company` ON `leads` (`email`,`company`);--> statement-breakpoint
CREATE INDEX `leads_owner_stage` ON `leads` (`owner_email`,`stage`);--> statement-breakpoint
CREATE INDEX `leads_origin` ON `leads` (`origin_rep`);--> statement-breakpoint
CREATE TABLE `members` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`rep_code` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_rep_code` ON `members` (`rep_code`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`token` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `throttle` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`product` text NOT NULL,
	`industry` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`provider` text NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`poster` text DEFAULT '/studio/floor.webp' NOT NULL,
	`placement` text DEFAULT 'gallery' NOT NULL,
	`status` text DEFAULT 'Awaiting upload' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`consent` integer DEFAULT 0 NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`content_type` text DEFAULT 'video/mp4' NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `videos_public_product` ON `videos` (`published`,`product`);