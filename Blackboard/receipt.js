const pageLoader = document.getElementById("pageLoader");
const receiptDetails = document.getElementById("receiptDetails");
const printReceiptBtn = document.getElementById("printReceiptBtn");

function hidePageLoader() {
  if (!pageLoader) return;
  setTimeout(() => pageLoader.classList.add("hidden"), 350);
}

function formatMoney(amount) {
  return `₱${Number(amount || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getOrderId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("orderId");
}

function getLoggedInUserLocal() {
  return JSON.parse(localStorage.getItem("blackboardUser"));
}

function renderReceipt() {
  const orderId = getOrderId();
  const orders = JSON.parse(localStorage.getItem("blackboardOrders")) || [];
  const user = getLoggedInUserLocal();
  const order = orders.find(item => item.orderId === orderId);

  if (!order) {
    receiptDetails.innerHTML = `<p>Receipt not found.</p>`;
    hidePageLoader();
    return;
  }

  if (user && user.role !== "admin" && order.username !== user.username) {
    receiptDetails.innerHTML = `<p>You can only view receipts for your own orders.</p>`;
    hidePageLoader();
    return;
  }

  const rows = order.items.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}<br><small>${escapeHtml(item.selectedVariation || "Standard")}</small></td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.quantity}</td>
      <td>${formatMoney(item.price)}</td>
      <td>${formatMoney(Number(item.price) * Number(item.quantity))}</td>
    </tr>
  `).join("");

  receiptDetails.innerHTML = `
    <div class="receipt-meta-grid">
      <div><strong>Order No.</strong><span>${escapeHtml(order.orderId)}</span></div>
      <div><strong>Date</strong><span>${new Date(order.date).toLocaleString()}</span></div>
      <div><strong>Status</strong><span>${escapeHtml(order.status || "Pending")}</span></div>
      <div><strong>Payment</strong><span>${escapeHtml(order.paymentMethod)}</span></div>
    </div>

    <div class="receipt-customer-box">
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>
      <p><strong>Address:</strong> ${escapeHtml(order.deliveryAddress)}</p>
    </div>

    <table class="receipt-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Category</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="receipt-total-box">
      <div><span>Subtotal</span><strong>${formatMoney(order.subtotal || order.totalPrice)}</strong></div>
      <div><span>Discount ${order.discountCode ? `(${escapeHtml(order.discountCode)})` : ""}</span><strong>-${formatMoney(order.discountAmount || 0)}</strong></div>
      <div><span>Shipping</span><strong>${formatMoney(order.shippingFee || 0)}</strong></div>
      <div class="receipt-grand-total"><span>Total</span><strong>${formatMoney(order.totalPrice)}</strong></div>
    </div>

    <p class="checkout-note receipt-note">Thank you for shopping with The Blackboard.</p>
  `;

  hidePageLoader();
}

if (printReceiptBtn) {
  printReceiptBtn.addEventListener("click", () => window.print());
}

renderReceipt();
