-- MySQL dump 10.13  Distrib 9.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: mosque_dashboard
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4e47db44-6894-11f1-aeae-9c2dcd2b73ed:1-285';

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` timestamp NULL DEFAULT NULL,
  `refresh_token_expires_at` timestamp NULL DEFAULT NULL,
  `scope` text,
  `password` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `account_user_id_user_id_fk` (`user_id`),
  CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('3LBCFYJQCo5hjWTdiXI252ui0ywYSwKM','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','credential','tkokLwcuJj0osYrhahIaWh7rfysrwdHO',NULL,NULL,NULL,NULL,NULL,NULL,'e37f9c46aa4f623908d8d1974414ac97:fdb6249c81bb1e8de389bc4cd724c4474d7c315a70eed838473d1f98b6bc0f70fb48105a5f528f7cb9f796bbac334008066eefbdcdcfb3f935760686c584b8f6','2026-07-17 02:08:57','2026-07-17 02:08:57'),('7J9NtkTitVZRNfacEE7zvJnIR5YZbGIf','cmDWjsNRDXozBNELXirAZNWOpxdqi6AA','credential','cmDWjsNRDXozBNELXirAZNWOpxdqi6AA',NULL,NULL,NULL,NULL,NULL,NULL,'af8e776752171f91ac7c79de609fee17:b35b4165d69270b2237a269a638883932090278bf04121c9e8970dfdec2ca48e9b35af521b823ad57d57af355cfb72ba7d0bbf30632f930ca421fb46852edb86','2026-07-17 03:04:29','2026-07-17 03:04:29'),('RibOiD26ZwETfcyMobv1Fn6I4XmO7V7E','wqLUDdO3kOgr1kCaIefU2Mw563wY5iY0','credential','wqLUDdO3kOgr1kCaIefU2Mw563wY5iY0',NULL,NULL,NULL,NULL,NULL,NULL,'a1d442a02772709b6852c0e45f1bb3ac:1cd4b202b403ddbca6dc691301b93c5ddf64a17606501a3be77a1a5768535b1e61ae7abb41978c6744bf6daf8cd96c89efa29002f27446c2ca6f20e495fdaa47','2026-07-17 02:12:08','2026-07-17 02:12:08');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventaris`
--

DROP TABLE IF EXISTS `inventaris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventaris` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `date` date NOT NULL,
  `location` varchar(100) NOT NULL,
  `condition` text NOT NULL DEFAULT (_utf8mb4'Baik'),
  `notes` text,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `inventaris_created_by_user_id_fk` (`created_by`),
  CONSTRAINT `inventaris_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventaris`
--

