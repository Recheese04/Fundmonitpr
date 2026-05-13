<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);

require_once 'config/db.php';

$action = $_GET['action'] ?? '';

// ── Edit a pending expense ─────────────────────────────────────────────────
if ($action == 'update_pending') {
    try {
        $data       = json_decode(file_get_contents('php://input'), true);
        $expense_id = intval($data['expense_id'] ?? 0);
        $user_id    = intval($data['user_id'] ?? 0);
        $amount     = floatval($data['amount'] ?? 0);
        $desc       = mysqli_real_escape_string($conn, $data['description'] ?? '');
        $date       = $data['date'] ?? date('Y-m-d');

        if ($expense_id <= 0) throw new Exception("Invalid expense ID.");
        if ($amount <= 0)     throw new Exception("Amount must be greater than 0.");
        if (empty($desc))     throw new Exception("Description is required.");

        // Only pending expenses can be edited
        $check = mysqli_query($conn, "SELECT status, subcategory_id FROM expenses WHERE id = $expense_id AND user_id = $user_id");
        $row   = mysqli_fetch_assoc($check);
        if (!$row)                        throw new Exception("Expense not found.");
        if ($row['status'] !== 'pending') throw new Exception("Only pending expenses can be edited.");

        // Validate amount against remaining budget
        $sub_id = intval($row['subcategory_id']);
        $subRes = mysqli_query($conn, "SELECT remaining_budget FROM sub_categories WHERE id = $sub_id");
        $subRow = mysqli_fetch_assoc($subRes);
        $remaining = floatval($subRow['remaining_budget'] ?? 0);
        if ($amount > $remaining) {
            throw new Exception("Amount exceeds remaining budget. Available: PHP " . number_format($remaining, 2));
        }

        mysqli_query($conn, "UPDATE expenses SET amount = $amount, description = '$desc', expense_date = '$date' WHERE id = $expense_id");

        // Audit trail
        $auditStmt = $conn->prepare("INSERT INTO expense_audits (expense_id, user_id, action, comments) VALUES (?, ?, 'edited', 'Staff edited pending request')");
        if ($auditStmt) { $auditStmt->bind_param("ii", $expense_id, $user_id); $auditStmt->execute(); }

        echo json_encode(["success" => true, "message" => "Expense updated successfully."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

// ── Cancel a pending expense ───────────────────────────────────────────────
elseif ($action == 'cancel_pending') {
    try {
        $data       = json_decode(file_get_contents('php://input'), true);
        $expense_id = intval($data['expense_id'] ?? 0);
        $user_id    = intval($data['user_id'] ?? 0);

        if ($expense_id <= 0) throw new Exception("Invalid expense ID.");

        $check = mysqli_query($conn, "SELECT status FROM expenses WHERE id = $expense_id AND user_id = $user_id");
        $row   = mysqli_fetch_assoc($check);
        if (!$row)                        throw new Exception("Expense not found.");
        if ($row['status'] !== 'pending') throw new Exception("Only pending expenses can be cancelled.");

        mysqli_query($conn, "UPDATE expenses SET status = 'cancelled' WHERE id = $expense_id");

        $auditStmt = $conn->prepare("INSERT INTO expense_audits (expense_id, user_id, action, comments) VALUES (?, ?, 'cancelled', 'Staff cancelled pending request')");
        if ($auditStmt) { $auditStmt->bind_param("ii", $expense_id, $user_id); $auditStmt->execute(); }

        echo json_encode(["success" => true, "message" => "Expense cancelled."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

if ($action == 'create') {
    try {
        $user_id = $_POST['user_id'] ?? null;
        $sub_id  = $_POST['subcategory_id'] ?? null;
        
        if (empty($sub_id)) {
            throw new Exception("Sub-category is required");
        }
        
        $amount  = $_POST['amount'] ?? 0;
        $desc    = $_POST['description'] ?? '';
        $date    = $_POST['date'] ?? date('Y-m-d');

        // Validation: Ensure amount does not exceed remaining budget.
        // Pending expenses do NOT reduce the available balance until they are approved.
        if ($sub_id) {
            $subRes = mysqli_query($conn, "SELECT remaining_budget FROM sub_categories WHERE id = $sub_id");
            $subData = mysqli_fetch_assoc($subRes);
            $remaining = floatval($subData['remaining_budget'] ?? 0);

            if ($amount > $remaining) {
                throw new Exception("Insufficient budget. Available: PHP " . number_format($remaining, 2));
            }
        }
        
        $filePath = "";
        if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] == 0) {
            $targetDir = "uploads/receipts/";
            if (!file_exists($targetDir)) { mkdir($targetDir, 0777, true); }
            $fileName = time() . "_" . basename($_FILES["receipt"]["name"]);
            $targetFilePath = $targetDir . $fileName;
            if (move_uploaded_file($_FILES["receipt"]["tmp_name"], $targetFilePath)) {
                $filePath = $targetFilePath;
            }
        }

        $year = $_POST['year'] ?? date('Y');
        
        // Resolve fiscal_year_id
        $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
        $fy_row = mysqli_fetch_assoc($fy_res);
        $fiscalYearId = $fy_row ? intval($fy_row['id']) : 1;

        $stmt = $conn->prepare("INSERT INTO expenses (user_id, subcategory_id, amount, description, expense_date, receipt_path, fiscal_year_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . mysqli_error($conn));
        }
        
        $stmt->bind_param("iidsssi", $user_id, $sub_id, $amount, $desc, $date, $filePath, $fiscalYearId);

        if ($stmt->execute()) {
            $expense_id = $stmt->insert_id;
            
            // Record audit trail
            $auditStmt = $conn->prepare("INSERT INTO expense_audits (expense_id, user_id, action, comments) VALUES (?, ?, 'requested', 'Initial expense request')");
            if ($auditStmt) {
                $auditStmt->bind_param("ii", $expense_id, $user_id);
                $auditStmt->execute();
            }

            // NOTIFY DEPARTMENT HEAD
            $deptRes = mysqli_query($conn, "SELECT department_id, full_name FROM users WHERE id = $user_id LIMIT 1");
            if ($deptRow = mysqli_fetch_assoc($deptRes)) {
                $dept_id = intval($deptRow['department_id']);
                $staff_name = mysqli_real_escape_string($conn, $deptRow['full_name']);
                $desc_safe = mysqli_real_escape_string($conn, $desc);
                
                // Find department head
                $headRes = mysqli_query($conn, "SELECT id FROM users WHERE department_id = $dept_id AND role = 'department_head'");
                while ($headRow = mysqli_fetch_assoc($headRes)) {
                    $head_id = intval($headRow['id']);
                    $title = "New Expense Request";
                    $message = "$staff_name has requested PHP " . number_format($amount, 2) . " for: $desc_safe";
                    $type = "expense_request";
                    mysqli_query($conn, "INSERT INTO notifications (user_id, title, message, type) VALUES ($head_id, '$title', '$message', '$type')");
                }
            }

            // DO NOT deduct here anymore. User wants deduction ONLY on 'accept' (approval).
            // However, we already validated balance in the pre-check above if we added it.
            echo json_encode(["success" => true, "message" => "Request submitted and pending approval"]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
    } 
    catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} 
elseif ($action == 'get_user_expenses') {
    $user_id = $_GET['user_id'] ?? 0;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

    $query = "SELECT e.*, s.name as subcategory_name 
              FROM expenses e 
              LEFT JOIN sub_categories s ON e.subcategory_id = s.id 
              WHERE e.user_id = ? 
              ORDER BY e.created_at DESC LIMIT ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $user_id, $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $expenses = [];
    while ($row = $result->fetch_assoc()) {
        $expenses[] = $row;
    }
    
    echo json_encode(["success" => true, "expenses" => $expenses]);
}
elseif ($action == 'get_user_stats') {
    $user_id = $_GET['user_id'] ?? 0;
    $year = $_GET['year'] ?? date('Y');

    // Get fiscal_year_id
    $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
    $fy_row = mysqli_fetch_assoc($fy_res);
    $fiscalYearId = $fy_row ? intval($fy_row['id']) : 1;

    // 1. Used this year (Approved ONLY — pending should not count as "used" until approved)
    $q1 = mysqli_query($conn, "SELECT SUM(amount) as total FROM expenses WHERE user_id = $user_id AND status = 'approved' AND fiscal_year_id = $fiscalYearId");
    $r1 = mysqli_fetch_assoc($q1);
    $usedData = $r1['total'] ?? 0;

    // 2. Pending count
    $q2 = mysqli_query($conn, "SELECT COUNT(*) as count FROM expenses WHERE user_id = $user_id AND status = 'pending'");
    $r2 = mysqli_fetch_assoc($q2);
    $pendingCount = $r2['count'] ?? 0;

    // 3. Approved count (YTD)
    $q3 = mysqli_query($conn, "SELECT COUNT(*) as count FROM expenses WHERE user_id = $user_id AND status = 'approved' AND fiscal_year_id = $fiscalYearId");
    $r3 = mysqli_fetch_assoc($q3);
    $approvedCount = $r3['count'] ?? 0;

    echo json_encode([
        "success" => true,
        "stats" => [
            "used" => floatval($usedData),
            "pending" => intval($pendingCount),
            "approved" => intval($approvedCount)
        ]
    ]);
}
elseif ($action == 'get_audit_trail') {
    $expense_id = isset($_GET['expense_id']) ? intval($_GET['expense_id']) : 0;
    
    $query = "SELECT ea.*, u.full_name as user_name, u.role as user_role 
              FROM expense_audits ea 
              JOIN users u ON ea.user_id = u.id 
              WHERE ea.expense_id = ? 
              ORDER BY ea.created_at ASC";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $expense_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $audits = [];
    while ($row = $result->fetch_assoc()) {
        $audits[] = $row;
    }
    
    echo json_encode(["success" => true, "audits" => $audits]);
}
?>