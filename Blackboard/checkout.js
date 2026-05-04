const pageLoader = document.getElementById("pageLoader");
let checkoutCart = JSON.parse(localStorage.getItem("blackboardCart")) || [];
let orders = JSON.parse(localStorage.getItem("blackboardOrders")) || [];
let discountCodes = JSON.parse(localStorage.getItem("blackboardDiscountCodes")) || [];
let appliedDiscount = null;

const checkoutItems = document.getElementById("checkoutItems");
const summaryItems = document.getElementById("summaryItems");
const summaryTotal = document.getElementById("summaryTotal");
const checkoutForm = document.getElementById("checkoutForm");
const cardFields = document.getElementById("cardFields");
const gcashFields = document.getElementById("gcashFields");
const orderModal = document.getElementById("orderModal");
const orderMessage = document.getElementById("orderMessage");
const checkoutDiscountCode = document.getElementById("checkoutDiscountCode");
const applyDiscountBtn = document.getElementById("applyDiscountBtn");
const removeDiscountBtn = document.getElementById("removeDiscountBtn");
const discountMessage = document.getElementById("discountMessage");
const summarySubtotal = document.getElementById("summarySubtotal");
const discountSummaryRow = document.getElementById("discountSummaryRow");
const summaryDiscountCode = document.getElementById("summaryDiscountCode");
const summaryDiscount = document.getElementById("summaryDiscount");

const DEFAULT_STOCK = 10;

function hidePageLoader() {
  if (!pageLoader) return;
  setTimeout(() => pageLoader.classList.add("hidden"), 350);
}

function formatMoney(amount) {
  return `₱${Number(amount).toFixed(2)}`;
}

function normalizeDiscountCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function showDiscountMessage(message, type = "success") {
  if (!discountMessage) return;
  discountMessage.textContent = message;
  discountMessage.classList.remove("hidden", "discount-success", "discount-error");
  discountMessage.classList.add(type === "error" ? "discount-error" : "discount-success");
}

function clearDiscountMessage() {
  if (!discountMessage) return;
  discountMessage.textContent = "";
  discountMessage.classList.add("hidden");
  discountMessage.classList.remove("discount-success", "discount-error");
}

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("blackboardUser"));
}

function getCheckoutTotals() {
  let totalItems = 0;
  let subtotal = 0;

  checkoutCart.forEach(item => {
    totalItems += item.quantity;
    subtotal += item.price * item.quantity;
  });

  const discountPercent = appliedDiscount ? Number(appliedDiscount.percent) : 0;
  const discountAmount = Math.min(subtotal, subtotal * (discountPercent / 100));
  const totalPrice = Math.max(0, subtotal - discountAmount);

  return { totalItems, subtotal, discountPercent, discountAmount, totalPrice };
}

