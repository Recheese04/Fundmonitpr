<?php
// Disable HTML error output - output JSON only
ini_set('display_errors', 0);
error_reporting(E_ALL);

// 1. SECURITY & CORS HEADERS (MUST BE FIRST - before any output)
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Custom error handler to output JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo json_encode([
        "success" => false,
        "message" => "PHP Error: $errstr in $errfile on line $errline"
    ]);
    exit();
});

// 2. DATABASE CONNECTION
$host = "localhost";
$user = "root";
$pass = "";
$db   = "fundmonitor_db";

$conn = @mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    echo json_encode([
        "success" => false, 
        "message" => "Database Connection Failed: " . mysqli_connect_error()
    ]);
    exit;
}

// Set charset
mysqli_set_charset($conn, "utf8");

// 3. HANDLE POST REQUEST FOR SINGLE DEPARTMENT ALLOCATION
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON input: " . json_last_error_msg()
        ]);
        exit;
    }
    
    $totalFund = floatval($data['total_fund'] ?? 0);
    $year = intval($data['year'] ?? date('Y'));
    $departmentId = intval($data['department_id'] ?? 0);

    // Validation
    if ($totalFund <= 0) {
        echo json_encode([
            "success" => false, 
            "message" => "Please enter a valid total fund amount"
        ]);
        exit;
    }

    if ($departmentId <= 0) {
        echo json_encode([
            "success" => false, 
            "message" => "Please select a valid department"
        ]);
        exit;
    }

    // Get the selected department (must be id <= 4)
    $deptQuery = "SELECT id, department_name FROM departments WHERE id = $departmentId AND id <= 4";
    $deptResult = mysqli_query($conn, $deptQuery);
    
    if (!$deptResult) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch department: " . mysqli_error($conn)
        ]);
        exit;
    }
    
    if (mysqli_num_rows($deptResult) == 0) {
        echo json_encode([
            "success" => false,
            "message" => "Department not found or invalid department ID"
        ]);
        exit;
    }
    
    $department = mysqli_fetch_assoc($deptResult);
    $deptId = intval($department['id']);
    $deptName = $department['department_name'];

    // --- RESOLVE FISCAL YEAR ---
    $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
    if (mysqli_num_rows($fy_res) > 0) {
        $fy_row = mysqli_fetch_assoc($fy_res);
        $fiscalYearId = intval($fy_row['id']);
    } else {
        // Create it if it doesn't exist
        mysqli_query($conn, "INSERT INTO fiscal_years (year, label, status) VALUES ($year, '$year', 'active')");
        $fiscalYearId = mysqli_insert_id($conn);
    }
    // ---------------------------

    // The entire fund goes to this single department
    $deptBudget = $totalFund;

    // FETCH CATEGORY ALLOCATION PERCENTAGES DYNAMICALLY FROM DB
    // (Instead of hardcoded values, we use the department's set rules)
    $catQuery = "SELECT name, (allocation_percentage / 100) as pct 
                 FROM categories 
                 WHERE department_id = $departmentId AND fiscal_year_id = $fiscalYearId";
    $catRes = mysqli_query($conn, $catQuery);
    
    $categoryAllocations = [];
    if ($catRes && mysqli_num_rows($catRes) > 0) {
        while ($row = mysqli_fetch_assoc($catRes)) {
            $categoryAllocations[$row['name']] = floatval($row['pct']);
        }
    } else {
        // Fallback for first-time use if no rules are set
        $categoryAllocations = [
            'Personnel Services' => 0.45,
            'MOOE' => 0.30,
            'Capital Outlay' => 0.15,
            'Financial Subsidy' => 0.10
        ];
    }

    // Start transaction
    mysqli_begin_transaction($conn);

    try {
        // Resolve fiscal_year_id
        $fyResult = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
        if ($fyResult && mysqli_num_rows($fyResult) > 0) {
            $fyRow = mysqli_fetch_assoc($fyResult);
            $fiscalYearId = intval($fyRow['id']);
        } else {
            // Auto-create the fiscal year if it doesn't exist
            $label = 'FY ' . $year;
            mysqli_query($conn, "INSERT IGNORE INTO fiscal_years (year, label, is_active) VALUES ($year, '$label', 0)");
            $fyRow2 = mysqli_fetch_assoc(mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1"));
            $fiscalYearId = intval($fyRow2['id']);
        }

        // Update or create budget entry for the department
        $checkBudget = mysqli_query($conn, 
            "SELECT id FROM budgets 
             WHERE department_id = $deptId AND fiscal_year_id = $fiscalYearId"
        );
        
        if (mysqli_num_rows($checkBudget) > 0) {
            // Update existing budget
            $updateBudget = "UPDATE budgets 
                            SET total_budget = $deptBudget,
                                allocated_budget = $deptBudget,
                                year = $year,
                                fiscal_year_id = $fiscalYearId
                            WHERE department_id = $deptId AND fiscal_year_id = $fiscalYearId";
            
            if (!mysqli_query($conn, $updateBudget)) {
                throw new Exception("Failed to update budget for '$deptName': " . mysqli_error($conn));
            }
        } else {
            // Create budget entry
            $insertBudget = "INSERT INTO budgets (
                                department_id,
                                fiscal_year_id,
                                year,
                                total_budget,
                                allocated_budget,
                                created_at
                             ) VALUES (
                                $deptId,
                                $fiscalYearId,
                                $year,
                                $deptBudget,
                                $deptBudget,
                                NOW()
                             )";
            
            if (!mysqli_query($conn, $insertBudget)) {
                throw new Exception("Failed to create budget for '$deptName': " . mysqli_error($conn));
            }
        }
        
        $categoryBreakdown = [];
        
        // Allocate categories within this department's budget
        foreach ($categoryAllocations as $categoryName => $catPercentage) {
            $categoryBudget = round($deptBudget * $catPercentage, 2);
            
            $categoryNameEsc = mysqli_real_escape_string($conn, $categoryName);
            
            // Check if category exists for this department AND this fiscal year
            $checkCat = mysqli_query($conn, 
                "SELECT id FROM categories 
                 WHERE name = '$categoryNameEsc' AND department_id = $deptId AND fiscal_year_id = $fiscalYearId"
            );
            
            if (!$checkCat) {
                throw new Exception("Category query failed: " . mysqli_error($conn));
            }
            
            if (mysqli_num_rows($checkCat) > 0) {
                // Update existing category
                $catRow = mysqli_fetch_assoc($checkCat);
                $catId = $catRow['id'];
                
                $updateCat = "UPDATE categories 
                             SET total_budget = $categoryBudget,
                                 allocation_amount = $categoryBudget,
                                 allocation_percentage = " . ($catPercentage * 100) . "
                             WHERE id = $catId";
                
                if (!mysqli_query($conn, $updateCat)) {
                    throw new Exception("Failed to update category '$categoryName' for '$deptName': " . mysqli_error($conn));
                }
            } else {
                // Create category for this department and this fiscal year
                $insertCat = "INSERT INTO categories (
                                name, 
                                department_id, 
                                fiscal_year_id,
                                total_budget, 
                                allocation_amount,
                                allocation_percentage,
                                description,
                                created_at
                             ) VALUES (
                                '$categoryNameEsc',
                                $deptId,
                                $fiscalYearId,
                                $categoryBudget,
                                $categoryBudget,
                                " . ($catPercentage * 100) . ",
                                '',
                                NOW()
                             )";
                
                if (!mysqli_query($conn, $insertCat)) {
                    throw new Exception("Failed to create category '$categoryName' for '$deptName': " . mysqli_error($conn));
                }
            }
            
            $categoryBreakdown[] = [
                'category' => $categoryName,
                'percentage' => number_format($catPercentage * 100, 2) . '%',
                'amount' => '₱' . number_format($categoryBudget, 2),
                'raw_amount' => $categoryBudget
            ];
        }

        // Commit transaction
        mysqli_commit($conn);

        echo json_encode([
            "success" => true,
            "message" => "✅ Budget successfully allocated to $deptName for fiscal year $year",
            "year" => $year,
            "department" => $deptName,
            "department_id" => $deptId,
            "total_fund" => '₱' . number_format($totalFund, 2),
            "total_allocated" => '₱' . number_format($deptBudget, 2),
            "category_breakdown" => $categoryBreakdown
        ]);

    } catch (Exception $e) {
        // Rollback on error
        mysqli_rollback($conn);
        
        echo json_encode([
            "success" => false,
            "message" => "❌ Allocation failed: " . $e->getMessage()
        ]);
    }

    mysqli_close($conn);
    exit;
}

