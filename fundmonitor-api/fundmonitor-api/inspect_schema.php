<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

echo "=== categories table ===\n";
$result = mysqli_query($conn, "DESCRIBE categories");
while ($row = mysqli_fetch_assoc($result)) {
    echo $row['Field'] . " | " . $row['Type'] . "\n";
}

echo "\n=== subcategories table ===\n";
$result = mysqli_query($conn, "DESCRIBE subcategories");
while ($row = mysqli_fetch_assoc($result)) {
    echo $row['Field'] . " | " . $row['Type'] . "\n";
}
?>
