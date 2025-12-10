import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../components/OrderCard';

export const generateReceipt = (order: Order) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(248, 90, 71); // Kithly Primary Color
  doc.text('KithLy', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Order Receipt', 14, 28);

  // Order Info
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Order ID: ${order.id}`, 14, 40);
  doc.text(`Date: ${new Date(order.paidOn).toLocaleDateString()}`, 14, 45);
  doc.text(`Shop: ${order.shopName}`, 14, 50);
  doc.text(`Recipient: ${order.customerName}`, 14, 55);

  // Table of Items
  const tableBody = order.items.map(item => [
    item.name,
    item.quantity.toString(),
    `ZMK ${item.price.toFixed(2)}`,
    `ZMK ${(item.price * item.quantity).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [248, 90, 71] }, // Kithly Orange
  });

  // Total
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Paid: ZMK ${order.total.toFixed(2)}`, 14, finalY);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for using KithLy to support your loved ones.', 14, finalY + 20);
  doc.text('www.kithly.com', 14, finalY + 25);

  // Download
  doc.save(`Kithly-Receipt-${order.id}.pdf`);
};