USE ecommerce_db;

-- Add delivery_status column to Orders if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA='ecommerce_db' AND TABLE_NAME='Orders' AND COLUMN_NAME='delivery_status');
SET @sql = IF(@col_exists = 0, 
  "ALTER TABLE Orders ADD COLUMN delivery_status ENUM('Placed','Confirmed','Shipped','Out for Delivery','Delivered') DEFAULT 'Placed'", 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create Cart table if it doesn't exist
CREATE TABLE IF NOT EXISTS Cart (
  cart_id     INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
  FOREIGN KEY (product_id)  REFERENCES Products(product_id)
);

SELECT 'Migration complete!' AS status;
