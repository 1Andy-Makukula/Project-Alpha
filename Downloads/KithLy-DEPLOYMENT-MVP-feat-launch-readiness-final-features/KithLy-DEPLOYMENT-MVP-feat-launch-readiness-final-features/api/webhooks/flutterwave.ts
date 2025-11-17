import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { NextRequest } from 'next/server';
import { Twilio } from 'twilio';

// Initialize Twilio client
const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the webhook is from Flutterwave
    const hash = request.headers.get('verif-hash');
    if (!hash || hash !== process.env.FLUTTERWAVE_VERIF_HASH) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Get payment data
    const payload = await request.json();

    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const order_id = payload.data.meta.order_id;

      // 3. Update the order in the database
      const { rows } = await sql`
        UPDATE Orders
        SET status = 'paid'
        WHERE id = ${order_id} AND status = 'pending'
        RETURNING id, shop_id, buyer_user_id, pickup_code;
      `;

      // 4. Send SMS via Twilio (ACTIVATED)
      if (rows.length > 0) {
        const order = rows[0];

        // Fetch phone numbers
        const shopUserResult = await sql`
          SELECT u.phone
          FROM Users u
          JOIN Shops s ON u.id = s.owner_user_id
          WHERE s.id = ${order.shop_id} LIMIT 1;
        `;
        const buyerUserResult = await sql`SELECT phone FROM Users WHERE id = ${order.buyer_user_id} LIMIT 1;`;

        const shopPhoneNumber = shopUserResult.rows[0]?.phone;
        const buyerPhoneNumber = buyerUserResult.rows[0]?.phone;

        // Send to Shop
        if (shopPhoneNumber) {
          await twilioClient.messages.create({
            body: `New KithLy Order! Order ID ${order.id.substring(0, 8)} is paid. Pickup Code: ${order.pickup_code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: shopPhoneNumber, // Ensure this is in E.164 format
          });
        }

        // Send to Buyer/Recipient
        if (buyerPhoneNumber) {
          await twilioClient.messages.create({
            body: `Your KithLy Order ${order.id.substring(0, 8)} is confirmed! Your Secure Pickup Code: ${order.pickup_code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: buyerPhoneNumber, // Ensure this is in E.164 format
          });
        }
      }
    }

    return jsonResponse({ received: true });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return errorResponse(error.message, 500);
  }
}
