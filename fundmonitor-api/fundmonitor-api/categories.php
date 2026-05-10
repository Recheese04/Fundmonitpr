<?php
/**
 * Categories & Sub-categories API
 * Handles CRUD operations for budget categories and sub-categories
 * 
 * Endpoints:
 * GET    ?action=get_categories - Fetch all categories with sub-categories
 * GET    ?action=get_category&id=X - Fetch single category
 * GET    ?action=get_subcategories&category_id=X - Fetch subcategories for a category
 * POST   ?action=create_category - Create new category
 * PUT    ?action=update_category - Update existing category
 * DELETE ?action=delete_category - Delete category
 * POST   ?action=create_subcategory - Create new sub-category
 * PUT    ?action=update_subcategory - Update existing sub-category
 * DELETE ?action=delete_subcategory - Delete sub-category
 */

// Enable error display for debugging (REMOVE IN PRODUCTION)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Custom error handler for production
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $error = [
        'success' => false,
        'message' => "PHP Error: $errstr",
        'file' => $errfile,
        'line' => $errline,
        'type' => $errno
    ];
    echo json_encode($error);
    exit();
});

// Database configuration
require_once 'config/db.php';

if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error(),
        'debug' => [
            'host' => $host,
            'dbname' => $dbname,
            'username' => $username
        ]
    ]);
    exit();
}

mysqli_set_charset($conn, "utf8mb4");

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : 'get_categories';

// Route requests
try {
    switch ($method) {
        case 'GET':
            handleGet($conn, $action);
            break;
        case 'POST':
            handlePost($conn, $action);
            break;
        case 'PUT':
            handlePut($conn, $action);
            break;
        case 'DELETE':
            handleDelete($conn, $action);
            break;
        default:
            sendResponse(false, 'Invalid request method: ' . $method);
    }
} catch (Exception $e) {
    sendResponse(false, 'Error: ' . $e->getMessage(), [
        'trace' => $e->getTraceAsString()
    ]);
}

mysqli_close($conn);

/**
 * Handle GET requests
 */
function handleGet($conn, $action) {
    switch ($action) {
        case 'get_categories':
            getCategories($conn);
            break;
        case 'get_categories_with_budget':
            getCategoriesWithBudget($conn);
            break;
        case 'get_category':
            getCategory($conn);
            break;
        case 'get_subcategories':
            getSubcategories($conn);
            break;
        default:
            getCategories($conn);
    }
}

/**
 * Handle POST requests
 */
function handlePost($conn, $action) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON: ' . json_last_error_msg(), [
            'received' => $input
        ]);
        return;
    }
    
    switch ($action) {
        case 'create_category':
            createCategory($conn, $data);
            break;
        case 'create_subcategory':
            createSubcategory($conn, $data);
            break;
        case 'reset_subcategory_budget':
            resetSubcategoryBudget($conn, $data);
            break;
        default:
            sendResponse(false, 'Invalid action for POST request: ' . $action);
    }
}

/**
 * Handle PUT requests
 */
function handlePut($conn, $action) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON: ' . json_last_error_msg(), [
            'received' => $input
        ]);
        return;
    }
    
    switch ($action) {
        case 'update_category':
            updateCategory($conn, $data);
            break;
        case 'update_subcategory':
            updateSubcategory($conn, $data);
            break;
        default:
            sendResponse(false, 'Invalid action for PUT request: ' . $action);
    }
}

/**
 * Handle DELETE requests
 */
function handleDelete($conn, $action) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON: ' . json_last_error_msg(), [
            'received' => $input
        ]);
        return;
    }
    
    switch ($action) {
        case 'delete_category':
            deleteCategory($conn, $data);
            break;
        case 'delete_subcategory':
            deleteSubcategory($conn, $data);
            break;
        default:
            sendResponse(false, 'Invalid action for DELETE request: ' . $action);
    }
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * ⭐ FIXED: Get all categories with their sub-categories - NOW FILTERS BY DEPARTMENT
 */
