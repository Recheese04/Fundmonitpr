<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $conn = mysqli_connect('localhost', 'root', '', 'fundmonitor_db');
    echo "localhost success\n";
} catch (Exception $e) {
    echo "localhost fail: " . $e->getMessage() . "\n";
}
try {
    $conn2 = mysqli_connect('127.0.0.1', 'root', '', 'fundmonitor_db');
    echo "127.0.0.1 success\n";
} catch (Exception $e) {
    echo "127.0.0.1 fail: " . $e->getMessage() . "\n";
}
?>