// GET REQUEST - Fetch current allocations (by categories for a specific department)
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $year = intval($_GET['year'] ?? date('Y'));
    $deptId = intval($_GET['department_id'] ?? 0);
    
    if ($deptId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Department ID is required"
        ]);
        mysqli_close($conn);
        exit;
    }
    
    // Get categories for this specific department
    // NOTE: year filter is on the budgets table via fiscal_years
    $query = "SELECT 
                c.id,
                c.name as category_name,
                c.total_budget,
                c.allocation_percentage
              FROM categories c
              WHERE c.department_id = $deptId AND c.fiscal_year_id = (SELECT id FROM fiscal_years WHERE year = $year LIMIT 1)
              ORDER BY c.allocation_percentage DESC";
    
    $result = mysqli_query($conn, $query);
    
    if ($result) {
        $allocations = [];
        $totalAllocated = 0;
        
        while ($row = mysqli_fetch_assoc($result)) {
            $allocated = floatval($row['total_budget']);
            $totalAllocated += $allocated;
            
            $allocations[] = [
                'category' => $row['category_name'],
                'allocated' => '₱' . number_format($allocated, 2),
                'raw_allocated' => $allocated,
                'allocation_percentage' => floatval($row['allocation_percentage'])
            ];
        }
        
        // Get department budget from budgets table using fiscal_years join
        $budgetQuery = "SELECT COALESCE(b.total_budget, b.allocated_budget, 0) as total_budget
                        FROM budgets b
                        LEFT JOIN fiscal_years fy ON b.fiscal_year_id = fy.id
                        WHERE b.department_id = $deptId AND fy.year = $year
                        LIMIT 1";
        $budgetResult = mysqli_query($conn, $budgetQuery);
        $departmentBudget = 0;
        
        if ($budgetResult && mysqli_num_rows($budgetResult) > 0) {
            $budgetRow = mysqli_fetch_assoc($budgetResult);
            $departmentBudget = floatval($budgetRow['total_budget']);
        }
        
        echo json_encode([
            "success" => true,
            "year" => $year,
            "department_id" => $deptId,
            "department_budget" => '₱' . number_format($departmentBudget, 2),
            "total_allocated" => '₱' . number_format($totalAllocated, 2),
            "allocations" => $allocations
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch allocations: " . mysqli_error($conn)
        ]);
    }
    
    mysqli_close($conn);
    exit;
}

// Invalid request method
echo json_encode([
    "success" => false,
    "message" => "Invalid request method. Use POST to allocate or GET to view allocations."
]);

mysqli_close($conn);
?>