function getCategories($conn) {
    // ⭐ Get department_id from query parameter
    $deptId = isset($_GET['department_id']) ? intval($_GET['department_id']) : 0;
    
    $year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

    // Build category query with department and year filter
    $query = "SELECT c.* FROM categories c 
              JOIN fiscal_years fy ON c.fiscal_year_id = fy.id
              WHERE fy.year = $year";
    if ($deptId > 0) {
        $query .= " AND c.department_id = $deptId";
    }
    $query .= " ORDER BY name ASC";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        sendResponse(false, 'Failed to fetch categories: ' . mysqli_error($conn), [
            'query' => $query
        ]);
        return;
    }
    
    $categories = [];
    while ($category = mysqli_fetch_assoc($result)) {
        $catId = intval($category['id']);
        
        // ⭐ Fetch sub-categories with department filter
        $subQuery = "SELECT * FROM sub_categories WHERE category_id = $catId";
        if ($deptId > 0) {
            $subQuery .= " AND department_id = $deptId";
        }
        $subQuery .= " ORDER BY name ASC";
        
        $subResult = mysqli_query($conn, $subQuery);
        
        $subcategories = [];
        $totalAllocated = 0;
        $totalRemaining = 0;
        
        if ($subResult) {
            while ($sub = mysqli_fetch_assoc($subResult)) {
                $sub['allocation_amount'] = floatval($sub['allocation_amount'] ?? 0);
                $sub['remaining_balance'] = floatval($sub['remaining_budget'] ?? 0);
                $sub['spent_amount'] = $sub['allocation_amount'] - $sub['remaining_balance'];
                
                $subcategories[] = $sub;
                
                $totalAllocated += $sub['allocation_amount'];
                $totalRemaining += $sub['remaining_balance'];
            }
        }
        
        // Final Category Totals
        $category['total_budget'] = floatval($category['total_budget'] ?? 0);
        $category['allocation_percentage'] = floatval($category['allocation_percentage'] ?? 0);
        $category['total_allocated'] = $totalAllocated;
        $category['total_remaining'] = $totalRemaining;
        $category['total_spent'] = $totalAllocated - $totalRemaining;
        
        $category['subcategories'] = $subcategories;
        $category['subcategory_count'] = count($subcategories);
        
        $categories[] = $category;
    }
    
    sendResponse(true, 'Categories retrieved with real-time balances', [
        'categories' => $categories,
        'department_id' => $deptId,
        'count' => count($categories)
    ]);
}

/**
 * Get categories with their actual budget allocations from budgets table
 */
function getCategoriesWithBudget($conn) {
    $year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
    $deptId = isset($_GET['department_id']) ? intval($_GET['department_id']) : 0;
    
    // 1. Fetch categories filtered by department and year
    $catQuery = "SELECT c.* FROM categories c 
                 JOIN fiscal_years fy ON c.fiscal_year_id = fy.id
                 WHERE fy.year = $year";
    if ($deptId > 0) {
        $catQuery .= " AND c.department_id = $deptId";
    }
    $catQuery .= " ORDER BY name ASC";
    $catResult = mysqli_query($conn, $catQuery);
    
    if (!$catResult) {
        sendResponse(false, 'Failed to fetch categories: ' . mysqli_error($conn));
        return;
    }
    
    // 2. Fetch the total allocated budget for the department from budgets table
    $deptAllocatedBudget = 0;
    if ($deptId > 0) {
        $budgetQuery = "SELECT allocated_budget FROM budgets WHERE department_id = $deptId AND year = $year";
        $budgetResult = mysqli_query($conn, $budgetQuery);
        if ($budgetResult && mysqli_num_rows($budgetResult) > 0) {
            $budgetRow = mysqli_fetch_assoc($budgetResult);
            $deptAllocatedBudget = floatval($budgetRow['allocated_budget']);
        }
    }
    
    $categories = [];
    $totalAllocatedFromCategories = 0;
    
    while ($category = mysqli_fetch_assoc($catResult)) {
        $catId = intval($category['id']);
        
        $categoryAllocatedBudget = floatval($category['total_budget'] ?? 0);
        $totalAllocatedFromCategories += $categoryAllocatedBudget;
        
        // 3. Fetch sub-categories for each category (filtered by department)
        $subQuery = "SELECT * FROM sub_categories WHERE category_id = $catId";
        if ($deptId > 0) {
            $subQuery .= " AND department_id = $deptId";
        }
        $subQuery .= " ORDER BY name ASC";
        
        $subResult = mysqli_query($conn, $subQuery);
        
        $subcategories = [];
        $subAllocatedSum = 0;
        if ($subResult) {
            while ($sub = mysqli_fetch_assoc($subResult)) {
                $sub_id = intval($sub['id']);
                $amt = floatval($sub['allocation_amount'] ?? 0);
                
                // Fetch pending expenses for this sub-category
                $pendingQuery = "SELECT SUM(amount) as pending FROM expenses WHERE subcategory_id = $sub_id AND status = 'pending'";
                $pendingResult = mysqli_query($conn, $pendingQuery);
                $pendingRow = mysqli_fetch_assoc($pendingResult);
                $pendingAmt = floatval($pendingRow['pending'] ?? 0);

                $sub['allocation_amount'] = $amt;
                $sub['remaining_budget'] = floatval($sub['remaining_budget'] ?? 0);
                $sub['pending_amount'] = $pendingAmt;
                $sub['effective_balance'] = $sub['remaining_budget'] - $pendingAmt;
                
                $subcategories[] = $sub;
                $subAllocatedSum += $amt;
            }
        }
        
        $categories[] = [
            'id' => intval($category['id']),
            'name' => $category['name'],
            'department_id' => intval($category['department_id'] ?? 0),
            'description' => $category['description'],
            'allocation_amount' => $categoryAllocatedBudget, // The share from dept budget
            'total_budget' => floatval($category['total_budget'] ?? 0),
            'subcategories_allocated' => $subAllocatedSum, // Actual sum of sub-categories
            'year' => $year,
            'subcategories' => $subcategories,
            'subcategory_count' => count($subcategories)
        ];
    }
    
    $finalDeptAllocatedBudget = $deptAllocatedBudget > 0 ? $deptAllocatedBudget : $totalAllocatedFromCategories;
    
    sendResponse(true, 'Categories with budget retrieved successfully', [
        'year' => $year,
        'department_id' => $deptId,
        'categories' => $categories,
        'department_allocated_budget' => $finalDeptAllocatedBudget
    ]);
}

