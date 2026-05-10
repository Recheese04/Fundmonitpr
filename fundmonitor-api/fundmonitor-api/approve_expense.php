<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/expense_error.log');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Log all incoming data
file_put_contents(__DIR__ . '/expense_debug.log', date('Y-m-d H:i:s') . " - Request received\n", FILE_APPEND);
file_put_contents(__DIR__ . '/expense_debug.log', "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents(__DIR__ . '/expense_debug.log', "Raw input: " . file_get_contents('php://input') . "\n", FILE_APPEND);

// Handle preflight requests from the browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");

if (!$conn) {
    $error = ["success" => false, "message" => "Database connection failed: " . mysqli_connect_error()];
    echo json_encode($error);
    file_put_contents(__DIR__ . '/expense_debug.log', "DB Connection failed\n", FILE_APPEND);
    exit;
}

// Get the expense ID - check both POST and JSON input
$input = json_decode(file_get_contents('php://input'), true);
$id = $_POST['id'] ?? $input['id'] ?? 0;

file_put_contents(__DIR__ . '/expense_debug.log', "Expense ID: $id\n", FILE_APPEND);

if ($id <= 0) {
    $error = ["success" => false, "message" => "Invalid expense ID: $id"];
    echo json_encode($error);
    file_put_contents(__DIR__ . '/expense_debug.log', "Invalid ID\n", FILE_APPEND);
    exit;
}

mysqli_begin_transaction($conn);

try {
    // 1. Get the expense details
    $query = "SELECT id, amount, subcategory_id, status, user_id FROM expenses WHERE id = ?";
    file_put_contents(__DIR__ . '/expense_debug.log', "Query 1: $query with ID=$id\n", FILE_APPEND);
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $expense = $result->fetch_assoc();
    $stmt->close();

    file_put_contents(__DIR__ . '/expense_debug.log', "Expense data: " . print_r($expense, true) . "\n", FILE_APPEND);

    if (!$expense) {
        throw new Exception("Expense not found with ID: " . $id);
    }

    if ($expense['status'] === 'approved') {
        throw new Exception("This expense has already been approved.");
    }

    $amount = floatval($expense['amount']);
    $sub_id = intval($expense['subcategory_id']);
    $staff_id = intval($expense['user_id']);

    file_put_contents(__DIR__ . '/expense_debug.log', "Amount: $amount, Subcategory ID: $sub_id\n", FILE_APPEND);

    // 2. Get current sub-category budget BEFORE update
    $query2 = "SELECT id, name, allocation_amount, remaining_budget FROM sub_categories WHERE id = ?";
    file_put_contents(__DIR__ . '/expense_debug.log', "Query 2: $query2 with ID=$sub_id\n", FILE_APPEND);
    
    $stmt = $conn->prepare($query2);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $sub_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $subcategory_before = $result->fetch_assoc();
    $stmt->close();

    file_put_contents(__DIR__ . '/expense_debug.log', "Subcategory BEFORE: " . print_r($subcategory_before, true) . "\n", FILE_APPEND);

    if (!$subcategory_before) {
        throw new Exception("Sub-category not found with ID: " . $sub_id);
    }

    $currentBudget = floatval($subcategory_before['remaining_budget']);
    $subcategoryName = $subcategory_before['name'];

    file_put_contents(__DIR__ . '/expense_debug.log', "Current budget: $currentBudget, Amount to deduct: $amount\n", FILE_APPEND);

    // Check if there's enough budget
    if ($currentBudget < $amount) {
        throw new Exception(
            "Insufficient budget! Available: PHP " . number_format($currentBudget, 2) . 
            ", Required: PHP " . number_format($amount, 2) .
            " (Category: $subcategoryName)"
        );
    }

    // 3. Update the sub_categories budget
    $newBudget = $currentBudget - $amount;
    $query3 = "UPDATE sub_categories SET remaining_budget = ? WHERE id = ?";
    file_put_contents(__DIR__ . '/expense_debug.log', "Query 3: $query3 with newBudget=$newBudget, ID=$sub_id\n", FILE_APPEND);
    
    $stmt = $conn->prepare($query3);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("di", $newBudget, $sub_id);
    $executeResult = $stmt->execute();
    $affectedRows = $stmt->affected_rows;
    $updateError = $stmt->error;
    $stmt->close();

    file_put_contents(__DIR__ . '/expense_debug.log', "Update executed: $executeResult, Affected rows: $affectedRows, Error: $updateError\n", FILE_APPEND);

    // Verify the update actually happened
    $stmt = $conn->prepare("SELECT remaining_budget FROM sub_categories WHERE id = ?");
    $stmt->bind_param("i", $sub_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $subcategory_after = $result->fetch_assoc();
    $stmt->close();
    
    file_put_contents(__DIR__ . '/expense_debug.log', "Subcategory AFTER: " . print_r($subcategory_after, true) . "\n", FILE_APPEND);

    // 4. Update expense status
    $query4 = "UPDATE expenses SET status = 'approved' WHERE id = ?";
    file_put_contents(__DIR__ . '/expense_debug.log', "Query 4: $query4 with ID=$id\n", FILE_APPEND);
    
    $stmt = $conn->prepare($query4);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $approveRows = $stmt->affected_rows;
    $stmt->close();

    // 5. Record Audit Trail
    $user_id = $_POST['user_id'] ?? $input['user_id'] ?? 0;
    if ($user_id > 0) {
        $auditStmt = $conn->prepare("INSERT INTO expense_audits (expense_id, user_id, action, comments) VALUES (?, ?, 'approved', 'Request approved and budget deducted')");
        if ($auditStmt) {
            $auditStmt->bind_param("ii", $id, $user_id);
            $auditStmt->execute();
            $auditStmt->close();
        }
    }

    // 6. Notify Staff
    if ($staff_id > 0) {
        $title = "Expense Approved";
        $message = "Your expense request for PHP " . number_format($amount, 2) . " has been approved.";
        $type = "expense_approved";
        $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
        if ($notifStmt) {
            $notifStmt->bind_param("isss", $staff_id, $title, $message, $type);
            $notifStmt->execute();
            $notifStmt->close();
        }
    }

    file_put_contents(__DIR__ . '/expense_debug.log', "Expense approval affected rows: $approveRows\n", FILE_APPEND);

    mysqli_commit($conn);
    
    $response = [
        "success" => true, 
        "message" => "Expense approved successfully!",
        "debug" => [
            "expense_id" => $id,
            "amount_deducted" => $amount,
            "subcategory_id" => $sub_id,
            "subcategory_name" => $subcategoryName,
            "budget_before" => $currentBudget,
            "budget_after" => floatval($subcategory_after['remaining_budget']),
            "new_budget_calculated" => $newBudget,
            "update_affected_rows" => $affectedRows,
            "approve_affected_rows" => $approveRows
        ]
    ];
    
    file_put_contents(__DIR__ . '/expense_debug.log', "SUCCESS: " . print_r($response, true) . "\n\n", FILE_APPEND);
    echo json_encode($response);

} catch (Exception $e) {
    mysqli_rollback($conn);
    $error = [
        "success" => false, 
        "message" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ];
    file_put_contents(__DIR__ . '/expense_debug.log', "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
    echo json_encode($error);
}

mysqli_close($conn);
?>