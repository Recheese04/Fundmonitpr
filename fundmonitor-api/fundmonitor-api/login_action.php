<?php
// START SESSION - CRITICAL!
session_start();

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if this is a logout request
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    // Clear all session variables
    $_SESSION = array();
    
    // Destroy the session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // Destroy the session
    session_destroy();
    
    echo json_encode([
        "success" => true,
        "message" => "Logged out successfully"
    ]);
    exit();
}

// LOGIN LOGIC
// Database Connection
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database Connection Failed"]);
    exit;
}

// Get Data from React
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['email']) && !empty($data['password'])) {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password'];

    // Query for User with Department Name
    $query = "SELECT u.*, d.department_name 
              FROM users u 
              LEFT JOIN departments d ON u.department_id = d.id 
              WHERE u.email='$email' AND u.status='active' LIMIT 1";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        
        // Simple comparison for your test passwords (admin123, head123, staff123)
        if ($password === $user['password']) {
            
            // ✅ SET SESSION VARIABLES
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['department_id'] = $user['department_id']; // ✅ CRITICAL FOR CATEGORY FILTERING
            $_SESSION['department_name'] = $user['department_name']; 
            $_SESSION['logged_in'] = true;
            
            // Return success with all user data
            echo json_encode([
                "success" => true,
                "role" => $user['role'],
                "full_name" => $user['full_name'],
                "user_id" => $user['id'],
                "department_id" => $user['department_id'],
                "department_name" => $user['department_name'],
                "email" => $user['email'],
                "message" => "Login successful"
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found or inactive"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Empty credentials"]);
}

mysqli_close($conn);
?>