function getCategory($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id <= 0) {
        sendResponse(false, 'Invalid category ID');
        return;
    }
    
    $query = "SELECT * FROM categories WHERE id = $id";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        sendResponse(false, 'Query failed: ' . mysqli_error($conn));
        return;
    }
    
    $category = mysqli_fetch_assoc($result);
    
    if (!$category) {
        sendResponse(false, 'Category not found');
        return;
    }
    
    // Get subcategories
    $subQuery = "SELECT * FROM sub_categories WHERE category_id = $id ORDER BY name ASC";
    $subResult = mysqli_query($conn, $subQuery);
    
    $subcategories = [];
    $allocatedBudget = 0;
    
    if ($subResult) {
        while ($sub = mysqli_fetch_assoc($subResult)) {
            $sub['allocation_amount'] = floatval($sub['allocation_amount'] ?? 0);
            $subcategories[] = $sub;
            $allocatedBudget += $sub['allocation_amount'];
        }
    }
    
    $category['subcategories'] = $subcategories;
    $category['total_budget'] = floatval($category['total_budget'] ?? 0);
    $category['allocated_budget'] = $allocatedBudget;
    $category['remaining_budget'] = $category['total_budget'] - $allocatedBudget;
    
    sendResponse(true, 'Category retrieved successfully', ['category' => $category]);
}

/**
 * Get subcategories for a specific category
 */
function getSubcategories($conn) {
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
    
    if ($categoryId <= 0) {
        sendResponse(false, 'Invalid category ID');
        return;
    }
    
    $query = "SELECT * FROM sub_categories WHERE category_id = $categoryId ORDER BY name ASC";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        sendResponse(false, 'Query failed: ' . mysqli_error($conn));
        return;
    }
    
    $subcategories = [];
    while ($sub = mysqli_fetch_assoc($result)) {
        $sub['allocation_amount'] = floatval($sub['allocation_amount'] ?? 0);
        $subcategories[] = $sub;
    }
    
    sendResponse(true, 'Subcategories retrieved successfully', ['subcategories' => $subcategories]);
}

/**
 * Create new category
 */
function createCategory($conn, $data) {
    $deptId = isset($data['department_id']) ? intval($data['department_id']) : 0;
    $name = isset($data['name']) ? mysqli_real_escape_string($conn, $data['name']) : '';
    $amount = isset($data['total_budget']) ? floatval($data['total_budget']) : 0;
    $percentage = isset($data['allocation_percentage']) ? floatval($data['allocation_percentage']) : 0;

    if (empty($name) || $deptId <= 0) {
        sendResponse(false, "Category name and Department ID are required. Received Dept: $deptId");
        return;
    }

    $year = isset($data['year']) ? intval($data['year']) : date('Y');
    
    // Resolve fiscal_year_id
    $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
    $fy_row = mysqli_fetch_assoc($fy_res);
    $fiscalYearId = $fy_row ? intval($fy_row['id']) : 1;

    $query = "INSERT INTO categories (name, department_id, fiscal_year_id, allocation_amount, allocation_percentage, created_at) 
              VALUES ('$name', $deptId, $fiscalYearId, $amount, $percentage, NOW())";
    
    if (mysqli_query($conn, $query)) {
        sendResponse(true, 'Category created successfully');
    } else {
        sendResponse(false, 'Database Error: ' . mysqli_error($conn));
    }
}

