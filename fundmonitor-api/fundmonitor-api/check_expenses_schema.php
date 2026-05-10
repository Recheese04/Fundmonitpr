<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());
$res = mysqli_query($conn, "DESCRIBE expenses");
while($r = mysqli_fetch_assoc($res)) print_r($r);
?>
