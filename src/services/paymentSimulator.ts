
// Simulator for payment scenarios

export const paymentSimulator = {
    simulateSuccess: () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ status: 'successful', tx_ref: 'sim_' + Date.now() }), 2000);
        });
    },

    simulateFailure: () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Payment Failed')), 2000);
        });
    }
};