/**
 * Update existing category
 */
function updateCategory($conn, $data) {
    $id = isset($data['id']) ? intval($data['id']) : 0;
    $name = isset($data['name']) ? mysqli_real_escape_string($conn, trim($data['name'])) : '';
    $description = isset($data['description']) ? mysqli_real_escape_string($conn, trim($data['description'])) : '';
    $totalBudget = isset($data['total_budget']) ? floatval($data['total_budget']) : 0;
    $percentage = isset($data['allocation_percentage']) ? floatval($data['allocation_percentage']) : 0;
    
    if ($id <= 0) {
        sendResponse(false, 'Invalid category ID');
        return;
    }
    
    if (empty($name)) {
        sendResponse(false, 'Category name is required');
        return;
    }
    
    // Get current dept/year to keep the check scope-specific
    $getCurrentQuery = "SELECT department_id, fiscal_year_id FROM categories WHERE id = $id";
    $getCurrentResult = mysqli_query($conn, $getCurrentQuery);
    $currentRecord = mysqli_fetch_assoc($getCurrentResult);
    $deptId = $currentRecord['department_id'];
    $fiscalYearId = $currentRecord['fiscal_year_id'];

    // Check if name is taken by another category IN THE SAME DEPT AND YEAR
    $checkQuery = "SELECT id FROM categories WHERE name = '$name' AND id != $id AND department_id = $deptId AND fiscal_year_id = $fiscalYearId";
    $checkResult = mysqli_query($conn, $checkQuery);
    
    if (mysqli_num_rows($checkResult) > 0) {
        sendResponse(false, 'Another category with this name already exists');
        return;
    }
    
    $query = "UPDATE categories 
              SET name = '$name', description = '$description', total_budget = $totalBudget, allocation_percentage = $percentage, updated_at = NOW() 
              WHERE id = $id";
    
    if (mysqli_query($conn, $query)) {
        if (mysqli_affected_rows($conn) >= 0) {
            sendResponse(true, 'Category updated successfully', [
                'id' => $id,
                'name' => $name,
                'description' => $description,
                'total_budget' => $totalBudget,
                'allocation_percentage' => $percentage
            ]);
        } else {
            sendResponse(false, 'No changes made or category not found');
        }
    } else {
        sendResponse(false, 'Failed to update category: ' . mysqli_error($conn));
    }
}

/**
 * Delete category
 */
function deleteCategory($conn, $data) {
    $id = isset($data['id']) ? intval($data['id']) : 0;
    
    if ($id <= 0) {
        sendResponse(false, 'Invalid category ID');
        return;
    }
    
    // Check if category has subcategories
    $checkQuery = "SELECT COUNT(*) as count FROM sub_categories WHERE category_id = $id";
    $checkResult = mysqli_query($conn, $checkQuery);
    $row = mysqli_fetch_assoc($checkResult);
    
    if ($row['count'] > 0) {
        sendResponse(false, 'Cannot delete category with existing sub-categories. Please delete all sub-categories first.', [
            'subcategory_count' => intval($row['count'])
        ]);
        return;
    }
    
    $query = "DELETE FROM categories WHERE id = $id";
    
    if (mysqli_query($conn, $query)) {
        if (mysqli_affected_rows($conn) > 0) {
            sendResponse(true, 'Category deleted successfully');
        } else {
            sendResponse(false, 'Category not found');
        }
    } else {
        sendResponse(false, 'Failed to delete category: ' . mysqli_error($conn));
    }
}

// ============================================
// SUB-CATEGORY OPERATIONS
// ============================================

/**
 * Create new sub-category
 */
