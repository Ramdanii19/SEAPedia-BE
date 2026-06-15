import { DELIVERY_FEE, PPN_RATE } from "../constants/config.js";

/**
 * PPN dihitung dari (subtotal - discountAmount), bukan dari subtotal penuh.
 * Artinya diskon diberikan sebelum pajak — buyer hanya kena PPN atas nilai neto.
 * Jika bisnis berubah (PPN dihitung dari subtotal bruto), cukup ubah basis ppnAmount di sini.
 */
export function calculateOrderTotals({ items, deliveryMethod, discount = 0 }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = DELIVERY_FEE[deliveryMethod];
  const discountAmount = discount;
  const ppnAmount = Math.round((subtotal - discountAmount) * PPN_RATE);
  const finalTotal = subtotal - discountAmount + deliveryFee + ppnAmount;

  return { subtotal, deliveryFee, discountAmount, ppnAmount, finalTotal };
}
