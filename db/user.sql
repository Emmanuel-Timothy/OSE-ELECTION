CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

INSERT INTO users (username, password, role) VALUES
('murid01', '1234', 'murid'),
('guru01', 'abcd', 'guru'),
('parcom01', 'parcom', 'parcom'),
('panitia01', 'admin', 'admin');