function createSubcategory($conn, $data) {
    $catId = isset($data['category_id']) ? intval($data['category_id']) : 0;
    $deptId = isset($data['department_id']) ? intval($data['department_id']) : 0;
    $name = isset($data['name']) ? mysqli_real_escape_string($conn, $data['name']) : '';
    $amount = isset($data['allocation_amount']) ? floatval($data['allocation_amount']) : 0;

    $year = isset($data['year']) ? intval($data['year']) : date('Y');
    
    // Resolve fiscal_year_id
    $fy_res = mysqli_query($conn, "SELECT id FROM fiscal_years WHERE year = $year LIMIT 1");
    $fy_row = mysqli_fetch_assoc($fy_res);
    $fiscalYearId = $fy_row ? intval($fy_row['id']) : 1;

    // 1. Check parent category budget limit
    $catBudgetQuery = "SELECT total_budget FROM categories WHERE id = $catId";
    $catBudgetRes = mysqli_query($conn, $catBudgetQuery);
    $catBudgetRow = mysqli_fetch_assoc($catBudgetRes);
    $parentTotalBudget = $catBudgetRow ? floatval($catBudgetRow['total_budget']) : 0;

    $currentAllocQuery = "SELECT SUM(allocation_amount) as total FROM sub_categories WHERE category_id = $catId";
    $currentAllocRes = mysqli_query($conn, $currentAllocQuery);
    $currentAllocRow = mysqli_fetch_assoc($currentAllocRes);
    $alreadyAllocated = $currentAllocRow ? floatval($currentAllocRow['total']) : 0;

    if ($alreadyAllocated + $amount > $parentTotalBudget) {
        if ($parentTotalBudget <= 0) {
            sendResponse(false, "Budget Error: This category has 0.00 total budget. Please edit the category to add funds before adding sub-categories.");
            return;
        }
        $remaining = $parentTotalBudget - $alreadyAllocated;
        sendResponse(false, "Budget Overlap! Only " . number_format($remaining, 2) . " remains in this category. (Attempted: " . number_format($amount, 2) . ")");
        return;
    }

    $query = "INSERT INTO sub_categories (category_id, department_id, fiscal_year_id, name, allocation_amount, remaining_budget, created_at) 
              VALUES ($catId, $deptId, $fiscalYearId, '$name', $amount, $amount, NOW())";
    
    if (mysqli_query($conn, $query)) {
        sendResponse(true, 'Sub-category created successfully');
    } else {
        sendResponse(false, 'Database Error: ' . mysqli_error($conn));
    }
}

/**
 * Update existing sub-category
 */
