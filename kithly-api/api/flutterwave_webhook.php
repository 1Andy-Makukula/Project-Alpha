<?php
require_once '../config/db.php';
// Webhooks might come from external servers so CORS might be less relevant, but good to have
enable_cors();

// Verify Flutterwave Signature (Simplified for MVP)
// In production, verify the header 'verif-hash' matches your secret hash.

$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($data['event']) && $data['event'] == 'charge.completed') {
    // Assuming tx_ref correlates to order_id or we pass order_id in meta
    // For this MVP, let's assume tx_ref is "kithly_order_{order_id}"

    $tx_ref = $data['data']['tx_ref'];
    $parts = explode('_', $tx_ref);
    $order_id = end($parts); // Get the last part

    if ($data['data']['status'] == 'successful') {
        // Generate Collection Token
        $collection_token = bin2hex(random_bytes(4)); // 8 char token

        try {
            $stmt = $pdo->prepare("UPDATE orders SET status = 'Paid', collection_token = ? WHERE id = ?");
            $stmt->execute([$collection_token, $order_id]);
            http_response_code(200);
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            http_response_code(500);
            error_log($e->getMessage());
        }
    }
} else {
    // Respond OK to avoid retries if event is not relevant
    http_response_code(200);
}
?>
