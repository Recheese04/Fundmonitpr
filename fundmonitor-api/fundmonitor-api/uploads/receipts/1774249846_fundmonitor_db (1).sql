-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 17, 2026 at 01:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fundmonitor_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `total_budget` decimal(15,2) DEFAULT 0.00,
  `allocated_budget` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `department_id`, `year`, `total_budget`, `allocated_budget`, `created_at`) VALUES
(1, 5, 2026, 12.00, 3.96, '2026-02-07 08:03:40'),
(2, 6, 2026, 12.00, 3.24, '2026-02-07 08:03:40'),
(3, 7, 2026, 12.00, 4.32, '2026-02-07 08:03:40'),
(4, 8, 2026, 12.00, 0.48, '2026-02-07 08:03:40'),
(0, 1, 2026, 500.00, 500.00, '2026-02-08 12:38:14'),
(0, 2, 2026, 1000000.00, 1000000.00, '2026-02-08 12:38:14'),
(0, 3, 2026, 500.00, 500.00, '2026-02-08 12:38:14'),
(0, 4, 2026, 500.00, 500.00, '2026-02-08 12:38:14');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_budget` decimal(15,2) DEFAULT 0.00,
  `allocation_percentage` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `allocation_amount` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `department_id`, `name`, `description`, `total_budget`, `allocation_percentage`, `created_at`, `updated_at`, `allocation_amount`) VALUES
(1, 1, 'Facility Development', 'Infrastructure, buildings, and physical improvements', 165.00, 33.00, '2026-02-01 10:29:23', '2026-02-10 06:28:20', 165.00),
(2, 1, 'Faculty & Staff Development', 'Training, workshops, and professional development', 135.00, 27.00, '2026-02-01 10:29:23', '2026-02-10 06:28:20', 135.00),
(3, 1, 'Curriculum Development', 'Course materials, educational resources, and program improvements', 180.00, 36.00, '2026-02-01 10:29:23', '2026-02-10 06:28:20', 180.00),
(4, 1, 'Student Development', 'Student activities, scholarships, and support services', 20.00, 4.00, '2026-02-01 10:29:23', '2026-02-10 06:28:20', 20.00),
(5, 2, 'Facility Development', 'Infrastructure, buildings, and physical improvements', 330000.00, 33.00, '2026-02-08 12:26:50', '2026-03-10 01:50:10', 330000.00),
(6, 2, 'Faculty & Staff Development', 'Training, workshops, and professional development', 270000.00, 27.00, '2026-02-08 12:26:50', '2026-03-10 01:50:10', 270000.00),
(7, 2, 'Curriculum Development', 'Course materials, educational resources, and programs', 360000.00, 36.00, '2026-02-08 12:26:50', '2026-03-10 01:50:10', 360000.00),
(8, 2, 'Student Development', 'Student activities, scholarships, and support services', 40000.00, 4.00, '2026-02-08 12:26:50', '2026-03-10 01:50:10', 40000.00),
(9, 3, 'Facility Development', 'Infrastructure, buildings, and physical improvements', 165.00, 33.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 165.00),
(10, 3, 'Faculty & Staff Development', 'Training, workshops, and professional development', 135.00, 27.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 135.00),
(11, 3, 'Curriculum Development', 'Course materials, educational resources, and programs', 180.00, 36.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 180.00),
(12, 3, 'Student Development', 'Student activities, scholarships, and support services', 20.00, 4.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 20.00),
(13, 4, 'Facility Development', 'Infrastructure, buildings, and physical improvements', 165.00, 33.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 165.00),
(14, 4, 'Faculty & Staff Development', 'Training, workshops, and professional development', 135.00, 27.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 135.00),
(15, 4, 'Curriculum Development', 'Course materials, educational resources, and programs', 180.00, 36.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 180.00),
(16, 4, 'Student Development', 'Student activities, scholarships, and support services', 20.00, 4.00, '2026-02-08 12:26:50', '2026-02-10 06:28:21', 20.00);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department_name`, `created_at`) VALUES
(1, 'College of Fisheries and Marine Sciences', '2026-02-07 07:54:42'),
(2, 'College of Teacher Education', '2026-02-07 07:54:42'),
(3, 'College of Business and Management', '2026-02-07 07:54:42'),
(4, 'College of Sciences', '2026-02-07 07:54:42'),
(5, 'Facility Development', '2026-02-07 08:03:40'),
(6, 'Faculty and Staff Development', '2026-02-07 08:03:40'),
(7, 'Curriculum Development', '2026-02-07 08:03:40'),
(8, 'Student Development', '2026-02-07 08:03:40');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subcategory_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `receipt_path` varchar(500) DEFAULT NULL,
  `expense_date` date NOT NULL,
  `status` enum('pending','approved','rejected','review') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `user_id`, `subcategory_id`, `amount`, `description`, `receipt_path`, `expense_date`, `status`, `created_at`) VALUES
