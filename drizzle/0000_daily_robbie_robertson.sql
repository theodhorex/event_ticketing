CREATE TABLE `check_ins` (
	`id` varchar(36) NOT NULL,
	`ticket_id` varchar(36) NOT NULL,
	`scanned_by` varchar(36) NOT NULL,
	`scanned_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `check_ins_id` PRIMARY KEY(`id`)
);

CREATE TABLE `events` (
	`id` varchar(36) NOT NULL,
	`organizer_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(500) NOT NULL,
	`starts_at` timestamp NOT NULL,
	`ends_at` timestamp NOT NULL,
	`is_published` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);

CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`ticket_tier_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price_in_cents` int NOT NULL,
	`subtotal_in_cents` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);

CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`status` enum('pending','paid','cancelled','expired') NOT NULL DEFAULT 'pending',
	`total_in_cents` int NOT NULL,
	`reserved_until` timestamp NOT NULL,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ticket_tiers` (
	`id` varchar(36) NOT NULL,
	`event_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`price_in_cents` int NOT NULL,
	`quota` int NOT NULL,
	`sold_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ticket_tiers_id` PRIMARY KEY(`id`)
);

CREATE TABLE `tickets` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`order_item_id` varchar(36) NOT NULL,
	`ticket_tier_id` varchar(36) NOT NULL,
	`qr_data` varchar(255) NOT NULL,
	`is_used` int NOT NULL DEFAULT 0,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_qr_data_unique` UNIQUE(`qr_data`),
	CONSTRAINT `unique_qr` UNIQUE(`qr_data`)
);

CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` enum('organizer','buyer') NOT NULL DEFAULT 'buyer',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);

ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_ticket_id_tickets_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_scanned_by_users_id_fk` FOREIGN KEY (`scanned_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `events` ADD CONSTRAINT `events_organizer_id_users_id_fk` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_ticket_tier_id_ticket_tiers_id_fk` FOREIGN KEY (`ticket_tier_id`) REFERENCES `ticket_tiers`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyer_id_users_id_fk` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ticket_tiers` ADD CONSTRAINT `ticket_tiers_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_order_item_id_order_items_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ticket_tier_id_ticket_tiers_id_fk` FOREIGN KEY (`ticket_tier_id`) REFERENCES `ticket_tiers`(`id`) ON DELETE no action ON UPDATE no action;
CREATE INDEX `ticket_idx` ON `check_ins` (`ticket_id`);
CREATE INDEX `organizer_idx` ON `events` (`organizer_id`);
CREATE INDEX `starts_at_idx` ON `events` (`starts_at`);
CREATE INDEX `order_idx` ON `order_items` (`order_id`);
CREATE INDEX `buyer_idx` ON `orders` (`buyer_id`);
CREATE INDEX `status_idx` ON `orders` (`status`);
CREATE INDEX `reserved_until_idx` ON `orders` (`reserved_until`);
CREATE INDEX `event_idx` ON `ticket_tiers` (`event_id`);
CREATE INDEX `order_idx` ON `tickets` (`order_id`);
CREATE INDEX `qr_data_idx` ON `tickets` (`qr_data`);
