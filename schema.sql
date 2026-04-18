-- ============================================
-- E-Commerce Management System
-- Student: Darpan Mandal | AP24110011511
-- ============================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Table 1: Customers
CREATE TABLE Customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL,
  email       VARCHAR(50) UNIQUE NOT NULL
);

-- Table 2: Categories
CREATE TABLE Categories (
  category_id   INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) NOT NULL
);

-- Table 3: Products
CREATE TABLE Products (
  product_id  INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  category_id INT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- Table 4: Orders
CREATE TABLE Orders (
  order_id        INT PRIMARY KEY AUTO_INCREMENT,
  customer_id     INT NOT NULL,
  order_date      DATE NOT NULL,
  delivery_status ENUM('Placed','Confirmed','Shipped','Out for Delivery','Delivered') DEFAULT 'Placed',
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- Table 5: Order_Items
CREATE TABLE Order_Items (
  item_id    INT PRIMARY KEY AUTO_INCREMENT,
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES Orders(order_id),
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Table 6: Cart
CREATE TABLE Cart (
  cart_id     INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
  FOREIGN KEY (product_id)  REFERENCES Products(product_id)
);

-- ============================================
-- Sample Data
-- ============================================

INSERT INTO Customers (name, email) VALUES
  ('Darpan Mandal',  'darpan@example.com'),
  ('Priya Sharma',   'priya@example.com'),
  ('Ravi Kumar',     'ravi@example.com');

INSERT INTO Categories (category_name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Books');

INSERT INTO Products (name, price, category_id) VALUES
  ('Wireless Earbuds',  1299.00, 1),
  ('Laptop Stand',       799.00, 1),
  ('Cotton T-Shirt',     349.00, 2),
  ('DBMS Textbook',      499.00, 3);

INSERT INTO Orders (customer_id, order_date, delivery_status) VALUES
  (1, '2025-01-10', 'Delivered'),
  (2, '2025-01-12', 'Shipped'),
  (1, '2025-01-15', 'Placed');

INSERT INTO Order_Items (order_id, product_id, quantity) VALUES
  (1, 1, 1),
  (1, 3, 2),
  (2, 4, 1),
  (3, 2, 1),
  (3, 1, 2);
