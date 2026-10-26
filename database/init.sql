-- database/init.sql
-- Creates all tables and inserts starter data.
PRAGMA foreign_keys = ON;

-- 1. Game Information (Par spēli)
CREATE TABLE game_info (
  id                INTEGER PRIMARY KEY CHECK (id = 1),   -- exactly one row
  name              TEXT NOT NULL,
  developer         TEXT NOT NULL,
  publisher         TEXT NOT NULL,
  genre             TEXT NOT NULL,
  release_year      INTEGER NOT NULL,
  platform          TEXT NOT NULL DEFAULT 'PC',           -- 1NF: atomic single platform
  platforms         TEXT NOT NULL DEFAULT 'PC',           -- backward-compatible alias
  short_description TEXT NOT NULL,
  description       TEXT NOT NULL,
  main_image        TEXT NOT NULL DEFAULT '/images/hero.jpg' -- main cover image
);

-- Cars catalogue (for website Content section)
CREATE TABLE cars (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  class        TEXT NOT NULL CHECK (class IN ('GT3', 'GT4')),
  year         INTEGER,
  engine       TEXT,
  power_hp     INTEGER,
  weight_kg    INTEGER,
  description  TEXT NOT NULL,
  image        TEXT
);

-- Circuits catalogue (for website Content section)
CREATE TABLE circuits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  length_km   REAL,
  turns       INTEGER,
  description TEXT NOT NULL,
  image       TEXT
);

