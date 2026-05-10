<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

function decribeTable($conn, $table) {
    echo "=== $table ===\n";
    $result = mysqli_query($conn, "DESCRIBE $table");
    if (!$result) {
        echo "Error: " . mysqli_error($conn) . "\n";
        return;
    }
    while ($row = mysqli_fetch_assoc($result)) {
        echo $row['Field'] . " | " . $row['Type'] . "\n";
    }
}

decribeTable($conn, 'categories');
decribeTable($conn, 'subcategories');
?>
