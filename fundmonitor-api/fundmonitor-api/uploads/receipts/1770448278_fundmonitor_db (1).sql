-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 02, 2026 at 12:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
(1, 8, 2026, 1000000.00, 330000.00, '2026-01-31 13:39:29'),
(2, 9, 2026, 1000000.00, 270000.00, '2026-01-31 13:39:29'),
(3, 10, 2026, 1000000.00, 360000.00, '2026-01-31 13:39:29'),
(4, 11, 2026, 1000000.00, 40000.00, '2026-01-31 13:39:29');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Facility Development', 'Infrastructure, buildings, and physical improvements', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(2, 'Faculty & Staff Development', 'Training, workshops, and professional development', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(3, 'Curriculum Development', 'Course materials, educational resources, and program improvements', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(4, 'Student Development', 'Student activities, scholarships, and support services', '2026-02-01 10:29:23', '2026-02-01 10:29:23');

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
(1, 'IT Department', '2026-01-28 04:10:51'),
(2, 'Finance', '2026-01-28 04:10:51'),
(3, 'HR', '2026-01-28 04:10:51'),
(4, 'IT Department', '2026-01-28 05:36:15'),
(5, 'Finance', '2026-01-28 05:36:15'),
(6, 'HR', '2026-01-28 05:36:15'),
(8, 'Facility Development', '2026-01-31 13:39:29'),
(9, 'Faculty and Staff Development', '2026-01-31 13:39:29'),
(10, 'Curriculum Development', '2026-01-31 13:39:29'),
(11, 'Student Development', '2026-01-31 13:39:29');

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
  `name` varchar(255) NOT NULL,
  `allocation_percentage` decimal(5,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `category_id`, `name`, `allocation_percentage`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'Building Maintenance', 15.00, 'Regular maintenance and repairs', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(2, 1, 'Equipment Purchase', 12.00, 'New equipment and machinery', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(3, 1, 'Renovation Projects', 6.00, 'Major renovation and upgrades', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(4, 2, 'Training Workshops', 15.00, 'Staff skill enhancement programs', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(5, 2, 'Certification Programs', 7.00, 'Professional certifications', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(6, 2, 'Conference Attendance', 5.00, 'Industry conferences and seminars', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(7, 3, 'Learning Materials', 20.00, 'Books, software, and educational tools', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(8, 3, 'Program Assessment', 10.00, 'Curriculum evaluation and improvement', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(9, 3, 'Digital Resources', 6.00, 'Online platforms and digital content', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(10, 4, 'Student Activities', 2.00, 'Clubs, events, and extracurriculars', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(11, 4, 'Scholarship Fund', 1.50, 'Financial aid for students', '2026-02-01 10:29:23', '2026-02-01 10:29:23'),
(12, 4, 'Wellness Programs', 0.50, 'Health and counseling services', '2026-02-01 10:29:23', '2026-02-01 10:29:23');

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
(1, 'System Admin', 'admin@test.com', 'admin123', 'admin', NULL, 'active', '2026-01-28 04:24:36'),
(2, 'Finance Head', 'head@test.com', 'head123', 'department_head', 1, 'active', '2026-01-28 04:24:36'),
(3, 'Staff Member', 'staff@test.com', 'staff123', 'staff', 1, 'active', '2026-01-28 04:24:36'),
(4, 'rechie', 'rechie@gmail.com', 'qqqqq1', 'staff', NULL, 'active', '2026-01-28 05:05:46'),
(5, 'haha', 'student@gmail.com', 'password', 'staff', NULL, 'active', '2026-01-28 05:27:38'),
(6, 'Rechie James Postanes', 'chie@gmail.com', 'rechiejames4', 'department_head', NULL, 'active', '2026-02-01 11:05:09');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_categories_with_subcategories`
-- (See below for the actual view)
--
CREATE TABLE `vw_categories_with_subcategories` (
`category_id` int(11)
,`category_name` varchar(255)
,`category_description` text
,`subcategory_count` bigint(21)
,`total_allocation_percentage` decimal(27,2)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_categories_with_subcategories`
--
DROP TABLE IF EXISTS `vw_categories_with_subcategories`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_categories_with_subcategories`  AS SELECT `c`.`id` AS `category_id`, `c`.`name` AS `category_name`, `c`.`description` AS `category_description`, count(`sc`.`id`) AS `subcategory_count`, coalesce(sum(`sc`.`allocation_percentage`),0) AS `total_allocation_percentage` FROM (`categories` `c` left join `sub_categories` `sc` on(`c`.`id` = `sc`.`category_id`)) GROUP BY `c`.`id`, `c`.`name`, `c`.`description` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_dept_year` (`department_id`,`year`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name` (`name`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `main_funds`
--
ALTER TABLE `main_funds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subcategory_per_category` (`category_id`,`name`),
  ADD KEY `fk_category` (`category_id`),
  ADD KEY `idx_subcategory_category` (`category_id`),
  ADD KEY `idx_allocation_percentage` (`allocation_percentage`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `main_funds`
--
ALTER TABLE `main_funds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_categories`
--
ALTER TABLE `sub_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
