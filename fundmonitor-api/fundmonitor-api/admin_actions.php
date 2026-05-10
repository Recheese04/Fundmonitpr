<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");

$action = $_GET['action'] ?? '';

// --- ACTION: GET BUDGETS (with optional year filter via fiscal_years) ---
if ($action == 'get_budgets') {
    $year = isset($_GET['year']) && is_numeric($_GET['year']) ? intval($_GET['year']) : null;

    $sql = "SELECT b.id, fy.year AS budget_year, fy.label,
                   COALESCE(b.total_budget, b.allocated_budget, 0) AS total_budget,
                   d.department_name
            FROM budgets b
            LEFT JOIN departments d ON b.department_id = d.id
            LEFT JOIN fiscal_years fy ON b.fiscal_year_id = fy.id";
    if ($year) {
        $sql .= " WHERE fy.year = $year";
    }
    $sql .= " ORDER BY fy.year DESC, d.department_name ASC";

    $result = mysqli_query($conn, $sql);
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    echo json_encode($rows);
    exit;
}

// --- ACTION: GET STATS ---
if ($action == 'get_stats') {
    $r1 = mysqli_query($conn, "SELECT COUNT(*) as c FROM users");
    $total_users = mysqli_fetch_assoc($r1)['c'];

    $r2 = mysqli_query($conn, "SELECT COALESCE(SUM(COALESCE(total_budget, allocated_budget, 0)), 0) as s FROM budgets");
    $total_budget = mysqli_fetch_assoc($r2)['s'];

    $r3 = mysqli_query($conn, "SELECT COALESCE(SUM(COALESCE(b.total_budget, b.allocated_budget, 0)), 0) as s
                               FROM budgets b JOIN fiscal_years fy ON b.fiscal_year_id = fy.id
                               WHERE fy.year = YEAR(NOW())");
    $allocated_budget = mysqli_fetch_assoc($r3)['s'];

    echo json_encode([
        'total_users' => intval($total_users),
        'total_budget' => number_format($total_budget, 2),
        'allocated_budget' => number_format($allocated_budget, 2)
    ]);
    exit;
}

// --- ACTION: GET YEARS (from fiscal_years table) ---
if ($action == 'get_years') {
    $result = mysqli_query($conn, "SELECT id, year, label, is_active FROM fiscal_years ORDER BY year DESC");
    $years = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $years[] = ['id' => intval($row['id']), 'year' => intval($row['year']), 'label' => $row['label'], 'is_active' => intval($row['is_active'])];
    }
    echo json_encode($years);
    exit;
}

// --- ACTION: ADD FISCAL YEAR ---
if ($action == 'add_fiscal_year' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $year = intval($data['year'] ?? 0);
    if ($year < 2000 || $year > 2100) {
        echo json_encode(['success' => false, 'message' => 'Invalid year']);
        exit;
    }
    $label = 'FY ' . $year;
    if (mysqli_query($conn, "INSERT IGNORE INTO fiscal_years (year, label, is_active) VALUES ($year, '$label', 0)")) {
        echo json_encode(['success' => true, 'message' => "Fiscal year $year added"]);
    } else {
        echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    }
    exit;
}

// --- ACTION: GET DEPARTMENTS ---
if ($action == 'get_departments') {
    // Changed 'name' to 'department_name' to match your DB
    $result = mysqli_query($conn, "SELECT id, department_name FROM departments ORDER BY department_name ASC");
    $depts = [];
    while($row = mysqli_fetch_assoc($result)) {
        $depts[] = $row;
    }
    echo json_encode($depts);
    exit;
}

// --- ACTION: GET ALL USERS ---
if ($action == 'get_users') {
    // Changed d.name to d.department_name
    $sql = "SELECT u.id, u.full_name, u.email, u.role, d.department_name as dept_name 
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id 
            ORDER BY u.id DESC";
    $result = mysqli_query($conn, $sql);
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
    
    $name = mysqli_real_escape_string($conn, $data['full_name']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = mysqli_real_escape_string($conn, $data['password']);
    $role = mysqli_real_escape_string($conn, $data['role']);
    $dept_id = !empty($data['department_id']) ? intval($data['department_id']) : 'NULL';

    $sql = "INSERT INTO users (full_name, email, password, role, department_id, status) 
            VALUES ('$name', '$email', '$password', '$role', $dept_id, 'active')";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true, "message" => "User registered successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
    }
    exit;
}

