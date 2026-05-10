<?php
// Database configuration - Use environment variables for Railway/Production, fallback to Localhost
$host = getenv('MYSQLHOST') ?: "localhost";
$dbname = getenv('MYSQLDATABASE') ?: "fundmonitor_db";
$username = getenv('MYSQLUSER') ?: "root";
$password = getenv('MYSQLPASSWORD') ?: "";
$port = getenv('MYSQLPORT') ?: "3306";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Also create a $conn for procedural mysqli scripts if any
    $conn = mysqli_connect($host, $username, $password, $dbname, $port);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    // Don't die with the message in production to avoid leaking info
    if (getenv('MYSQLHOST')) {
        die("System Maintenance: Database connectivity error.");
    } else {
        die("Connection failed: " . $e->getMessage());
    }
}
?>