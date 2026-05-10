<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

echo "--- ALL EXPENSES ---\n";
$res = mysqli_query($conn, "SELECT * FROM expenses");
while($row = mysqli_fetch_assoc($res)) print_r($row);

echo "\n--- ALL USERS ---\n";
$res = mysqli_query($conn, "SELECT id, full_name, role, department_id FROM users");
while($row = mysqli_fetch_assoc($res)) print_r($row);
?>
