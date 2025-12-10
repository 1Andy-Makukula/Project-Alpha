
const sendToBackend = async (endpoint: string, payload: any) => {
    console.log(`[Simulating Backend Call] POST /api/${endpoint}`, payload);
    await new Promise(r => setTimeout(r, 500));
    return true;
};

export const notify = {
    sendSMS: async (phoneNumber: string, orderCode: string, shopName: string) => {
        return sendToBackend('notifications/sms', {
            to: phoneNumber,
            message: `You have a gift at ${shopName}! Code: ${orderCode}. Collect it anytime.`
        });
    },

    sendWhatsApp: async (phoneNumber: string, template: string, params: any) => {
        return sendToBackend('notifications/whatsapp', {
            to: phoneNumber,
            template: template,
            params: params
        });
    }
};
