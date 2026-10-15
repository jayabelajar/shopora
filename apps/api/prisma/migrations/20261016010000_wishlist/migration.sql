CREATE TABLE `wishlist_items` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `product_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `wishlist_items_user_id_product_id_key`(`user_id`, `product_id`),
  INDEX `wishlist_items_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `wishlist_items_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `wishlist_items_product_id_fkey`
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