(1, 4, 13, 12.00, '21', 'uploads/receipts/1770448278_fundmonitor_db (1).sql', '2026-02-07', 'pending', '2026-02-07 07:11:18'),
(2, 3, 13, 12.00, 'weq', 'uploads/receipts/1770448563_pre-Copy.pdf', '2026-02-07', 'approved', '2026-02-07 07:16:03'),
(3, 8, 13, 23.00, 'hah', 'uploads/receipts/1770451355_pre-Copy.pdf', '2026-02-07', 'pending', '2026-02-07 08:02:35'),
(4, 4, 9, 123.00, 'haha', 'uploads/receipts/1770457176_pre-Copy.pdf', '2026-02-07', 'pending', '2026-02-07 09:39:36'),
(5, 2, 13, 2.00, '2', 'uploads/receipts/1770457603_pre-Copy.pdf', '2026-02-07', 'rejected', '2026-02-07 09:46:43'),
(6, 3, 9, 12312.00, '213', 'uploads/receipts/1770457773_pre-Copy.pdf', '2026-02-07', 'approved', '2026-02-07 09:49:33'),
(7, 3, 13, 23423.00, 'ss', 'uploads/receipts/1770458458_pre-Copy.pdf', '2026-02-07', 'pending', '2026-02-07 10:00:58');

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `main_funds`
--

