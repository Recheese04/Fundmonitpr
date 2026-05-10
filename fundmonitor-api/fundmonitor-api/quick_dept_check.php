<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

$exp = mysqli_fetch_assoc(mysqli_query($conn, "SELECT u.department_id, u.full_name FROM expenses e JOIN users u ON e.user_id = u.id LIMIT 1"));
$head = mysqli_fetch_assoc(mysqli_query($conn, "SELECT department_id, full_name FROM users WHERE full_name LIKE '%FINANCE HEAD%' LIMIT 1"));

echo "EXPENSE_SUBMITTER_NAME: " . ($exp['full_name'] ?? 'NONE') . "\n";
echo "EXPENSE_SUBMITTER_DEPT: " . ($exp['department_id'] ?? 'NONE') . "\n";
echo "HEAD_NAME: " . ($head['full_name'] ?? 'NONE') . "\n";
echo "HEAD_DEPT: " . ($head['department_id'] ?? 'NONE') . "\n";
?>
