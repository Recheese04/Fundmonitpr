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
            AND u.role = 'staff'
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

// ACTION: get_audit_trail
if ($action == 'get_audit_trail') {
    $dept_id = isset($_GET['department_id']) ? intval($_GET['department_id']) : 0;

    $sql = "SELECT ea.*, 
            u.full_name as actor_name, 
            u.role as actor_role,
            e.description as expense_desc,
            e.amount as expense_amount,
            sc.name as subcategory_name,
            staff.full_name as staff_name
            FROM expense_audits ea
            JOIN users u ON ea.user_id = u.id
            JOIN expenses e ON ea.expense_id = e.id
            JOIN sub_categories sc ON e.subcategory_id = sc.id
            JOIN users staff ON e.user_id = staff.id
            WHERE staff.department_id = ? 
            ORDER BY ea.created_at DESC";
            
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

// ACTION: send_notification
if ($action == 'send_notification') {
    $user_id = $_POST['user_id'] ?? 0;
    $title = $_POST['title'] ?? '';
    $message = $_POST['message'] ?? '';
    $type = $_POST['type'] ?? 'info';
    
    if ($user_id > 0) {
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $user_id, $title, $message, $type);
        $stmt->execute();
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid user ID"]);
    }
}

// ACTION: submit_report (Saves a CSV file and records the submission)
if ($action == 'submit_report') {
    $dept_id = $_POST['department_id'] ?? 0;
    $user_id = $_POST['user_id'] ?? 0;
    $year = $_POST['fiscal_year'] ?? date('Y');
    
    if (isset($_FILES['report_file'])) {
        $uploadDir = 'uploads/submissions/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileName = 'dept_' . $dept_id . '_' . time() . '.csv';
        $filePath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['report_file']['tmp_name'], $filePath)) {
            $stmt = $conn->prepare("INSERT INTO department_submissions (department_id, submitted_by, fiscal_year, file_path) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiss", $dept_id, $user_id, $year, $filePath);
            $stmt->execute();
            
            echo json_encode(["success" => true, "message" => "Report submitted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save file"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "No file uploaded"]);
    }
}

// ACTION: get_submissions (For Admin to see all filed reports)
if ($action == 'get_submissions') {
    $sql = "SELECT ds.*, d.name as department_name, u.full_name as submitter_name 
            FROM department_submissions ds 
            LEFT JOIN departments d ON ds.department_id = d.id 
            LEFT JOIN users u ON ds.submitted_by = u.id 
            ORDER BY ds.created_at DESC";
            
    $result = $conn->query($sql);
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }
    echo json_encode(["success" => true, "data" => $data]);
}
?>