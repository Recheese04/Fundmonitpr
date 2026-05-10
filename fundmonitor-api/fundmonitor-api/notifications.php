<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database Connection Failed"]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'get_notifications') {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }

    $sql = "SELECT * FROM notifications WHERE user_id = $user_id ORDER BY created_at DESC LIMIT 50";
    $result = mysqli_query($conn, $sql);
    
    $notifications = [];
    $unread_count = 0;
    
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row;
        if ($row['is_read'] == 0) {
            $unread_count++;
        }
    }

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => $unread_count
    ]);
    exit;
}

if ($action === 'mark_as_read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $notification_id = isset($data['notification_id']) ? intval($data['notification_id']) : 0;
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;

    if ($notification_id > 0) {
        // Mark specific notification
        mysqli_query($conn, "UPDATE notifications SET is_read = 1 WHERE id = $notification_id AND user_id = $user_id");
    } else if ($user_id > 0) {
        // Mark all as read for user
        mysqli_query($conn, "UPDATE notifications SET is_read = 1 WHERE user_id = $user_id");
    }

    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
