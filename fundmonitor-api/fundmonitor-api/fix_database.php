<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

// Empty expenses
mysqli_query($conn, "TRUNCATE TABLE expenses");

// Fix ID to be auto increment and primary key if not already
mysqli_query($conn, "ALTER TABLE expenses MODIFY id INT(11) NOT NULL AUTO_INCREMENT");

echo "Database cleaned and expenses.id auto-increment fixed!\n";
?>