function displayCheckoutItems() {
  checkoutItems.innerHTML = "";

  if (checkoutCart.length === 0) {
    checkoutItems.innerHTML = `
      <p>Your cart is empty.</p>
      <a href="index.html" class="place-order-btn empty-cart-btn">Go back to shop</a>
    `;
    checkoutForm.classList.add("hidden");
    summaryItems.textContent = 0;
    if (summarySubtotal) summarySubtotal.textContent = formatMoney(0);
    if (discountSummaryRow) discountSummaryRow.classList.add("hidden");
    summaryTotal.textContent = formatMoney(0);
    return;
  }

  checkoutCart.forEach(item => {
    const row = document.createElement("div");
    row.classList.add("checkout-item");
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <small>Qty: ${item.quantity} × ${formatMoney(item.price)}</small>
        <small>Stock before order: ${item.stock ?? DEFAULT_STOCK}</small>
      </div>
      <strong>${formatMoney(item.quantity * item.price)}</strong>
    `;
    checkoutItems.appendChild(row);
  });

  updateOrderSummary();
}

function updateOrderSummary() {
  const { totalItems, subtotal, discountAmount, totalPrice } = getCheckoutTotals();

  summaryItems.textContent = totalItems;
  if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
  summaryTotal.textContent = formatMoney(totalPrice);

  if (discountSummaryRow && summaryDiscount && summaryDiscountCode) {
    if (appliedDiscount && discountAmount > 0) {
      discountSummaryRow.classList.remove("hidden");
      summaryDiscountCode.textContent = `${appliedDiscount.code} (${appliedDiscount.percent}% off)`;
      summaryDiscount.textContent = `-${formatMoney(discountAmount)}`;
    } else {
      discountSummaryRow.classList.add("hidden");
      summaryDiscountCode.textContent = "";
      summaryDiscount.textContent = `-${formatMoney(0)}`;
    }
  }

  if (removeDiscountBtn) {
    removeDiscountBtn.classList.toggle("hidden", !appliedDiscount);
  }
}

function applyDiscountCode() {
  const code = normalizeDiscountCode(checkoutDiscountCode ? checkoutDiscountCode.value : "");

  if (!code) {
    showDiscountMessage("Please enter a discount code.", "error");
    return;
  }

  discountCodes = JSON.parse(localStorage.getItem("blackboardDiscountCodes")) || [];
  const matchedDiscount = discountCodes.find(discount => discount.code === code);

  if (!matchedDiscount) {
    appliedDiscount = null;
    updateOrderSummary();
    showDiscountMessage("Invalid discount code.", "error");
    return;
  }

  appliedDiscount = matchedDiscount;
  if (checkoutDiscountCode) checkoutDiscountCode.value = matchedDiscount.code;
  updateOrderSummary();
  showDiscountMessage(`${matchedDiscount.code} applied. You saved ${matchedDiscount.percent}% off.`);
}

function removeDiscountCode() {
  appliedDiscount = null;
  if (checkoutDiscountCode) checkoutDiscountCode.value = "";
  clearDiscountMessage();
  updateOrderSummary();
}

function updatePaymentFields() {
  const paymentMethod = document.querySelector("input[name='paymentMethod']:checked").value;

  cardFields.classList.toggle("hidden", paymentMethod !== "Debit/Credit Card");
  gcashFields.classList.toggle("hidden", paymentMethod !== "GCash");
}

function requireField(field, message) {
  if (!field.value.trim()) {
    alert(message);
    field.focus();
    return false;
  }
  return true;
}

function validatePaymentDetails(paymentMethod) {
  if (paymentMethod === "Debit/Credit Card") {
    return (
      requireField(document.getElementById("cardNumber"), "Please enter your card number.") &&
      requireField(document.getElementById("cardExpiry"), "Please enter the card expiry date.") &&
      requireField(document.getElementById("cardCvv"), "Please enter the card CVV.")
    );
  }

  if (paymentMethod === "GCash") {
    return (
      requireField(document.getElementById("gcashNumber"), "Please enter your GCash number.") &&
      requireField(document.getElementById("gcashReference"), "Please enter your GCash reference number.")
    );
  }

  return true;
}

function getCurrentStoredStock(item, productEdits, addedProducts) {
  const savedEdit = productEdits[item.id];
  if (savedEdit && savedEdit.stock !== undefined) {
    return Number(savedEdit.stock);
  }

  const addedProduct = addedProducts.find(product => product.id === item.id);
  if (addedProduct && addedProduct.stock !== undefined) {
    return Number(addedProduct.stock);
  }

  if (item.stock !== undefined) {
    return Number(item.stock);
  }

  return DEFAULT_STOCK;
}

function hasEnoughStock() {
  const productEdits = JSON.parse(localStorage.getItem("blackboardProductEdits")) || {};
  const addedProducts = JSON.parse(localStorage.getItem("blackboardAddedProducts")) || [];

  for (const item of checkoutCart) {
    const currentStock = getCurrentStoredStock(item, productEdits, addedProducts);
    if (item.quantity > currentStock) {
      alert(`${item.name} only has ${currentStock} stock left. Please update your cart.`);
      return false;
    }
  }

  return true;
}

function reduceStockAfterOrder() {
  const productEdits = JSON.parse(localStorage.getItem("blackboardProductEdits")) || {};
  const addedProducts = JSON.parse(localStorage.getItem("blackboardAddedProducts")) || [];

  checkoutCart.forEach(item => {
    const currentStock = getCurrentStoredStock(item, productEdits, addedProducts);
    const newStock = Math.max(0, currentStock - item.quantity);

    productEdits[item.id] = {
      ...productEdits[item.id],
      stock: newStock
    };

    const addedProduct = addedProducts.find(product => product.id === item.id);
    if (addedProduct) {
      addedProduct.stock = newStock;
    }
  });

  localStorage.setItem("blackboardProductEdits", JSON.stringify(productEdits));
  localStorage.setItem("blackboardAddedProducts", JSON.stringify(addedProducts));
}

function saveOrder(paymentMethod) {
  const user = getLoggedInUser();
  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerEmail = document.getElementById("customerEmail").value.trim();
  const deliveryAddress = document.getElementById("deliveryAddress").value.trim();
  const { totalItems, subtotal, discountPercent, discountAmount, totalPrice } = getCheckoutTotals();
  const orderId = `BB-${Date.now()}`;

  const order = {
    orderId,
    date: new Date().toISOString(),
    username: user ? user.username : "guest",
    accountName: user ? user.name : "Guest",
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    paymentMethod,
    status: "Pending",
    statusUpdatedAt: new Date().toISOString(),
    totalItems,
    subtotal,
    discountCode: appliedDiscount ? appliedDiscount.code : "",
    discountPercent,
    discountAmount,
    totalPrice,
    items: checkoutCart.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }))
  };

  orders.push(order);
  localStorage.setItem("blackboardOrders", JSON.stringify(orders));
  return order;
}

if (applyDiscountBtn) {
  applyDiscountBtn.addEventListener("click", applyDiscountCode);
}

if (removeDiscountBtn) {
  removeDiscountBtn.addEventListener("click", removeDiscountCode);
}

if (checkoutDiscountCode) {
  checkoutDiscountCode.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyDiscountCode();
    }
  });
}

document.querySelectorAll("input[name='paymentMethod']").forEach(option => {
  option.addEventListener("change", updatePaymentFields);
});

checkoutForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (checkoutCart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const paymentMethod = document.querySelector("input[name='paymentMethod']:checked").value;

  if (!validatePaymentDetails(paymentMethod)) return;
  if (!hasEnoughStock()) return;

  const order = saveOrder(paymentMethod);
  reduceStockAfterOrder();

  const discountText = order.discountCode ? ` Discount applied: ${order.discountCode} saved ${formatMoney(order.discountAmount)}.` : "";
  orderMessage.textContent = `Thank you, ${order.customerName}. Your order number is ${order.orderId}. Your order total is ${formatMoney(order.totalPrice)} using ${paymentMethod}.${discountText}`;
  orderModal.classList.remove("hidden");

  localStorage.removeItem("blackboardCart");
  checkoutCart = [];
});

updatePaymentFields();
displayCheckoutItems();
updateOrderSummary();
hidePageLoader();
