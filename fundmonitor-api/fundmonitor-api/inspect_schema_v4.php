<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

function describeTable($conn, $table) {
    echo "=== $table ===\n";
    $result = mysqli_query($conn, "DESCRIBE $table");
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            echo $row['Field'] . " | " . $row['Type'] . "\n";
        }
    } else {
        echo "Table $table error: " . mysqli_error($conn) . "\n";
    }
}

describeTable($conn, 'categories');
describeTable($conn, 'sub_categories');
describeTable($conn, 'expenses');
describeTable($conn, 'budgets');
describeTable($conn, 'departments');
describeTable($conn, 'fiscal_years');
?>
