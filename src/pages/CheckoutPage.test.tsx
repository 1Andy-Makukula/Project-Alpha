import { render, screen } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import '@testing-library/jest-dom';

// Mock services to prevent real Firebase/Network calls
jest.mock('../services/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('../services/firestoreShopsService', () => ({
  firestoreShopsService: {
    getById: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Shop 1',
      category: 'Retail',
      openingHours: '08:00 - 18:00',
    }),
  },
}));

jest.mock('../services/flutterwaveService', () => ({
  useFlutterwavePayment: jest.fn().mockReturnValue({
    handlePayment: jest.fn(),
  }),
}));

describe('CheckoutPage', () => {
  const cart = [
    {
      product: {
        id: 1,
        name: 'Product 1',
        price: 10,
        image: '',
        category: '',
        stock: 10,
      },
      quantity: 1,
      shopId: 1,
      shopName: 'Shop 1',
    },
    {
      product: {
        id: 2,
        name: 'Product 2',
        price: 20,
        image: '',
        category: '',
        stock: 10,
      },
      quantity: 2,
      shopId: 1,
      shopName: 'Shop 1',
    },
  ];

  it('calculates the total correctly', async () => {
    render(
      <CheckoutPage
        setView={() => {}}
        cart={cart}
        onCheckout={() => {}}
        showToast={() => {}}
      />
    );

    const subtotal = 10 + 20 * 2;
    const kithlyFee = subtotal * 0.05;
    const processingFee = (subtotal + kithlyFee) * 0.029;
    const total = subtotal + kithlyFee + processingFee;

    // Use findByText to wait for any async renders if needed (though calculation is sync)
    // The total is rendered as "ZMK {total.toFixed(2)}"
    // Note: The component might calculate slightly differently due to float precision, so strict check is good but be careful.
    expect(await screen.findByText(`ZMK ${total.toFixed(2)}`)).toBeInTheDocument();
  });
});
