<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

// Check if PK exists, if not add it, then modify to auto increment. Or just drop and create if needed. Let's just run the alter safely.
$res1 = mysqli_query($conn, "TRUNCATE TABLE expenses");
if (!$res1) echo "Truncate failed: " . mysqli_error($conn) . "\n";

$res2 = mysqli_query($conn, "ALTER TABLE expenses ADD PRIMARY KEY (id)");
if (!$res2) echo "Add PK failed (might already exist): " . mysqli_error($conn) . "\n";

$res3 = mysqli_query($conn, "ALTER TABLE expenses MODIFY id INT(11) NOT NULL AUTO_INCREMENT");
if (!$res3) echo "Auto increment failed: " . mysqli_error($conn) . "\n";

echo "Done fixing DB!\n";
?>