// --- ACTION: DELETE USER ---
if ($action == 'delete_user' && $_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = mysqli_real_escape_string($conn, $_GET['id']);
    mysqli_query($conn, "DELETE FROM users WHERE id = '$id'");
    echo json_encode(["success" => true]);
    exit;
}
// --- ACTION: UPDATE USER ---
if ($action == 'update_user' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $id = mysqli_real_escape_string($conn, $data['id']);
    $name = mysqli_real_escape_string($conn, $data['full_name']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $role = mysqli_real_escape_string($conn, $data['role']);
    $dept_id = !empty($data['department_id']) ? intval($data['department_id']) : 'NULL';

    // We only update password if it's not empty
    $password_query = "";
    if (!empty($data['password'])) {
        $pass = mysqli_real_escape_string($conn, $data['password']);
        $password_query = ", password = '$pass'";
    }

    $sql = "UPDATE users SET 
            full_name = '$name', 
            email = '$email', 
            role = '$role', 
            department_id = $dept_id 
            $password_query 
            WHERE id = '$id'";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true, "message" => "User updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
    }
    exit;
}

// --- ACTION: GET SOURCE OF FUNDS ---
if ($action == 'get_source_of_funds') {
    $result = mysqli_query($conn, "SELECT id, name, ay FROM source_of_funds ORDER BY id ASC");
    $funds = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $funds[] = ['id' => intval($row['id']), 'name' => $row['name'], 'ay' => $row['ay']];
        }
    }
    echo json_encode($funds);
    exit;
}

// --- ACTION: ALLOCATE BUDGET (Multi-department) ---
if ($action == 'allocate' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $year = intval($data['year'] ?? date('Y'));
    $allocations = $data['allocations'] ?? []; // Array of {department_id, amount, source_of_fund_id}

    if (empty($allocations)) {
        echo json_encode(["success" => false, "message" => "No allocations provided"]);
        exit;
    }

    // 1. Resolve fiscal_year_id
    $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
    $fy_row = mysqli_fetch_assoc($fy_res);
    
    if (!$fy_row) {
        // Auto-create if not exists
        $label = "FY $year";
        mysqli_query($conn, "INSERT INTO fiscal_years (year, label, is_active) VALUES ($year, '$label', 0)");
        $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
        $fy_row = mysqli_fetch_assoc($fy_res);
    }
    
    $fiscalYearId = intval($fy_row['id']);
    $success_count = 0;
    $errors = [];

    mysqli_begin_transaction($conn);
    try {
        foreach ($allocations as $alloc) {
            $dept_id = intval($alloc['department_id']);
            $amount = floatval($alloc['amount'] ?? $alloc['allocated_budget'] ?? 0);
            $source_id = isset($alloc['source_of_fund_id']) && $alloc['source_of_fund_id'] ? intval($alloc['source_of_fund_id']) : 'NULL';

            if ($dept_id <= 0 || $amount < 0) continue;

            // Check if budget already exists for this dept/year/source
            // If source_id is used, we might allow multiple budgets per dept/year if they have different sources.
            // But to keep it simple and backwards compatible, we update if exists for dept/year
            $check = mysqli_query($conn, "SELECT id FROM budgets WHERE department_id = $dept_id AND fiscal_year_id = $fiscalYearId");
            
            if (mysqli_num_rows($check) > 0) {
                $sql = "UPDATE budgets SET allocated_budget = $amount, total_budget = $amount, year = $year, source_of_fund_id = $source_id WHERE department_id = $dept_id AND fiscal_year_id = $fiscalYearId";
            } else {
                $sql = "INSERT INTO budgets (department_id, fiscal_year_id, year, allocated_budget, total_budget, source_of_fund_id, created_at) 
                        VALUES ($dept_id, $fiscalYearId, $year, $amount, $amount, $source_id, NOW())";
            }

            if (mysqli_query($conn, $sql)) {
                $success_count++;
            } else {
                $errors[] = mysqli_error($conn);
            }
        }
        
        mysqli_commit($conn);
        echo json_encode([
            "success" => true, 
            "message" => "Successfully processed $success_count allocations for FY $year",
            "errors" => $errors
        ]);
    } catch (Exception $e) {
        mysqli_rollback($conn);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}
// --- ACTION: ADD SOURCE OF FUND ---
if ($action == 'add_source_of_fund' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = mysqli_real_escape_string($conn, $data['name']);
    $ay = intval($data['ay']);

    $sql = "INSERT INTO source_of_funds (name, ay) VALUES ('$name', $ay)";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true, "message" => "Source of Fund added!"]);
    } else {
        echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
    }
    exit;
}

// --- ACTION: GET ALL EXPENSES FOR EXPORT ---
if ($action == 'get_all_expenses') {
    $sql = "SELECT e.id, e.description, e.amount, e.status, e.expense_date, d.department_name, u.full_name as staff_name, sc.name as category_name
            FROM expenses e 
            JOIN users u ON e.user_id = u.id 
            JOIN departments d ON u.department_id = d.id
            LEFT JOIN sub_categories sc ON e.subcategory_id = sc.id
            ORDER BY e.expense_date DESC";
    $result = mysqli_query($conn, $sql);
    $expenses = [];
    if ($result) {
        while($row = mysqli_fetch_assoc($result)) {
            $expenses[] = $row;
        }
    }
    echo json_encode(['success' => true, 'data' => $expenses]);
    exit;
}
?>