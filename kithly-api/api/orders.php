<?php
require_once '../config/db.php';
enable_cors();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new order
    $data = json_decode(file_get_contents('php://input'), true);

    $buyer_id = $data['buyer_id'] ?? null;
    $shop_id = $data['shop_id'] ?? null;
    $recipient_phone = $data['recipient_phone'] ?? null;
    $total_amount = $data['total_amount'] ?? null;

    if (!$buyer_id || !$shop_id || !$total_amount) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO orders (buyer_id, shop_id, recipient_phone, total_amount, status) VALUES (?, ?, ?, ?, 'Pending')");
        $stmt->execute([$buyer_id, $shop_id, $recipient_phone, $total_amount]);
        $order_id = $pdo->lastInsertId();
        echo json_encode(['id' => $order_id, 'status' => 'Pending']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check order status
    $order_id = $_GET['id'] ?? null;
    if (!$order_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();

        if ($order) {
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