LOCK TABLES `inventaris` WRITE;
/*!40000 ALTER TABLE `inventaris` DISABLE KEYS */;
INSERT INTO `inventaris` VALUES ('12ddd44f-d4c0-41c0-9342-4cc87916abd9','Mimbar Kayu Jati',1,'2020-05-12','Ruang Utama','Baik','Wakaf dari keluarga H. Soleh',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('384aedf8-2b5e-434a-9a62-e6a490b4f339','Kursi Lipat Jamaah',20,'2024-08-05','Gudang','Rusak Berat','Sebagian patah, perlu diganti baru',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('54387aa7-7acd-4273-b38e-20ed73af08a6','Kipas Angin gantung',2,'2026-06-25','Ruang Utama','Rusak Ringan','Mati total',NULL,'2026-06-25 09:07:36','2026-06-25 09:07:36'),('5f4d3eb2-84a3-4685-9203-eaaa51c174ac','Sound System (Speaker)',4,'2023-11-20','Gudang','Rusak Ringan','Satu speaker sember, butuh servis',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('818ee861-82c9-460a-823a-35a6273c72f1','Karpet Sajadah Utama',50,'2025-01-10','Ruang Utama','Baik','Roll panjang, warna hijau',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('9b7c6192-5b18-4883-85da-10f682ce26be','AC Daikin 2PK',6,'2025-03-15','Ruang Utama','Baik','Service berkala 3 bulan sekali',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('a8a8489d-bfcb-4d73-9aff-33849e7781ec','AC',1,'2026-06-25','Ruang Utama','Rusak Berat','Mati total',NULL,'2026-06-25 09:08:18','2026-06-25 09:08:18'),('fee331e9-d659-4045-9f69-a2fcba097cd0','Kipas Angin',10,'2026-06-25','Ruang Utama','Baik','Kipas angin dinding',NULL,'2026-06-25 09:06:18','2026-06-25 09:06:18');
/*!40000 ALTER TABLE `inventaris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jemaah`
--

DROP TABLE IF EXISTS `jemaah`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jemaah` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'Umum',
  `skills` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jemaah_created_by_user_id_fk` (`created_by`),
  KEY `name_idx` (`name`),
  KEY `category_idx` (`category`),
  CONSTRAINT `jemaah_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jemaah`
--

LOCK TABLES `jemaah` WRITE;
/*!40000 ALTER TABLE `jemaah` DISABLE KEYS */;
INSERT INTO `jemaah` VALUES ('1c3775a8-cf23-4a8d-be6e-e2b1edb2df49','Bapak H. Ahmad','Jl. Merdeka No. 12','081234567890','Muzakki','Pengusaha, Manajemen','Donatur tetap yatim piatu',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL),('1c5e285a-1c69-4943-a33f-b328ea3391d1','Hj. Fatimah','Jl. Kenanga Indah No. 3','082112345678','Lansia',NULL,'Perlu transportasi antar-jemput kajian',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL),('7e4f9121-b578-481c-9989-7c7cd3a08674','Ibu Siti Aminah','Jl. Mawar Raya Blok C2','085612345678','Mustahik','Memasak','Penerima bantuan sembako rutin',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL),('ee6bed96-20af-440c-a938-d401cf1d9aa4','Budi Santoso','Perumahan Indah Asri No. 45','087812345678','Umum','Desain Grafis, IT','Sering membantu publikasi masjid',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL),('feef37ef-0763-46c9-88c9-5441308a12a4','Rudi Hermawan','Gg. Swadaya RT 03/04','089612345678','Yatim','Pramuka, Olahraga','Peserta TPA, usia 12 tahun',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL);
/*!40000 ALTER TABLE `jemaah` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES ('34d4e6aa-c28d-4ac5-8358-2456a4bb8ceb','Keuangan','Transaksi Pemasukan Baru','Rp 500.000 - Jumat berkah',1,'2026-07-04 10:35:15');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `pic` varchar(255) NOT NULL,
  `budget` decimal(15,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Direncanakan',
  `date` date NOT NULL,
  `description` text NOT NULL,
  `evaluation` text,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `report_doc_url` text,
  `documentation_urls` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `programs_created_by_user_id_fk` (`created_by`),
  KEY `status_idx` (`status`),
  KEY `date_idx` (`date`),
  CONSTRAINT `programs_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES ('05f2b550-3583-467f-ae72-96f8b6dc1422','Pengajian','Ilham',200000.00,'Direncanakan','2026-07-18','-','','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 10:37:49','2026-07-17 10:37:49',NULL,NULL),('174e921f-09d8-4c9c-b622-bdc1238c57bd','Santunan Yatim Rutin','Bpk. Budi Santoso',5000000.00,'Sedang Berjalan','2026-06-20','Pembagian sembako dan uang tunai untuk 50 anak yatim di sekitar masjid.',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL,NULL),('3ea953c5-6fa2-410a-9999-fa59961f39b0','Kajian rutin mingguan','Ilham',100000.00,'Direncanakan','2026-07-11','Kajian rutin setiap sabtu subuh','',NULL,'2026-07-04 10:31:20','2026-07-04 10:31:20',NULL,NULL),('671ca8f7-0a7e-4cd8-ad5d-b526331e6d78','Kajian Akbar Akhir Tahun','Ust. Ahmad Zain',5000000.00,'Direncanakan','2026-12-25','Kajian akbar mengundang penceramah nasional. Target jemaah 1000 orang.',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL,NULL),('b7add0fc-f474-4571-a7f1-97a01414502e','Renovasi Tempat Wudu','Hj. Siti',15000000.00,'Sedang Berjalan','2026-06-15','Perbaikan keramik dan saluran air tempat wudu pria dan wanita.',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL,NULL),('cd94abdd-fb9b-46f1-ae51-97af6380e3e9','Peringatan Maulid Nabi','Ust. Hasan',8000000.00,'Selesai','2026-02-15','Acara peringatan maulid nabi dengan lomba tilawah tingkat anak.','Acara berjalan lancar, kehadiran jemaah melebih target (500 orang).',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL,NULL),('cf913f13-950b-4185-ab94-a202af5217b1','Pelatihan memandikan jenazah','Aril',300000.00,'Direncanakan','2026-07-06','Pelatihan memandikan jenazah','',NULL,'2026-07-06 09:09:16','2026-07-06 09:09:16',NULL,NULL),('e1133bb3-994c-4300-a35f-0fa18685837a','Pembersihan Area Masjid','Dodi',100000.00,'Selesai','2026-06-25','-','',NULL,'2026-06-25 08:38:20','2026-07-04 01:11:34',NULL,NULL),('f80a94da-9727-403d-8694-c475c782e7e0','STIPLE FUN Ramadhan (Kolab STIPLE)','Reffy',5000000.00,'Sedang Berjalan','2026-07-04','Kegiatan ini merupakan kegiatan yang di inisiasi oleh STIPLE ','',NULL,'2026-07-04 09:31:58','2026-07-04 01:32:05',NULL,NULL),('f8e53e4e-9646-478b-ad2d-83d634004984','TPA Sore Harian','Ust. Umar',2000000.00,'Sedang Berjalan','2026-01-01','Kegiatan belajar mengaji untuk anak-anak setiap sore hari.',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02',NULL,NULL);
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `token` varchar(255) NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token_unique` (`token`),
  KEY `session_user_id_user_id_fk` (`user_id`),
  CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES ('2gpn2XZqEgspzDYN7IiDGClPYvAy6ehK','2026-07-17 03:33:01','ijjXW8wMlTgmR6BkPzOYEWhScO77y9YL','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 03:03:01','2026-07-17 03:03:01'),('6gwy65QtVVdxky4qlzOAbyRvA2GOHN9S','2026-07-21 01:23:52','5yIXVxvgMgI7xnLE2z7BxUnFAWdYSNYL','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-21 00:53:52','2026-07-21 00:53:52'),('AR4OlZTNLm0cLYtm2wnXlfVsOHtbcdN8','2026-07-21 00:46:05','gAnfy0N9b8geW4upQ43Ovq9FD2SvGfMA','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-21 00:16:05','2026-07-21 00:16:05'),('aZ9NPxQz9rbb71CH8POFIoa9c5B9Usaz','2026-07-17 02:42:08','FeUkFB3izBTymMDANcx0H7wT6UlypVKY','','','wqLUDdO3kOgr1kCaIefU2Mw563wY5iY0','2026-07-17 02:12:08','2026-07-17 02:12:08'),('c08O6IQ4vRlx9FMNQmC8Inx34UPoQynw','2026-07-17 03:37:52','jruwsZw20YL0bqqUvul4BtM0eSsBg18v','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 03:07:52','2026-07-17 03:07:52'),('cAnKAn4SzOYy3aesiTMeWWUSdy3EX05x','2026-07-17 03:34:29','J8xkGt9r3nJg0K8AnCUyRXXsXds6wl58','','','cmDWjsNRDXozBNELXirAZNWOpxdqi6AA','2026-07-17 03:04:29','2026-07-17 03:04:29'),('HMbz3VCuiseFt2Szj8lWzrSNFqHICgLU','2026-07-17 02:41:01','hSCnwPXMTbvTMXjtF1gV7S52kPlHltO1','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 02:11:01','2026-07-17 02:11:01'),('hQSjW7sIap6HmwdKsoA4IQIasDltaQgx','2026-07-17 03:37:52','Cpygytkq0SMRLIaNmjSciKq4nK0UvwfB','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 03:07:52','2026-07-17 03:07:52'),('IgM0ZT9If7wlz1tWbfxLlw5srOO48WnI','2026-07-17 03:36:40','dSGj92nfU2w2ev9wlSM129hn84fOn4Zl','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','cmDWjsNRDXozBNELXirAZNWOpxdqi6AA','2026-07-17 03:06:40','2026-07-17 03:06:40'),('KMhJRa8compoYFdb69c5DDTTrdbbWNtg','2026-07-17 03:32:56','I88QQmPqWss4RxLOYB14p8vVLP7GIzwn','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 03:02:56','2026-07-17 03:02:56'),('PTAbeHS0SUNqikTjXvct3vYMk3mJh1vd','2026-07-17 03:42:41','lFHnqcoCZ5JyJeUkUPBYnfu52GfzN3lK','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','wqLUDdO3kOgr1kCaIefU2Mw563wY5iY0','2026-07-17 03:12:41','2026-07-17 03:12:41'),('Q9pZtNr6n0mkCyzNMFcwk4WxHOR2mcnJ','2026-07-17 02:38:57','PwXvAmUvCJZ1ZicB3yLjU1V8Cv6X4XtU','','','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 02:08:57','2026-07-17 02:08:57'),('vdpChKbINAFesCQ3SG1iWmBFdzHqIOus','2026-07-21 01:23:58','TubVSBQzJppXa9sBeWLMx0iGp57Vi7QI','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-21 00:53:58','2026-07-21 00:53:58'),('VdWmFz6UyR46VDup03kNHQVPfrwVjnpr','2026-07-17 02:58:59','9qGTQlww63fDunUuBz8XK4G8VbCH7KCF','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 02:28:59','2026-07-17 02:28:59'),('WtDniBnr8RqfwBfn8QJgWtmInGsfxgq0','2026-07-17 02:41:17','EEu3THVmWbcQTuC2VU62D58jPfyQnKG2','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','tkokLwcuJj0osYrhahIaWh7rfysrwdHO','2026-07-17 02:11:17','2026-07-17 02:11:17');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `transactions_program_id_programs_id_fk` (`program_id`),
  KEY `transactions_created_by_user_id_fk` (`created_by`),
  KEY `date_idx` (`date`),
  KEY `type_idx` (`type`),
  KEY `category_idx` (`category`),
  CONSTRAINT `transactions_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES ('03f5cf5a-6817-4d90-86da-ec7f741fbe25','2026-06-12','Pemasukan','Infaq',4500000.00,'Infaq Kotak Amal Jumat (12 Juni)',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('0e2b33ea-695d-4fe0-82b6-eb01fd0cc580','2026-05-15','Pemasukan','Zakat',15000000.00,'Zakat Maal Bapak H. Ahmad',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('13e0342c-87ea-40bf-84c8-d7c8896f371a','2026-06-24','Pemasukan','Donasi Khusus',1000000.00,'Sumbangan HJ. Indra',NULL,NULL,'2026-06-24 09:13:55','2026-06-24 09:13:55'),('2b4d9cf7-c659-4878-a739-d6a33eac72c3','2026-07-04','Pemasukan','Donasi Khusus',500000.00,'Sumbangan Bpk. Herdiansyah untuk Jumat berkah',NULL,NULL,'2026-07-04 10:35:14','2026-07-04 02:41:16'),('36935dab-4b5d-430a-af0f-8c985c983cb0','2026-06-05','Pemasukan','Wakaf',10000000.00,'Wakaf Tunai dari Hamba Allah',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('587d49d0-1568-48b9-b519-2efdeb5206c3','2026-05-28','Pemasukan','Infaq',3800000.00,'Infaq Kotak Amal Jumat (28 Mei)',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('84fe3808-e5d8-4374-8260-72a4016e33a4','2026-06-02','Pengeluaran','Operasional',800000.00,'Insentif Petugas Kebersihan',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('8e35194b-48a2-41f1-9773-bf261664b921','2026-05-20','Pengeluaran','Sosial',5000000.00,'Santunan Anak Yatim Rutin','174e921f-09d8-4c9c-b622-bdc1238c57bd',NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('b0f87487-544d-4a4b-a65f-f64d7d29fe08','2026-06-25','Pemasukan','Infaq',2000000.00,'Sumbangan HJ. Devan',NULL,NULL,'2026-06-25 07:28:57','2026-06-25 07:28:57'),('b9db8314-ae71-440a-8dc7-30b663d239d4','2026-06-08','Pengeluaran','Operasional',1200000.00,'Pembayaran Tagihan Listrik Mei',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('d9c3468c-1468-4e01-95e0-383962eade59','2026-06-10','Pengeluaran','Pembangunan',8000000.00,'Pembelian Sound System Baru',NULL,NULL,'2026-07-21 08:51:02','2026-07-21 08:51:02'),('f2a26260-f8b5-469e-aedf-b85e14d23d10','2026-06-25','Pengeluaran','Operasional',250000.00,'Biaya Listrik',NULL,NULL,'2026-06-25 08:51:15','2026-06-25 08:51:15');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `name` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `image` text,
  `role` text NOT NULL DEFAULT (_utf8mb4'Ketua'),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('cmDWjsNRDXozBNELXirAZNWOpxdqi6AA','Refy','fadelmuhammad405@gmail.com',0,NULL,'Bendahara','2026-07-17 03:04:29','2026-07-17 03:04:29'),('tkokLwcuJj0osYrhahIaWh7rfysrwdHO','Miftah Anzir','mugiwara410@gmail.com',0,NULL,'Ketua','2026-07-17 02:08:57','2026-07-17 02:08:57'),('wqLUDdO3kOgr1kCaIefU2Mw563wY5iY0','Dodi Trisetyo','andzir405@gmail.com',0,NULL,'Sekretaris','2026-07-17 02:12:08','2026-07-17 02:12:08');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification`
--

DROP TABLE IF EXISTS `verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification` (
  `id` varchar(255) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification`
--

LOCK TABLES `verification` WRITE;
/*!40000 ALTER TABLE `verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-21 17:05:53
