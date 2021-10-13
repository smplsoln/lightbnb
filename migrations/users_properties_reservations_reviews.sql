CREATE TABLE addresses (
  id SERIAL PRIMARY KEY NOT NULL,
  country VARCHAR(100),
  street VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  post_code VARCHAR(10)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
  address_id INTEGER REFERENCES addresses(id) ON DELETE CASCADE,
);


CREATE TABLE properties (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cost_per_night DECIMAL DEFAULT 0,
  parking_spaces INTEGER,
  number_of_bathrooms INTEGER,
  number_of_bedrooms INTEGER,
  thumbnail_url TEXT,
  cover_url TEXT,
  address_id INTEGER REFERENCES addresses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE reservations (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE

);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  message TEXT,
  rating INTEGER,
  CHECK (rating BETWEEN 1 AND 5)
)