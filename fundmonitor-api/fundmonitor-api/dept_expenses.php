<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");

$action = $_GET['action'] ?? '';

// ACTION: get_reports (Includes receipt_path for viewing files AND user role)
if ($action == 'get_reports') {
    $dept_id = isset($_GET['department_id']) ? intval($_GET['department_id']) : 0;

    $sql = "SELECT e.*, 
            u.full_name as staff_name, 
            u.role as staff_role,
            sc.name as subcategory_name 
            FROM expenses e 
            JOIN users u ON e.user_id = u.id 
            LEFT JOIN sub_categories sc ON e.subcategory_id = sc.id
            WHERE u.department_id = ? 
            ORDER BY e.expense_date DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $dept_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(["success" => true, "data" => $data]);
}

// ACTION: update_status (Method for accepting or rejecting)
if ($action == 'update_status') {
    $id = $_POST['id'] ?? 0;
    $status = $_POST['status'] ?? 'pending';
    $rejection_reason = $_POST['rejection_reason'] ?? null;
    $user_id = $_POST['user_id'] ?? 0;
    
    // Updates status based on Head's action
    $stmt = $conn->prepare("UPDATE expenses SET status = ?, rejection_reason = ? WHERE id = ?");
    $stmt->bind_param("ssi", $status, $rejection_reason, $id);
    
    if ($stmt->execute()) {
        // Record audit trail if user_id is provided
        if ($user_id > 0) {
            $actionStr = ($status === 'rejected') ? 'rejected' : 'status_updated';
            $auditStmt = $conn->prepare("INSERT INTO expense_audits (expense_id, user_id, action, comments) VALUES (?, ?, ?, ?)");
            $auditStmt->bind_param("iiss", $id, $user_id, $actionStr, $rejection_reason);
            $auditStmt->execute();
        }
        
        // Notify Staff
        $expRes = $conn->query("SELECT user_id, amount FROM expenses WHERE id = $id");
        if ($expRow = $expRes->fetch_assoc()) {
            $staff_id = intval($expRow['user_id']);
            $amount = floatval($expRow['amount']);
            $title = "Expense " . ucfirst($status);
            $message = "Your expense request for PHP " . number_format($amount, 2) . " has been $status.";
            if ($status === 'rejected' && $rejection_reason) {
                $message .= " Reason: " . $rejection_reason;
            }
            $type = "expense_$status";
            $conn->query("INSERT INTO notifications (user_id, title, message, type) VALUES ($staff_id, '$title', '" . $conn->real_escape_string($message) . "', '$type')");
        }
        
        echo json_encode(["success" => true, "message" => "Record " . $status]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}
?>