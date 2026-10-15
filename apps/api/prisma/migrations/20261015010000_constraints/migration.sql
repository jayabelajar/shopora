CREATE INDEX `products_name_idx` ON `products`(`name`);
ALTER TABLE `products` ADD CONSTRAINT `products_price_nonnegative` CHECK (`price` >= 0), ADD CONSTRAINT `products_stock_nonnegative` CHECK (`stock` >= 0);
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_quantity_positive` CHECK (`quantity` > 0), ADD CONSTRAINT `order_items_amounts_nonnegative` CHECK (`unit_price` >= 0 AND `line_total` >= 0);
ALTER TABLE `orders` ADD CONSTRAINT `orders_amounts_nonnegative` CHECK (`subtotal` >= 0 AND `shipping_fee` >= 0 AND `discount_amount` >= 0 AND `total_amount` >= 0);
ALTER TABLE `payments` ADD CONSTRAINT `payments_amount_nonnegative` CHECK (`amount` >= 0);