-- 2. News and articles (Ziņas un raksti)
-- Linked to game_info via foreign key game_id
CREATE TABLE news (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id     INTEGER NOT NULL DEFAULT 1 REFERENCES game_info(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,                           -- 1NF: single category per record
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  content     TEXT NOT NULL,
  image       TEXT,
  date        TEXT NOT NULL                            -- format: YYYY-MM-DD
);

-- 3. Gallery (Galerija)
-- Linked to game_info via foreign key game_id
CREATE TABLE gallery (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id     INTEGER NOT NULL DEFAULT 1 REFERENCES game_info(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  image       TEXT NOT NULL                            -- file path or URL
);

-- ---------- Starter data ----------

INSERT INTO game_info
  (id, name, developer, publisher, genre, release_year, platform, platforms, short_description, description, main_image)
VALUES (
  1,
  'Assetto Corsa Competizione',
  'Kunos Simulazioni',
  '505 Games',
  'Racing simulation',
  2019,
  'PC',
  'PC',
  'The official GT World Challenge simulation: real GT3 and GT4 cars, real circuits, serious racing.',
  'Assetto Corsa Competizione (ACC) is a racing simulation focused on GT3 and GT4 racing. It is the official game of the GT World Challenge series and recreates the cars, circuits and race weekends of modern GT competition.

The game is built on Unreal Engine 4 and is known for its detailed car physics, realistic tyre behaviour, dynamic weather and day-night cycle. Players can race against the AI, compete in online multiplayer, or practise alone to learn every corner of the circuits.',
  '/images/hero.jpg'
);

INSERT INTO cars (name, manufacturer, class, year, engine, power_hp, weight_kg, description, image) VALUES
('Ferrari 296 GT3', 'Ferrari', 'GT3', 2023, '3.0L twin-turbo V6', 600, 1260,
 'A modern Ferrari GT3 car built around a compact twin-turbo V6. It is known for strong traction out of slow corners and a very stable rear end.',
 '/images/cars/ferrari-296-gt3.jpg'),
('Porsche 911 GT3 R (992)', 'Porsche', 'GT3', 2023, '4.2L naturally aspirated flat-six', 565, 1300,
 'The rear-engined Porsche GT3 racer. The engine sits behind the rear axle, which gives great traction but needs a careful hand on corner entry.',
 '/images/cars/porsche-911-gt3-r-992.jpg'),
('Mercedes-AMG GT3 Evo', 'Mercedes-AMG', 'GT3', 2020, '6.2L naturally aspirated V8', 550, 1285,
 'A long-running favourite with a big V8 and a forgiving, predictable balance. A good choice for drivers who want to learn GT3 racing.',
 '/images/cars/mercedes-amg-gt3-evo.jpg'),
('BMW M4 GT3', 'BMW', 'GT3', 2022, '3.0L twin-turbo inline-six', 590, 1300,
 'BMW''s turbocharged GT3 car. It has strong low-end torque and rewards smooth throttle control.',
 '/images/cars/bmw-m4-gt3.jpg'),
('Lamborghini Huracan GT3 Evo2', 'Lamborghini', 'GT3', 2023, '5.2L naturally aspirated V10', 600, 1300,
 'A V10-powered GT3 car with a sharp, aggressive character and a great engine sound. Fast, but it likes a confident driver.',
 '/images/cars/lamborghini-huracan-gt3-evo2.jpg'),
('Audi R8 LMS GT3 Evo II', 'Audi', 'GT3', 2022, '5.2L naturally aspirated V10', 585, 1240,
 'A mid-engined V10 racer that has been a GT3 benchmark for years. Stable, quick and consistent over a long run.',
 '/images/cars/audi-r8-lms-gt3-evo2.jpg'),
('Porsche 718 Cayman GT4 Clubsport', 'Porsche', 'GT4', 2019, '3.8L naturally aspirated flat-six', 425, 1320,
 'A mid-engined GT4 car that is easy to drive near the limit. Great for learning racecraft before moving up to GT3.',
 '/images/cars/porsche-718-cayman-gt4.jpg'),
('BMW M4 GT4', 'BMW', 'GT4', 2018, '3.0L turbocharged inline-six', 430, 1400,
 'A front-engined, rear-wheel-drive GT4 car with a lot of grip and a friendly balance.',
 '/images/cars/bmw-m4-gt4.jpg'),
('Mercedes-AMG GT4', 'Mercedes-AMG', 'GT4', 2017, '4.0L twin-turbo V8', 430, 1400,
 'A front-engined GT4 car with a punchy V8. It needs smooth inputs to keep the rear under control.',
 '/images/cars/mercedes-amg-gt4.jpg');

INSERT INTO circuits (name, country, length_km, turns, description, image) VALUES
('Autodromo Nazionale Monza', 'Italy', 5.793, 11,
 'Known as the Temple of Speed. Long straights and heavy braking zones into chicanes make slipstreaming and braking stability the key to a fast lap.',
 '/images/circuits/monza.jpg'),
('Circuit de Spa-Francorchamps', 'Belgium', 7.004, 19,
 'A long, fast circuit in the Ardennes forest, famous for Eau Rouge and Raidillon. The weather can change from one side of the track to the other.',
 '/images/circuits/spa-francorchamps.jpg'),
('Nurburgring Grand Prix Circuit', 'Germany', 5.148, 15,
 'A modern grand prix layout with a mix of fast sweepers and slow corners. Weather and tyre management often decide the race here.',
 '/images/circuits/nurburgring-gp.jpg'),
('Circuit de Barcelona-Catalunya', 'Spain', 4.657, 14,
 'A technical circuit that teams know very well. A long main straight is followed by a demanding mix of fast and slow corners.',
 '/images/circuits/barcelona-catalunya.jpg'),
('Misano World Circuit Marco Simoncelli', 'Italy', 4.226, 16,
 'A compact, flowing track with a lot of direction changes. Good rhythm and a well-balanced car are essential.',
 '/images/circuits/misano.jpg'),
('Silverstone Circuit', 'United Kingdom', 5.891, 18,
 'A fast circuit built on a former airfield. The high-speed Maggotts, Becketts and Chapel sequence is one of the most famous in racing.',
 '/images/circuits/silverstone.jpg');

-- 5 realistic news articles (meets "Vismaz pieci ziņu vai rakstu ieraksti")
INSERT INTO news (game_id, category, title, description, content, image, date) VALUES
(1, 'Site news', 'Welcome to the ACC fan site',
 'A quick tour of what you can find on this website.',
 'This website is a fan-made guide to Assetto Corsa Competizione.

You can read about the game on the Description page, browse GT3 and GT4 cars and racing circuits in the Content section, look through the Gallery, and use the search bar to find anything quickly.

New articles and updates will be posted in the News section.',
 '/images/news/welcome.jpg', '2026-10-01'),

(1, 'Guide', 'What is Balance of Performance?',
 'Why different GT3 cars can race closely against each other.',
 'GT3 cars come from many different manufacturers and have very different designs, for example turbocharged engines, naturally aspirated engines, front-engined and rear-engined layouts.

To keep racing close, championships use Balance of Performance, often shortened to BoP. Organisers adjust things like minimum weight and engine power for each car, so no single model is too dominant.

In Assetto Corsa Competizione, this means the performance gap between cars is usually small, and driver skill and race strategy matter more than the badge on the bonnet.',
 '/images/news/bop.jpg', '2026-10-08'),

(1, 'Guide', 'GT3 vs GT4: what is the difference?',
 'A short comparison to help you pick the right class to start with.',
 'GT3 cars are the top level of customer GT racing. They have more power, more aerodynamic downforce and generally lap faster.

GT4 cars are closer to road cars. They are slower and more forgiving, which makes them a good place to learn braking points, racecraft and car control.

If you are new to ACC, try a GT4 car first. When you feel comfortable, move up to GT3 and notice how much more the aerodynamics help in fast corners.',
 '/images/news/gt3-vs-gt4.jpg', '2026-10-15'),

(1, 'Update', 'Physics and Tyre Model 1.9 Overview',
 'Key updates to tyre contact patches, kerb behavior, and temperature management.',
 'Assetto Corsa Competizione''s modern 1.9 physics update introduced a comprehensive overhaul to tyre contact patch deflection and temperature propagation across the tread.

Key improvements include wider operating thermal windows, a much more progressive and readable breakaway sensation when riding aggressive kerbs, and revised damping curves across all GT3 machinery.

Drivers should target hot pressures between 26.5 and 27.0 psi in dry conditions for optimal mechanical grip and consistent endurance stint pace.',
 '/images/news/welcome.jpg', '2026-10-20'),

(1, 'Esports', 'SRO Esports Championship Season Announced',
 'Registration opens for the official Assetto Corsa Competizione continental esports season.',
 'The official GT World Challenge Esports championship has unveiled its new race calendar for Assetto Corsa Competizione.

The championship features multi-round endurance racing across Monza, Circuit de Spa-Francorchamps, and Silverstone with strictly calibrated balance of performance and mandatory driver pitstops.

Both professional factory esports teams and community sim racers can participate via open qualifying server leaderboards.',
 '/images/news/bop.jpg', '2026-10-24');

-- 5 realistic gallery items (meets "Vismaz pieci galerijas attēlu ieraksti")
INSERT INTO gallery (game_id, title, description, image) VALUES
(1, 'Golden hour at Monza', 'Evening light over the main straight as the pack approaches the Rettifilo chicane.', '/images/gallery/monza-golden-hour.jpg'),
(1, 'Rain at Spa', 'Spray everywhere as the field heads up Raidillon in treacherous wet conditions.', '/images/gallery/spa-rain.jpg'),
(1, 'Night race', 'Headlights blazing through the darkness on a long 24-hour endurance stint.', '/images/gallery/night-race.jpg'),
(1, 'Side by side', 'Fierce wheel-to-wheel GT3 battle into the first braking zone.', '/images/gallery/side-by-side.jpg'),
(1, 'Sunset over Nürburgring GP', 'Warm evening tones reflecting off the grandstands and the Mercedes-Benz arena.', '/images/circuits/nurburgring-gp.jpg');
