-- Kithly Trust Loop Schema

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('Buyer', 'ShopOwner') NOT NULL,
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    verified_status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    stock INT DEFAULT 0,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    shop_id INT NOT NULL,
    recipient_phone VARCHAR(20),
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Paid', 'Collected') DEFAULT 'Pending',
    collection_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);