CREATE TABLE `main_funds` (
  `id` int(11) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `fiscal_year` year(4) NOT NULL,
  `remaining_unallocated` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories`
--

CREATE TABLE `sub_categories` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `allocation_amount` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remaining_budget` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `category_id`, `department_id`, `name`, `allocation_amount`, `description`, `created_at`, `updated_at`, `remaining_budget`) VALUES
(1, 1, 1, 'Building Maintenance', 15.00, 'Regular maintenance and repairs', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 15.00),
(2, 1, 1, 'Equipment Purchase', 12.00, 'New equipment and machinery', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 12.00),
(3, 1, 1, 'Renovation Projects', 6.00, 'Major renovation and upgrades', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 6.00),
(4, 2, 1, 'Training Workshops', 15.00, 'Staff skill enhancement programs', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 15.00),
(5, 2, 1, 'Certification Programs', 7.00, 'Professional certifications', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 7.00),
(6, 2, 1, 'Conference Attendance', 5.00, 'Industry conferences and seminars', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 5.00),
(7, 3, 1, 'Learning Materials', 0.00, 'Books, software, and educational tools', '2026-02-01 10:29:23', '2026-02-08 12:41:51', 0.00),
(8, 3, 1, 'Program Assessment', 0.00, 'Curriculum evaluation and improvement', '2026-02-01 10:29:23', '2026-02-08 12:41:55', 0.00),
(9, 3, 1, 'Digital Resources', 0.00, 'Online platforms and digital content', '2026-02-01 10:29:23', '2026-02-08 12:41:48', 0.00),
(10, 4, 1, 'Student Activities', 2.00, 'Clubs, events, and extracurriculars', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 2.00),
(11, 4, 1, 'Scholarship Fund', 1.50, 'Financial aid for students', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 1.50),
(12, 4, 1, 'Wellness Programs', 0.50, 'Health and counseling services', '2026-02-01 10:29:23', '2026-02-08 10:59:25', 0.50),
(13, 3, 1, '3242', 0.00, '2', '2026-02-04 12:28:46', '2026-02-08 12:41:39', 0.00),
(29, 5, 2, 'Building Maintenance', 50000000.00, 'Regular maintenance and repairs', '2026-02-08 12:26:50', '2026-03-10 01:53:01', 50000000.00),
(30, 5, 2, 'Equipment Purchase', 12.00, 'New equipment and machinery', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 12.00),
(31, 5, 2, 'Renovation Projects', 6.00, 'Major renovation and upgrades', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 6.00),
(32, 6, 2, 'Training Workshops', 15.00, 'Staff skill enhancement programs', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 15.00),
(33, 6, 2, 'Certification Programs', 7.00, 'Professional certifications', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 7.00),
(34, 6, 2, 'Conference Attendance', 899999999.00, 'Industry conferences and seminars', '2026-02-08 12:26:50', '2026-03-10 01:53:44', 899999999.00),
(35, 7, 2, 'Learning Materials', 12.00, 'Books, software, and educational tools', '2026-02-08 12:26:50', '2026-03-10 00:56:49', 12.00),
(36, 7, 2, 'Program Assessment', 10.00, 'Curriculum evaluation and improvement', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 10.00),
(37, 7, 2, 'Digital Resources', 0.00, 'Online platforms and digital content', '2026-02-08 12:26:50', '2026-02-10 06:41:59', 0.00),
(38, 8, 2, 'Student Activities', 2.00, 'Clubs, events, and extracurriculars', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 2.00),
(39, 8, 2, 'Scholarship Fund', 1.50, 'Financial aid for students', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 1.50),
(40, 8, 2, 'Wellness Programs', 0.50, 'Health and counseling services', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 0.50),
(41, 9, 3, 'Building Maintenance', 15.00, 'Regular maintenance and repairs', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 15.00),
(42, 9, 3, 'Equipment Purchase', 12.00, 'New equipment and machinery', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 12.00),
(43, 9, 3, 'Renovation Projects', 6.00, 'Major renovation and upgrades', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 6.00),
(44, 10, 3, 'Training Workshops', 15.00, 'Staff skill enhancement programs', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 15.00),
(45, 10, 3, 'Certification Programs', 7.00, 'Professional certifications', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 7.00),
(46, 10, 3, 'Conference Attendance', 5.00, 'Industry conferences and seminars', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 5.00),
(47, 11, 3, 'Learning Materials', 999.99, 'Books, software, and educational tools', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 999.99),
(48, 11, 3, 'Program Assessment', 10.00, 'Curriculum evaluation and improvement', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 10.00),
(49, 11, 3, 'Digital Resources', 12330.00, 'Online platforms and digital content', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 11097.00),
(50, 12, 3, 'Student Activities', 2.00, 'Clubs, events, and extracurriculars', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 2.00),
(51, 12, 3, 'Scholarship Fund', 1.50, 'Financial aid for students', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 1.50),
(52, 12, 3, 'Wellness Programs', 0.50, 'Health and counseling services', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 0.50),
(53, 13, 4, 'Building Maintenance', 15.00, 'Regular maintenance and repairs', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 15.00),
(54, 13, 4, 'Equipment Purchase', 12.00, 'New equipment and machinery', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 12.00),
(55, 13, 4, 'Renovation Projects', 6.00, 'Major renovation and upgrades', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 6.00),
(56, 14, 4, 'Training Workshops', 15.00, 'Staff skill enhancement programs', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 15.00),
(57, 14, 4, 'Certification Programs', 7.00, 'Professional certifications', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 7.00),
(58, 14, 4, 'Conference Attendance', 5.00, 'Industry conferences and seminars', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 5.00),
(59, 15, 4, 'Learning Materials', 999.99, 'Books, software, and educational tools', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 999.99),
(60, 15, 4, 'Program Assessment', 10.00, 'Curriculum evaluation and improvement', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 10.00),
(61, 15, 4, 'Digital Resources', 12330.00, 'Online platforms and digital content', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 11097.00),
(62, 16, 4, 'Student Activities', 2.00, 'Clubs, events, and extracurriculars', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 2.00),
(63, 16, 4, 'Scholarship Fund', 1.50, 'Financial aid for students', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 1.50),
(64, 16, 4, 'Wellness Programs', 0.50, 'Health and counseling services', '2026-02-08 12:26:50', '2026-02-08 12:26:50', 0.50);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','department_head','staff') NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `department_id`, `status`, `created_at`) VALUES
(1, 'System Admin', 'admin@test.com', 'admin123', 'admin', 2, 'active', '2026-01-28 04:24:36'),
(2, 'Finance Head', 'head@test.com', 'head123', 'department_head', 2, 'active', '2026-01-28 04:24:36'),
(3, 'Juan Dela Cruz', 'staff@test.com', 'staff123', 'staff', 1, 'active', '2026-01-28 04:24:36'),
(4, 'rechie', 'rechie@gmail.com', 'qqqqq1', 'staff', 2, 'active', '2026-01-28 05:05:46'),
(5, 'haha', 'student@gmail.com', 'password', 'department_head', 1, 'active', '2026-01-28 05:27:38'),
(6, 'Rechie James Postanes', 'chie@gmail.com', 'rechiejames4', 'department_head', 3, 'active', '2026-02-01 11:05:09'),
(8, 'mihger', '123@gmail.com', 'student123', 'staff', 3, 'active', '2026-02-07 07:35:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sub_categories`
--
ALTER TABLE `sub_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
