<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

echo "Starting Budget Synchronization...\n";

// 1. Identify sub-categories where remaining_budget is 0 but allocation_amount > 0
$query = "SELECT id, name, allocation_amount, remaining_budget FROM sub_categories WHERE remaining_budget = 0 AND allocation_amount > 0";
$result = mysqli_query($conn, $query);

while ($sub = mysqli_fetch_assoc($result)) {
    $sub_id = $sub['id'];
    $alloc = floatval($sub['allocation_amount']);
    
    // Calculate total expenses for this sub-category
    $exp_q = mysqli_query($conn, "SELECT SUM(amount) as total FROM expenses WHERE subcategory_id = $sub_id");
    $exp_row = mysqli_fetch_assoc($exp_q);
    $spent = floatval($exp_row['total'] ?? 0);
    
    $new_remaining = $alloc - $spent;
    
    echo "Updating Sub-category '{$sub['name']}' (ID: $sub_id):\n";
    echo "  - Allocation: $alloc\n";
    echo "  - Spent: $spent\n";
    echo "  - New Remaining: $new_remaining\n";
    
    mysqli_query($conn, "UPDATE sub_categories SET remaining_budget = $new_remaining WHERE id = $sub_id");
}

echo "\nSynchronization Complete.\n";
?>
