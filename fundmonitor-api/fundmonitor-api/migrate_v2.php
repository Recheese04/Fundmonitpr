<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

// 1. Resolve FY 2026 ID
$fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = 2026 LIMIT 1");
$fy_2026 = mysqli_fetch_assoc($fy_res);
$fy_id = $fy_2026 ? intval($fy_2026['id']) : 1;

echo "Target Fiscal Year ID (2026): $fy_id\n";

// 2. Add columns to categories
$cols_cat = [];
$res_cat = mysqli_query($conn, "SHOW COLUMNS FROM categories");
while ($row = mysqli_fetch_assoc($res_cat)) $cols_cat[] = $row['Field'];

if (!in_array('fiscal_year_id', $cols_cat)) {
    mysqli_query($conn, "ALTER TABLE categories ADD COLUMN fiscal_year_id INT(11) DEFAULT NULL AFTER department_id");
    echo "✅ Added fiscal_year_id to categories\n";
    // Backfill
    mysqli_query($conn, "UPDATE categories SET fiscal_year_id = $fy_id WHERE fiscal_year_id IS NULL");
    echo "✅ Backfilled categories with FY ID $fy_id\n";
} else {
    echo "ℹ️ categories already has fiscal_year_id\n";
}

// 3. Add columns to sub_categories
$cols_sub = [];
$res_sub = mysqli_query($conn, "SHOW COLUMNS FROM sub_categories");
while ($row = mysqli_fetch_assoc($res_sub)) $cols_sub[] = $row['Field'];

if (!in_array('fiscal_year_id', $cols_sub)) {
    mysqli_query($conn, "ALTER TABLE sub_categories ADD COLUMN fiscal_year_id INT(11) DEFAULT NULL AFTER category_id");
    echo "✅ Added fiscal_year_id to sub_categories\n";
    // Backfill
    mysqli_query($conn, "UPDATE sub_categories SET fiscal_year_id = $fy_id WHERE fiscal_year_id IS NULL");
    echo "✅ Backfilled sub_categories with FY ID $fy_id\n";
} else {
    echo "ℹ️ sub_categories already has fiscal_year_id\n";
}

// 4. Update Unique Constraints if needed (optional but good practice)
// We might want to allow same category name in different years
// Currently no unique index on name in categories? Let's check

echo "\nMigration Complete.\n";
?>
