DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

-- Tabel produk
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,0) NOT NULL,  -- numeric bulat
    stock NUMERIC(10,0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, description, price, stock) VALUES
('Smartphone X', 'High-end smartphone', 999, 50),
('Laptop Pro', 'Powerful laptop for devs', 1499, 30),
('Headphones Z', 'Noise cancelling headphones', 199, 100);

-- Tabel orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id NUMERIC(10,0) NOT NULL,
    product_id NUMERIC(10,0) NOT NULL,
    quantity NUMERIC(10,0) NOT NULL,
    price NUMERIC(10,0) NOT NULL,
    total NUMERIC(10,0) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
