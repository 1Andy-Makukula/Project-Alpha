
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as twilio from 'twilio';

admin.initializeApp();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const onOrderPaid = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (newData.status === 'paid' && oldData.status !== 'paid') {
            const message = `You have a gift! Collect at ${newData.shopName}. Code: ${newData.collectionCode}.`;
            try {
                await client.messages.create({
                    to: newData.recipient.phone,
                    from: twilioPhoneNumber,
                    body: message,
                });
                console.log('SMS sent successfully');
            } catch (error) {
                console.error('Error sending SMS:', error);
            }
        }
    });

export const flutterwaveWebhook = functions.https.onRequest(async (request, response) => {
    const secretHash = process.env.FLUTTERWAVE_VERIF_HASH;
    const signature = request.headers["verif-hash"];

    if (!signature || (signature !== secretHash)) {
        response.status(401).end();
        return;
    }

    const payload = request.body;

    if (payload.status === 'successful') {
        const orderId = payload.tx_ref;
        const orderRef = admin.firestore().collection('orders').doc(orderId);
        const order = await orderRef.get();

        if (order.exists && order.data()?.total === payload.amount) {
            const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
            const collectionCode = `KLY${randomPart}`;

            await orderRef.update({
                status: 'paid',
                collectionCode: collectionCode,
                paidOn: new Date().toISOString(),
            });
        }
    }

    response.status(200).end();
});

export const setShopOwnerClaim = functions.auth.user().onCreate(async (user) => {
    if (user.email) {
        const shopsRef = admin.firestore().collection('shops');
        const snapshot = await shopsRef.where('email', '==', user.email).get();
        if (!snapshot.empty) {
            await admin.auth().setCustomUserClaims(user.uid, { shopOwner: true });
        }
    }
});
