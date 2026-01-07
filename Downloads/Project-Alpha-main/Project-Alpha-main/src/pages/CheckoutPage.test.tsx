import { render, screen } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import '@testing-library/jest-dom';

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

  it('calculates the total correctly', () => {
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

    expect(screen.getByText(`ZMK ${total.toFixed(2)}`)).toBeInTheDocument();
  });
});
