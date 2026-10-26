-- =============================================================================
-- MySQL datubazes izveides un aizpildisanas skripts
-- Uzdevums: "MySQL datubāzes izveide un ER diagrammas ģenerēšana"
-- Spēle: Assetto Corsa Competizione (ACC)
-- =============================================================================

-- Izveidojam un izvēlamies datubāzi
CREATE DATABASE IF NOT EXISTS `acc_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `acc_db`;

-- Dzēšam tabulas, ja tās jau eksistē (apgrieztā secībā dēļ ārējām atslēgām)
DROP TABLE IF EXISTS `gallery`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `game_info`;

-- =============================================================================
-- 1. TABULA: Par spēli (`game_info`)
-- Satur datus par spēli: nosaukums, izstrādātājs, izdevējs, žanrs, izdošanas gads,
-- platforma, apraksts un galvenais attēls.
-- 1NF atbilstība: 'platform' glabā vienu atomāru vērtību (nevis komatiem atdalītu sarakstu).
-- =============================================================================
CREATE TABLE `game_info` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'Spēles nosaukums',
  `developer` VARCHAR(100) NOT NULL COMMENT 'Izstrādātājs',
  `publisher` VARCHAR(100) NOT NULL COMMENT 'Izdevējs',
  `genre` VARCHAR(100) NOT NULL COMMENT 'Žanrs',
  `release_year` INT NOT NULL COMMENT 'Izdošanas gads',
  `platform` VARCHAR(50) NOT NULL DEFAULT 'PC' COMMENT 'Platforma (1NF: viena atomāra vērtība)',
  `short_description` VARCHAR(300) NOT NULL COMMENT 'Īss apraksts',
  `description` TEXT NOT NULL COMMENT 'Pilns apraksts',
  `main_image` VARCHAR(255) NOT NULL DEFAULT '/images/hero.jpg' COMMENT 'Galvenā attēla ceļš vai URL',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. TABULA: Ziņas un raksti (`news`)
-- Satur ziņas un informatīvos rakstus par spēli.
-- Attiecība: 1:N ar `game_info` caur ārējo atslēgu `game_id`.
-- 1NF atbilstība: 'category' satur tieši vienu kategoriju katram ierakstam.
-- =============================================================================
CREATE TABLE `news` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `game_id` INT NOT NULL COMMENT 'Ārējā atslēga uz game_info tabulu',
  `category` VARCHAR(50) NOT NULL COMMENT 'Kategorija (viena vērtība, 1NF)',
  `title` VARCHAR(150) NOT NULL COMMENT 'Raksta virsraksts',
  `description` VARCHAR(300) NOT NULL COMMENT 'Īss apraksts',
  `content` TEXT NOT NULL COMMENT 'Pilns raksta saturs',
  `image` VARCHAR(255) DEFAULT '/images/placeholder.svg' COMMENT 'Attēla lokācija / ceļš',
  `date` DATE NOT NULL COMMENT 'Publicēšanas datums (YYYY-MM-DD)',
  PRIMARY KEY (`id`),
  KEY `idx_news_game_id` (`game_id`),
  CONSTRAINT `fk_news_game` FOREIGN KEY (`game_id`)
    REFERENCES `game_info` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. TABULA: Galerija (`gallery`)
-- Satur ekrānuzņēmumus un vizuālos materiālus par spēli.
-- Attiecība: 1:N ar `game_info` caur ārējo atslēgu `game_id`.
-- Glabā attēla faila ceļu / URL adresi, nevis bināro failu.
-- =============================================================================
CREATE TABLE `gallery` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `game_id` INT NOT NULL COMMENT 'Ārējā atslēga uz game_info tabulu',
  `title` VARCHAR(100) NOT NULL COMMENT 'Attēla nosaukums',
  `description` VARCHAR(500) NOT NULL COMMENT 'Attēla apraksts',
  `image` VARCHAR(255) NOT NULL COMMENT 'Attēla atrašanās vieta (ceļš vai URL)',
  PRIMARY KEY (`id`),
  KEY `idx_gallery_game_id` (`game_id`),
  CONSTRAINT `fk_gallery_game` FOREIGN KEY (`game_id`)
    REFERENCES `game_info` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DATU AIZPILDĪŠANA AR REĀLISTISKIEM DATIEM
-- =============================================================================

-- 1. Informācija par spēli
INSERT INTO `game_info`
  (`id`, `name`, `developer`, `publisher`, `genre`, `release_year`, `platform`, `short_description`, `description`, `main_image`)
VALUES (
  1,
  'Assetto Corsa Competizione',
  'Kunos Simulazioni',
  '505 Games',
  'Racing simulation',
  2019,
  'PC',
  'The official GT World Challenge simulation: real GT3 and GT4 cars, real circuits, serious racing.',
  'Assetto Corsa Competizione (ACC) is a racing simulation focused on GT3 and GT4 racing. It is the official game of the GT World Challenge series and recreates the cars, circuits and race weekends of modern GT competition. Built on Unreal Engine 4, it features advanced physics, dynamic weather and laser-scanned tracks.',
  '/images/hero.jpg'
);

-- 2. Pieci ziņu un rakstu ieraksti (atbilst prasībai: vismaz pieci)
INSERT INTO `news`
  (`game_id`, `category`, `title`, `description`, `content`, `image`, `date`)
VALUES
(1, 'Site news', 'Welcome to the ACC fan site',
 'A quick tour of what you can find on this website.',
 'This website is a fan-made guide to Assetto Corsa Competizione. Browse GT3 and GT4 cars, famous racing circuits, news updates, and in-game gallery moments.',
 '/images/news/welcome.jpg', '2026-10-01'),

(1, 'Guide', 'What is Balance of Performance?',
 'Why different GT3 cars can race closely against each other.',
 'GT3 cars feature varied engine and chassis architectures. Championships apply Balance of Performance (BoP) adjustments to weight and power so driver skill remains decisive.',
 '/images/news/bop.jpg', '2026-10-08'),

(1, 'Guide', 'GT3 vs GT4: what is the difference?',
 'A short comparison to help you pick the right class to start with.',
 'GT3 cars provide high aerodynamic downforce and raw power. GT4 machinery is closer to road-going sports cars, making it the perfect platform to master racecraft.',
 '/images/news/gt3-vs-gt4.jpg', '2026-10-15'),

(1, 'Update', 'Physics and Tyre Model 1.9 Overview',
 'Key updates to tyre contact patches, kerb behavior, and temperature management.',
 'The 1.9 update overhauled tyre deflection and thermal transfer, providing wider working temperature windows and predictable breakaway characteristics over kerbs.',
 '/images/news/welcome.jpg', '2026-10-20'),

(1, 'Esports', 'SRO Esports Championship Season Announced',
 'Registration opens for the official Assetto Corsa Competizione continental esports season.',
 'The official GT World Challenge Esports championship returns with endurance rounds at Monza, Spa, and Silverstone, open to both pro drivers and qualifying community racers.',
 '/images/news/bop.jpg', '2026-10-24');

-- 3. Pieci galerijas ieraksti (atbilst prasībai: vismaz pieci)
INSERT INTO `gallery`
  (`game_id`, `title`, `description`, `image`)
VALUES
(1, 'Golden hour at Monza', 'Evening light over the main straight as the pack approaches the Rettifilo chicane.', '/images/gallery/monza-golden-hour.jpg'),
(1, 'Rain at Spa', 'Spray everywhere as the field heads up Raidillon in treacherous wet conditions.', '/images/gallery/spa-rain.jpg'),
(1, 'Night race', 'Headlights blazing through the darkness on a long 24-hour endurance stint.', '/images/gallery/night-race.jpg'),
(1, 'Side by side', 'Fierce wheel-to-wheel GT3 battle into the first braking zone.', '/images/gallery/side-by-side.jpg'),
(1, 'Sunset over Nürburgring GP', 'Warm evening tones reflecting off the grandstands and the Mercedes-Benz arena.', '/images/circuits/nurburgring-gp.jpg');
