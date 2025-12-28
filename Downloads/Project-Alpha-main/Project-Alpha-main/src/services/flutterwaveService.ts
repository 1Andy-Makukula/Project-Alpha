

import { useFlutterwave } from 'flutterwave-react-v3';

/**
 * Interface for Flutterwave configuration
 */
export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: any) => void;
  onClose: () => void;
}

/**
 * Service to handle Flutterwave payments
 */
export const useFlutterwavePayment = (config: FlutterwaveConfig) => {
  const handlePayment = useFlutterwave({
    public_key: config.public_key,
    tx_ref: config.tx_ref,
    amount: config.amount,
    currency: config.currency,
    payment_options: config.payment_options,
    customer: {
      email: config.customer.email,
      phonenumber: config.customer.phone_number,
      name: config.customer.name,
    },
    customizations: config.customizations,
  });

  return {
    handlePayment: () => {
      handlePayment({
        callback: (response) => {
          config.callback(response);
          // Modal closes automatically after callback
        },
        onClose: () => {
          config.onClose();
        },
      });
    }
  };
};
