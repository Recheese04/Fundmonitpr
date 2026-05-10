<?php
$conn = mysqli_connect("localhost", "root", "", "fundmonitor_db");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

$queries = [
    "ALTER TABLE departments ADD PRIMARY KEY (id)",
    "ALTER TABLE departments MODIFY id INT(11) NOT NULL AUTO_INCREMENT",

    "ALTER TABLE users ADD PRIMARY KEY (id)",
    "ALTER TABLE users MODIFY id INT(11) NOT NULL AUTO_INCREMENT",

    "ALTER TABLE budgets ADD PRIMARY KEY (id)",
    "ALTER TABLE budgets MODIFY id INT(11) NOT NULL AUTO_INCREMENT",

    "ALTER TABLE expense_categories ADD PRIMARY KEY (id)",
    "ALTER TABLE expense_categories MODIFY id INT(11) NOT NULL AUTO_INCREMENT",

    "ALTER TABLE main_funds ADD PRIMARY KEY (id)",
    "ALTER TABLE main_funds MODIFY id INT(11) NOT NULL AUTO_INCREMENT",

    "ALTER TABLE users ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE",

    "ALTER TABLE budgets ADD CONSTRAINT fk_budget_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE budgets ADD CONSTRAINT fk_budget_fiscal_year FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id) ON DELETE SET NULL ON UPDATE CASCADE",

    "ALTER TABLE categories ADD CONSTRAINT fk_category_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE categories ADD CONSTRAINT fk_category_fiscal_year FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id) ON DELETE SET NULL ON UPDATE CASCADE",

    "ALTER TABLE sub_categories ADD CONSTRAINT fk_subcat_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE sub_categories ADD CONSTRAINT fk_subcat_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE sub_categories ADD CONSTRAINT fk_subcat_fiscal_year FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id) ON DELETE SET NULL ON UPDATE CASCADE",

    "ALTER TABLE expenses ADD CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE expenses ADD CONSTRAINT fk_expense_subcategory FOREIGN KEY (subcategory_id) REFERENCES sub_categories(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE expenses ADD CONSTRAINT fk_expense_fiscal_year FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id) ON DELETE SET NULL ON UPDATE CASCADE"
];

$successCount = 0;
foreach ($queries as $q) {
    if (mysqli_query($conn, $q)) {
        echo "SUCCESS: $q\n";
        $successCount++;
    } else {
        echo "FAILED: $q\nERROR: " . mysqli_error($conn) . "\n";
    }
}
echo "\nTotal successful queries: $successCount / " . count($queries) . "\n";
?>
