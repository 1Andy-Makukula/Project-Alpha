<?php
require_once '../config/db.php';
enable_cors();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM shops WHERE verified_status = 1");
        $shops = $stmt->fetchAll();
        echo json_encode($shops);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
