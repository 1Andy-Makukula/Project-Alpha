// components/ReceiptModal.tsx
import React, { useState, useEffect } from 'react';
// import { DownloadIcon } from '@heroicons/react/24/outline'; // Example icon

interface ReceiptData {
    receiptId: string;
    date: string;
    shopName: string;
    items: { name: string; quantity: number; price: string; lineTotal: string }[];
    summary: { subtotal: string; kithlyFee: string; totalPaid: string; netShopPayout: string; currency: string };
}

export const ReceiptModal: React.FC<{ orderId: string; onClose: () => void }> = ({ orderId, onClose }) => {
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const response = await fetch(`/api/orders/receipt?orderId=${orderId}`);
                if (!response.ok) throw new Error('Failed to fetch receipt');
                setReceipt(await response.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [orderId]);

    const handleDownload = () => {
        if (!receipt) return;
        const receiptText = generateTextReceipt(receipt);
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kithly_receipt_${orderId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div>Loading receipt...</div>;
    if (!receipt) return <div>Could not load receipt data.</div>;

    const generateTextReceipt = (r: ReceiptData) => {
        let text = `--- KithLy Secure Receipt ---\n`;
        text += `Order ID: ${r.receiptId}\n`;
        text += `Date: ${new Date(r.date).toLocaleDateString()}\n`;
        text += `Shop: ${r.shopName}\n\n`;
        text += `ITEMS:\n`;
        r.items.forEach(item => {
            text += `${item.quantity} x ${item.name} @ ${r.summary.currency} ${item.price} = ${r.summary.currency} ${item.lineTotal}\n`;
        });
        text += `\nSUMMARY:\n`;
        text += `Subtotal: ${r.summary.currency} ${r.summary.subtotal}\n`;
        text += `KithLy Fee: ${r.summary.currency} ${r.summary.kithlyFee} (0% Promo Rate)\n`;
        text += `--------------------------\n`;
        text += `TOTAL PAID: ${r.summary.currency} ${r.summary.totalPaid}\n`;
        text += `Shop Net Payout: ${r.summary.currency} ${r.summary.netShopPayout}\n`;
        text += `--- End of Receipt ---`;
        return text;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold border-b pb-2 mb-4">Official KithLy Receipt</h2>
                <div className="space-y-1 text-sm">
                    <p><strong>Shop:</strong> {receipt.shopName}</p>
                    <p><strong>Order ID:</strong> {receipt.receiptId}</p>
                    <p><strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}</p>
                    <h3 className="mt-4 font-semibold">Items Purchased:</h3>
                    {receipt.items.map((item, index) => (
                        <div key={index} className="flex justify-between border-b border-dashed">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{receipt.summary.currency} {item.lineTotal}</span>
                        </div>
                    ))}
                    <div className="pt-4 space-y-1">
                        <p className="flex justify-between"><span>Subtotal:</span> <span>{receipt.summary.currency} {receipt.summary.subtotal}</span></p>
                        <p className="flex justify-between text-green-600"><span>KithLy Fee (0% Promo):</span> <span>{receipt.summary.currency} {receipt.summary.kithlyFee}</span></p>
                        <p className="flex justify-between font-bold text-lg"><span>TOTAL PAID:</span> <span>{receipt.summary.currency} {receipt.summary.totalPaid}</span></p>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="w-full mt-6 p-3 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600"
                >
                    {/* <DownloadIcon className="w-5 h-5 mr-2" /> */}
                    Download Receipt (.txt)
                </button>
                <button onClick={onClose} className="w-full mt-2 p-2 text-sm text-gray-600">Close</button>
            </div>
        </div>
    );
};
