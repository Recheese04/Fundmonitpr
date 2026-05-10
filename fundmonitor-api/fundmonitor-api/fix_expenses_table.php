<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

$table = 'expenses';
$column = 'fiscal_year_id';

$check = mysqli_query($conn, "SHOW COLUMNS FROM `$table` LIKE '$column'");
if (mysqli_num_rows($check) == 0) {
    echo "Column '$column' does not exist in '$table'. Adding it now...\n";
    $query = "ALTER TABLE `$table` ADD COLUMN `$column` INT(11) AFTER `receipt_path`";
    if (mysqli_query($conn, $query)) {
        echo "Successfully added '$column' to '$table'.\n";
    } else {
        echo "Error adding column: " . mysqli_error($conn) . "\n";
    }
} else {
    echo "Column '$column' already exists in '$table'.\n";
}

// Also check status column while at it
$checkStatus = mysqli_query($conn, "SHOW COLUMNS FROM `$table` LIKE 'status'");
if (mysqli_num_rows($checkStatus) == 0) {
    echo "Column 'status' does not exist. Adding it...\n";
    mysqli_query($conn, "ALTER TABLE `$table` ADD COLUMN `status` ENUM('pending','approved','rejected') DEFAULT 'pending' AFTER `$column` ");
}

echo "Final Schema for '$table':\n";
$res = mysqli_query($conn, "DESCRIBE `$table`");
while($row = mysqli_fetch_assoc($res)) {
    echo $row['Field'] . " | " . $row['Type'] . "\n";
}
?>
