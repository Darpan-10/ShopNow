# ShopNow - E-Commerce Management System

**ShopNow** is a comprehensive full-stack E-Commerce Management System designed to handle core retail operations including customer management, product categorization, inventory tracking, and order processing. This project features a robust RESTful API backend and a dynamic, responsive frontend interface.

---

## **Tech Stack**

- **Frontend**: 
  - HTML5 & CSS3 (Modern, responsive UI)
  - Vanilla JavaScript (DOM manipulation & Fetch API)
- **Backend**: 
  - Node.js
  - Express.js (Web framework)
- **Database**: 
  - MySQL (Relational database)
- **Dependencies**: 
  - `mysql2`: MySQL client for Node.js
  - `cors`: Cross-Origin Resource Sharing
  - `express`: Web server framework

---

## **Implementation**

### **Backend Architecture**
The backend is built with **Node.js** and **Express.js**, following a modular REST API design.
- **Database Connection**: Uses `mysql2` with a promise-based helper for efficient querying.
- **REST Endpoints**:
  - `Customers`: CRUD operations for managing store customers.
  - `Categories`: Manage product categories.
  - `Products`: Complete product lifecycle management with category linking.
  - `Orders`: Order placement and status tracking.
  - `Cart`: Real-time shopping cart management.
  - `Stats`: Aggregated dashboard metrics (Revenue, Customer count, etc.).

### **Frontend Logic**
The frontend is a single-page application (SPA) built with **Vanilla JavaScript**.
- **Dynamic Content**: Uses asynchronous `fetch` calls to interact with the backend API.
- **State Management**: Handles real-time updates for the shopping cart and dashboard stats.
- **UI Components**: Custom-built modals, toast notifications, and animated counters for an enhanced user experience.

---

## **Process**

1. **Database Modeling**: Designed a relational schema with 6 interconnected tables (Customers, Categories, Products, Orders, Order_Items, Cart) using foreign key constraints for data integrity.
2. **API Development**: Implemented secure and scalable RESTful endpoints using Express.js.
3. **Frontend Integration**: Developed a modern UI that consumes the API, providing a seamless experience for managing the e-commerce store.
4. **Data Migration**: Created SQL scripts (`schema.sql`, `migrate.sql`) for easy database setup and initial data seeding.

---

## **Setup**

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL Server](https://www.mysql.com/)

### **Database Configuration**
1. Log in to your MySQL server.
2. Run the `schema.sql` script to create the database and tables:
   ```bash
   mysql -u your_username -p < schema.sql
   ```
3. (Optional) Run `migrate.sql` for any schema updates:
   ```bash
   mysql -u your_username -p < migrate.sql
   ```

### **Backend Configuration**
1. Open [server.js](file:///c:/PROJECT/FINAL/ShopNow/server.js).
2. Update the `db` configuration with your MySQL credentials:
   ```javascript
   const db = mysql.createConnection({
     host:     "localhost",
     user:     "your_username",
     password: "your_password",
     database: "ecommerce_db"
   });
   ```

---

## **How to Start**

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   *The server will run on [http://localhost:5000](http://localhost:5000)*

3. **Launch the Application**:
   Open [index.html](file:///c:/PROJECT/FINAL/ShopNow/index.html) in any modern web browser.

---

## **Details**

### **Database Schema**
- **Customers**: Stores user profiles (Name, Email).
- **Categories**: Product groupings (Electronics, Clothing, etc.).
- **Products**: Item details including price and category link.
- **Orders**: Tracks purchase history and delivery status.
- **Order_Items**: Junction table for multi-product orders.
- **Cart**: Temporary storage for customer selections.

### **Key Features**
- **Dashboard**: Real-time business analytics and recent order activity.
- **Order Tracking**: Dynamic status updates (Placed → Shipped → Delivered).
- **Responsive Design**: Clean and professional UI suitable for various screen sizes.
- **Integrated Cart**: Seamless shopping experience with persistent cart storage.
