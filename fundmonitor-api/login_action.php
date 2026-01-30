<?php
// 1. HEADERS (Crucial for React-to-PHP communication)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 2. Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Database Connection
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database Connection Failed"]);
    exit;
}

// 4. Get Data from React
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['email']) && !empty($data['password'])) {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password'];

    // 5. Query for User
    $query = "SELECT * FROM users WHERE email='$email' LIMIT 1";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        
        // Simple comparison for your test passwords (admin123, head123, staff123)
        if ($password === $user['password']) {
            echo json_encode([
                "success" => true,
                "role" => $user['role'],
                "full_name" => $user['full_name'],
                "user_id" => $user['id']
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Empty credentials"]);
}
?>