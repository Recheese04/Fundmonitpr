<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

$res = mysqli_query($conn, "SHOW CREATE TABLE expenses");
$row = mysqli_fetch_assoc($res);
echo "TABLE SCHEMA:\n";
echo $row['Create Table'] . "\n";
?>
