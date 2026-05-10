<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

// 1. Clear expenses
if (mysqli_query($conn, "TRUNCATE TABLE expenses")) {
    echo "Successfully truncated 'expenses' table.\n";
} else {
    echo "Error truncating expenses: " . mysqli_error($conn) . "\n";
}

// 2. Reset sub_categories remaining_budget to match allocation_amount
if (mysqli_query($conn, "UPDATE sub_categories SET remaining_budget = allocation_amount")) {
    echo "Successfully reset all sub_category remaining_budget to their full allocation.\n";
} else {
    echo "Error resetting sub_categories: " . mysqli_error($conn) . "\n";
}

// 3. Optional: Reset category total_budget (if it's also used for tracking)
// mysqli_query($conn, "UPDATE categories SET total_budget = (SELECT SUM(allocation_amount) FROM sub_categories WHERE category_id = categories.id)");

echo "Cleanup complete.\n";
?>
