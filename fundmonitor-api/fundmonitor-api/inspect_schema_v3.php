<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

echo "=== Tables ===\n";
$result = mysqli_query($conn, "SHOW TABLES");
while ($row = mysqli_fetch_row($result)) {
    echo $row[0] . "\n";
}

$tables = ['categories', 'sub_categories', 'expenses', 'budgets'];
foreach ($tables as $table) {
    echo "\n=== $table columns ===\n";
    $result = mysqli_query($conn, "DESCRIBE $table");
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            echo $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    } else {
        echo "Table $table not found or error: " . mysqli_error($conn) . "\n";
    }
}
?>
