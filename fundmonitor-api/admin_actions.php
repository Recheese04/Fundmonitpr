<?php
// 1. SECURITY & CORS HEADERS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. DATABASE CONNECTION
$host = "localhost";
$user = "root";
$pass = "";
$db   = "fundmonitor_db";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database Connection Failed"]);
    exit;
}

$action = $_GET['action'] ?? '';

// --- ACTION: GET ALL USERS ---
if ($action == 'get_users') {
    $result = mysqli_query($conn, "SELECT id, full_name, email, role, status FROM users ORDER BY id DESC");
    $users = [];
    while($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
    echo json_encode($users);
    exit;
}

// --- ACTION: CREATE NEW USER ---
if ($action == 'create_user' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = mysqli_real_escape_string($conn, $data['full_name'] ?? '');
    $email = mysqli_real_escape_string($conn, $data['email'] ?? '');
    $password = mysqli_real_escape_string($conn, $data['password'] ?? '');
    $role = mysqli_real_escape_string($conn, $data['role'] ?? 'staff');

    if(empty($name) || empty($email)) {
        echo json_encode(["success" => false, "message" => "Name and Email are required"]);
        exit;
    }

    $sql = "INSERT INTO users (full_name, email, password, role, status) 
            VALUES ('$name', '$email', '$password', '$role', 'active')";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true, "message" => "User created successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "SQL Error: " . mysqli_error($conn)]);
    }
    exit;
}

// --- ACTION: DELETE USER ---
if ($action == 'delete_user' && $_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = mysqli_real_escape_string($conn, $_GET['id']);
    $sql = "DELETE FROM users WHERE id = '$id'";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
    exit;
}

// --- ACTION: GET DASHBOARD STATS ---
if ($action == 'get_stats') {
    $userCount = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) as total FROM users"))['total'];
    $totalBudget = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(total_budget) as total FROM budgets"))['total'] ?? 0;
    $allocated = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(allocated_budget) as total FROM budgets"))['total'] ?? 0;

    echo json_encode([
        "total_users" => $userCount,
        "total_budget" => number_format($totalBudget, 2),
        "allocated_budget" => number_format($allocated, 2)
    ]);
    exit;
}

mysqli_close($conn);
?>