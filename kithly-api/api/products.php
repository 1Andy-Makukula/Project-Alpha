<?php
require_once '../config/db.php';
enable_cors();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $shop_id = $_GET['shop_id'] ?? null;

    if (!$shop_id) {
        http_response_code(400);
        echo json_encode(['error' => 'shop_id is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE shop_id = ?");
        $stmt->execute([$shop_id]);
        $products = $stmt->fetchAll();
        echo json_encode($products);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
