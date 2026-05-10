<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
$res = mysqli_query($conn, "DESCRIBE expenses");
echo "=== expenses ===\n";
while($row = mysqli_fetch_assoc($res)) {
    echo $row['Field'] . " | " . $row['Type'] . "\n";
}
?>
