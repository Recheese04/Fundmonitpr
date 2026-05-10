<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

echo "--- EXPENSES TABLE (DIRECT COUNT) ---\n";
$res = mysqli_query($conn, "SELECT COUNT(*) as c FROM expenses");
$row = mysqli_fetch_assoc($res);
echo "Total rows: " . $row['c'] . "\n\n";

echo "--- EXPENSES TABLE (JOINED) ---\n";
$res = mysqli_query($conn, "SELECT e.*, u.full_name, u.department_id as user_dept FROM expenses e JOIN users u ON e.user_id = u.id");
while ($row = mysqli_fetch_assoc($res)) {
    print_r($row);
}

echo "\n--- ALL USERS ---\n";
$res = mysqli_query($conn, "SELECT id, full_name, role, department_id FROM users");
while ($row = mysqli_fetch_assoc($res)) {
    print_r($row);
}

echo "\n--- DEPARTMENTS & HEADS ---\n";
$res = mysqli_query($conn, "SELECT id, full_name, role, department_id FROM users WHERE role = 'department_head'");
while ($row = mysqli_fetch_assoc($res)) {
    print_r($row);
}

echo "\n--- ALL SUB-CATEGORIES ---\n";
$res = mysqli_query($conn, "SELECT id, name, department_id FROM sub_categories");
while ($row = mysqli_fetch_assoc($res)) {
    print_r($row);
}
?>