function updateSubcategory($conn, $data) {
    $id = isset($data['id']) ? intval($data['id']) : 0;
    $categoryId = isset($data['category_id']) ? intval($data['category_id']) : 0;
    $name = isset($data['name']) ? mysqli_real_escape_string($conn, trim($data['name'])) : '';
    $amount = isset($data['allocation_amount']) ? floatval($data['allocation_amount']) : 0;
    $description = isset($data['description']) ? mysqli_real_escape_string($conn, trim($data['description'])) : '';
    
    if ($id <= 0) {
        sendResponse(false, 'Invalid sub-category ID');
        return;
    }
    
    if (empty($name)) {
        sendResponse(false, 'Sub-category name is required');
        return;
    }
    
    if ($amount < 0) {
        sendResponse(false, 'Allocation amount must be greater than or equal to 0');
        return;
    }
    
    // Check if name is taken by another sub-category in the same category, dept, and year
    // Since sub_categories are already linked to category_id, we just need to ensure the check is category-scoped.
    $checkQuery = "SELECT id FROM sub_categories WHERE category_id = $categoryId AND name = '$name' AND id != $id";
    $checkResult = mysqli_query($conn, $checkQuery);
    
    if (mysqli_num_rows($checkResult) > 0) {
        sendResponse(false, 'Another sub-category with this name already exists in this category');
        return;
    }
    
    // Get current values to calculate the difference
    $getCurrentQuery = "SELECT allocation_amount, remaining_budget FROM sub_categories WHERE id = $id";
    $getCurrentResult = mysqli_query($conn, $getCurrentQuery);
    $current = mysqli_fetch_assoc($getCurrentResult);
    
    if (!$current) {
        sendResponse(false, 'Sub-category not found');
        return;
    }
    
    // Check if new amount exceeds parent category total
    $catBudgetQuery = "SELECT total_budget FROM categories WHERE id = $categoryId";
    $catBudgetRes = mysqli_query($conn, $catBudgetQuery);
    $catBudgetRow = mysqli_fetch_assoc($catBudgetRes);
    $parentTotalBudget = $catBudgetRow ? floatval($catBudgetRow['total_budget']) : 0;

    $otherSubQuery = "SELECT SUM(allocation_amount) as total FROM sub_categories WHERE category_id = $categoryId AND id != $id";
    $otherSubRes = mysqli_query($conn, $otherSubQuery);
    $otherSubRow = mysqli_fetch_assoc($otherSubRes);
    $othersAllocated = $otherSubRow ? floatval($otherSubRow['total']) : 0;

    if ($othersAllocated + $amount > $parentTotalBudget) {
        if ($parentTotalBudget <= 0) {
            sendResponse(false, "Budget Error: This category has 0.00 total budget. Please edit the category to add funds.");
            return;
        }
        $remaining = $parentTotalBudget - $othersAllocated;
        sendResponse(false, "Budget Overlap! Only " . number_format($remaining, 2) . " remains in this category. (Attempted total for category: " . number_format($othersAllocated + $amount, 2) . ")");
        return;
    }

    // Calculate how much the allocation changed
    $oldAllocation = floatval($current['allocation_amount']);
    $oldRemaining = floatval($current['remaining_budget']);
    $difference = $amount - $oldAllocation;
    
    // Update remaining_budget proportionally
    $newRemaining = $oldRemaining + $difference;
    
    // Make sure remaining doesn't go negative
    if ($newRemaining < 0) {
        $newRemaining = 0;
    }
    
    $query = "UPDATE sub_categories 
              SET name = '$name', 
                  allocation_amount = $amount,
                  remaining_budget = $newRemaining,
                  description = '$description',
                  updated_at = NOW() 
              WHERE id = $id";
    
    if (mysqli_query($conn, $query)) {
        if (mysqli_affected_rows($conn) >= 0) {
            sendResponse(true, 'Sub-category updated successfully', [
                'id' => $id,
                'name' => $name,
                'allocation_amount' => $amount,
                'remaining_budget' => $newRemaining,
                'description' => $description
            ]);
        } else {
            sendResponse(false, 'No changes made or sub-category not found');
        }
    } else {
        sendResponse(false, 'Failed to update sub-category: ' . mysqli_error($conn));
    }
}

/**
 * Delete sub-category
 */
function deleteSubcategory($conn, $data) {
    $id = isset($data['id']) ? intval($data['id']) : 0;
    
    if ($id <= 0) {
        sendResponse(false, 'Invalid sub-category ID');
        return;
    }
    
    $query = "DELETE FROM sub_categories WHERE id = $id";
    
    if (mysqli_query($conn, $query)) {
        if (mysqli_affected_rows($conn) > 0) {
            sendResponse(true, 'Sub-category deleted successfully');
        } else {
            sendResponse(false, 'Sub-category not found');
        }
    } else {
        sendResponse(false, 'Failed to delete sub-category: ' . mysqli_error($conn));
    }
}

/**
 * Reset sub-category budget (set remaining_budget back to allocation_amount)
 */
function resetSubcategoryBudget($conn, $data) {
    $id = isset($data['id']) ? intval($data['id']) : 0;
    
    if ($id <= 0) {
        sendResponse(false, 'Invalid sub-category ID');
        return;
    }
    
    // Get the allocation amount
    $query = "SELECT allocation_amount, name FROM sub_categories WHERE id = $id";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        sendResponse(false, 'Query failed: ' . mysqli_error($conn));
        return;
    }
    
    $subcategory = mysqli_fetch_assoc($result);
    
    if (!$subcategory) {
        sendResponse(false, 'Sub-category not found');
        return;
    }
    
    $allocationAmount = floatval($subcategory['allocation_amount']);
    $name = $subcategory['name'];
    
    // Reset remaining_budget to allocation_amount
    $updateQuery = "UPDATE sub_categories SET remaining_budget = allocation_amount WHERE id = $id";
    
    if (mysqli_query($conn, $updateQuery)) {
        if (mysqli_affected_rows($conn) >= 0) {
            sendResponse(true, "Budget reset for '$name' - Remaining budget set to " . number_format($allocationAmount, 2), [
                'id' => $id,
                'allocation_amount' => $allocationAmount,
                'remaining_budget' => $allocationAmount
            ]);
        } else {
            sendResponse(false, 'No changes made');
        }
    } else {
        sendResponse(false, 'Failed to reset budget: ' . mysqli_error($conn));
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Send JSON response
 */
function sendResponse($success, $message, $data = []) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response);
    exit();
}
?>