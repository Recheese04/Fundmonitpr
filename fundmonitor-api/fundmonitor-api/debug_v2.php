<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

function p($arr) {
    foreach($arr as $k => $v) {
        echo "  $k: $v\n";
    }
    echo "------------------\n";
}

echo "EXPENSES COUNT: ";
$res = mysqli_query($conn, "SELECT COUNT(*) as c FROM expenses");
$row = mysqli_fetch_assoc($res);
echo $row['c'] . "\n\n";

echo "--- RECENT EXPENSES ---\n";
$res = mysqli_query($conn, "SELECT e.id, e.amount, e.status, e.user_id, u.department_id as u_dept, sc.department_id as sc_dept FROM expenses e JOIN users u ON e.user_id = u.id LEFT JOIN sub_categories sc ON e.subcategory_id = sc.id LIMIT 5");
while ($row = mysqli_fetch_assoc($res)) {
    p($row);
}

echo "--- DEPT HEADS (SEARCHING FOR MISMATECH) ---\n";
$expRes = mysqli_query($conn, "SELECT e.user_id, u.full_name as submitter, u.department_id as sub_dept FROM expenses e JOIN users u ON e.user_id = u.id LIMIT 1");
$exp = mysqli_fetch_assoc($expRes);
if ($exp) {
    echo "First Expense Submitter: " . $exp['submitter'] . " (Dept: " . $exp['sub_dept'] . ")\n";
} else {
    echo "No expenses found in DB.\n";
}

$headRes = mysqli_query($conn, "SELECT full_name, role, department_id FROM users WHERE full_name LIKE '%FINANCE HEAD%' OR role = 'department_head'");
while ($head = mysqli_fetch_assoc($headRes)) {
    echo "Head Candidate: " . $head['full_name'] . " (Role: " . $head['role'] . ", Dept: " . $head['department_id'] . ")\n";
}
?>
