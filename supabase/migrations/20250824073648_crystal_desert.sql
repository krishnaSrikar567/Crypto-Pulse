-- Create database (run this first)
-- CREATE DATABASE crypto_alerts;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

/*-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    coin VARCHAR(50) NOT NULL,
    coin_name VARCHAR(100) NOT NULL,
    target_price NUMERIC(20,8) NOT NULL,
    current_price NUMERIC(20,8),
    triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_coin ON alerts(user_id, coin, triggered);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(triggered) WHERE triggered = FALSE;

-- Insert sample data for testing (optional)
-- INSERT INTO users (email, password_hash) VALUES ('test@example.com', '$2a$10$...');*/

-- Create Alerts table with UUID user_id referencing Supabase auth.users
CREATE TABLE IF NOT EXISTS public.alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coin VARCHAR(50) NOT NULL,
    coin_name VARCHAR(100) NOT NULL,
    target_price NUMERIC(20,8) NOT NULL,
    current_price NUMERIC(20,8),
    triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_coin ON public.alerts(user_id, coin, triggered);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON public.alerts(triggered) WHERE triggered = FALSE;
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);