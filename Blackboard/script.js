let baseProducts = [];
let products = [];
let cart = JSON.parse(localStorage.getItem("blackboardCart")) || [];
let addedProducts = JSON.parse(localStorage.getItem("blackboardAddedProducts")) || [];
let addedCategories = JSON.parse(localStorage.getItem("blackboardAddedCategories")) || [];
let productEdits = JSON.parse(localStorage.getItem("blackboardProductEdits")) || {};
let deletedProductIds = JSON.parse(localStorage.getItem("blackboardDeletedProducts")) || [];
let orders = JSON.parse(localStorage.getItem("blackboardOrders")) || [];
let discountCodes = JSON.parse(localStorage.getItem("blackboardDiscountCodes")) || [];
let productReviews = JSON.parse(localStorage.getItem("blackboardProductReviews")) || [];
let editingProductId = null;
let activeModalProductId = null;
let wishlist = [];

const DEFAULT_STOCK = 10;
const LOW_STOCK_LIMIT = 5;
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const productList = document.getElementById("productList");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const adminProductSection = document.getElementById("adminProductSection");
const addProductForm = document.getElementById("addProductForm");
const clearAddedProductsBtn = document.getElementById("clearAddedProductsBtn");
const adminProductMessage = document.getElementById("adminProductMessage");
const addCategoryForm = document.getElementById("addCategoryForm");
const newCategoryName = document.getElementById("newCategoryName");
const newProductCategory = document.getElementById("newProductCategory");
const addedCategoryList = document.getElementById("addedCategoryList");
const clearAddedCategoriesBtn = document.getElementById("clearAddedCategoriesBtn");
const adminSubmitProductBtn = document.getElementById("adminSubmitProductBtn");
const cancelEditProductBtn = document.getElementById("cancelEditProductBtn");
const pageLoader = document.getElementById("pageLoader");
const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const modalProductImage = document.getElementById("modalProductImage");
const modalProductName = document.getElementById("modalProductName");
const modalProductDescription = document.getElementById("modalProductDescription");
const modalProductCategory = document.getElementById("modalProductCategory");
const modalProductStock = document.getElementById("modalProductStock");
const modalProductPrice = document.getElementById("modalProductPrice");
const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
const wishlistItems = document.getElementById("wishlistItems");
const clearWishlistBtn = document.getElementById("clearWishlistBtn");
const orderHistoryItems = document.getElementById("orderHistoryItems");
const clearOrderHistoryBtn = document.getElementById("clearOrderHistoryBtn");
const orderHistoryIntro = document.getElementById("orderHistoryIntro");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const orderStatusFilterWrap = document.getElementById("orderStatusFilterWrap");
const dashboardProducts = document.getElementById("dashboardProducts");
const dashboardStock = document.getElementById("dashboardStock");
const dashboardLowStock = document.getElementById("dashboardLowStock");
const dashboardOrders = document.getElementById("dashboardOrders");
const dashboardPendingOrders = document.getElementById("dashboardPendingOrders");
const dashboardDeliveredOrders = document.getElementById("dashboardDeliveredOrders");
const dashboardSales = document.getElementById("dashboardSales");
const dashboardDiscounts = document.getElementById("dashboardDiscounts");
const dashboardReviews = document.getElementById("dashboardReviews");
const addDiscountForm = document.getElementById("addDiscountForm");
const discountCodeInput = document.getElementById("discountCodeInput");
const discountPercentInput = document.getElementById("discountPercentInput");
const generateDiscountCodeBtn = document.getElementById("generateDiscountCodeBtn");
const discountCodeList = document.getElementById("discountCodeList");
const clearDiscountCodesBtn = document.getElementById("clearDiscountCodesBtn");
const modalReviewSummary = document.getElementById("modalReviewSummary");
const reviewForm = document.getElementById("reviewForm");
const reviewRating = document.getElementById("reviewRating");
const reviewComment = document.getElementById("reviewComment");
const submitReviewBtn = document.getElementById("submitReviewBtn");
const reviewMessage = document.getElementById("reviewMessage");
const productReviewList = document.getElementById("productReviewList");

const newProductName = document.getElementById("newProductName");
const newProductPrice = document.getElementById("newProductPrice");
const newProductStock = document.getElementById("newProductStock");
const newProductImage = document.getElementById("newProductImage");
const newProductDescription = document.getElementById("newProductDescription");

fetch("products.json")
  .then(response => response.json())
  .then(data => {
    baseProducts = data;
    wishlist = loadWishlist();
    rebuildProducts();
    syncCartWithProducts();
    refreshCategories();
    displayProducts(products);
    setupAdminPanel();
    renderWishlist();
    renderOrderHistory();
    updateCart();
    updateAdminDashboard();
    hidePageLoader();
  })
  .catch(error => {
    productList.innerHTML = "<p>Failed to load products.</p>";
    console.error("Error loading JSON:", error);
    hidePageLoader();
  });

function getLoggedInUserFromStorage() {
  return JSON.parse(localStorage.getItem("blackboardUser"));
}

function currentUserIsAdmin() {
  const user = getLoggedInUserFromStorage();
  return user && user.role === "admin";
}

function getWishlistKey() {
  const user = getLoggedInUserFromStorage();
  return `blackboardWishlist_${user ? user.username : "guest"}`;
}

function loadWishlist() {
  return JSON.parse(localStorage.getItem(getWishlistKey())) || [];
}

function saveWishlist() {
  localStorage.setItem(getWishlistKey(), JSON.stringify(wishlist));
}

function saveCart() {
  localStorage.setItem("blackboardCart", JSON.stringify(cart));
}

function saveAddedProducts() {
  localStorage.setItem("blackboardAddedProducts", JSON.stringify(addedProducts));
}

function saveAddedCategories() {
  localStorage.setItem("blackboardAddedCategories", JSON.stringify(addedCategories));
}

function saveProductEdits() {
  localStorage.setItem("blackboardProductEdits", JSON.stringify(productEdits));
}

function saveDeletedProducts() {
  localStorage.setItem("blackboardDeletedProducts", JSON.stringify(deletedProductIds));
}

function saveOrders() {
  localStorage.setItem("blackboardOrders", JSON.stringify(orders));
}

function normalizeOrderStatus(order) {
  const status = ORDER_STATUSES.includes(order.status) ? order.status : "Pending";
  return {
    ...order,
    status,
    statusUpdatedAt: order.statusUpdatedAt || order.date || new Date().toISOString()
  };
}

function loadOrders() {
  orders = (JSON.parse(localStorage.getItem("blackboardOrders")) || []).map(normalizeOrderStatus);
  localStorage.setItem("blackboardOrders", JSON.stringify(orders));
  return orders;
}

function getOrderStatusClass(status) {
  return `status-${String(status || "Pending").toLowerCase().replace(/\s+/g, "-")}`;
}

function getOrderStatusOptions(currentStatus) {
  return ORDER_STATUSES.map(status =>
    `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`
  ).join("");
}

function saveDiscountCodes() {
  localStorage.setItem("blackboardDiscountCodes", JSON.stringify(discountCodes));
}

function saveProductReviews() {
  localStorage.setItem("blackboardProductReviews", JSON.stringify(productReviews));
}

function hidePageLoader() {
  if (!pageLoader) return;
  setTimeout(() => pageLoader.classList.add("hidden"), 350);
}

function formatMoney(amount) {
  return `₱${Number(amount).toFixed(2)}`;
}

function renderStars(rating) {
  const roundedRating = Math.round(Number(rating) || 0);
  return "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getProductReviews(productId) {
  return productReviews.filter(review => Number(review.productId) === Number(productId));
}

function getReviewStats(productId) {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) {
    return { count: 0, average: 0, label: "No reviews yet" };
  }

  const average = reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length;
  const label = `${renderStars(average)} ${average.toFixed(1)} (${reviews.length} review${reviews.length === 1 ? "" : "s"})`;
  return { count: reviews.length, average, label };
}

function showReviewMessage(message, type = "success") {
  if (!reviewMessage) return;
  reviewMessage.textContent = message;
  reviewMessage.classList.remove("hidden", "review-success", "review-error");
  reviewMessage.classList.add(type === "error" ? "review-error" : "review-success");
}

function clearReviewMessage() {
  if (!reviewMessage) return;
  reviewMessage.textContent = "";
  reviewMessage.classList.add("hidden");
  reviewMessage.classList.remove("review-success", "review-error");
}

function normalizeProduct(product) {
  const stock = Number(product.stock);
  return {
    ...product,
    price: Number(product.price),
    stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : DEFAULT_STOCK
  };
}

function applySavedEdit(product) {
  const savedEdit = productEdits[product.id];
  return normalizeProduct(savedEdit ? { ...product, ...savedEdit } : { ...product });
}

function rebuildProducts() {
  const editedBaseProducts = baseProducts
    .filter(product => !deletedProductIds.includes(product.id))
    .map(product => applySavedEdit(product));

  const editedAddedProducts = addedProducts
    .filter(product => !deletedProductIds.includes(product.id))
    .map(product => ({ ...applySavedEdit(product), addedByAdmin: true }));

  products = [...editedBaseProducts, ...editedAddedProducts];
}

function syncCartWithProducts() {
  cart = cart
    .map(item => {
      const product = products.find(product => product.id === item.id);
      if (!product) return null;

      const quantity = Math.min(item.quantity, product.stock);
      if (quantity <= 0) return null;
      return { ...product, quantity };
    })
    .filter(Boolean);

  saveCart();
}

function normalizeDiscountCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function generateRandomDiscountCode() {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BB-${randomPart}`;
}

function renderDiscountCodes() {
  if (!discountCodeList) return;

  discountCodeList.innerHTML = "";

  if (discountCodes.length === 0) {
    discountCodeList.innerHTML = "<p>No discount codes yet.</p>";
    return;
  }

  discountCodes.forEach(discount => {
    const row = document.createElement("div");
    row.classList.add("discount-code-item");
    row.innerHTML = `
      <div>
        <strong>${discount.code}</strong>
        <small>${discount.percent}% off</small>
      </div>
      <button type="button" onclick="deleteDiscountCode('${discount.code}')">Delete</button>
    `;
    discountCodeList.appendChild(row);
  });
}

function deleteDiscountCode(code) {
  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can delete discount codes.", "error");
    return;
  }

  discountCodes = discountCodes.filter(discount => discount.code !== code);
  saveDiscountCodes();
  renderDiscountCodes();
  updateAdminDashboard();
  showAdminMessage(`${code} discount code has been deleted.`);
}

function getAllCategories() {
  const productCategories = products
    .map(product => product.category)
    .filter(category => category && category.trim() !== "");

  return [...new Set([...productCategories, ...addedCategories])].sort((a, b) => a.localeCompare(b));
}

function refreshCategories() {
  const selectedFilterCategory = categoryFilter.value || "all";
  const selectedProductCategory = newProductCategory.value || "";
  const categories = getAllCategories();

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  newProductCategory.innerHTML = '<option value="">Select Category</option>';

  categories.forEach(category => {
    const filterOption = document.createElement("option");
    filterOption.value = category;
    filterOption.textContent = category;
    categoryFilter.appendChild(filterOption);

    const productOption = document.createElement("option");
    productOption.value = category;
    productOption.textContent = category;
    newProductCategory.appendChild(productOption);
  });

  if (categories.includes(selectedFilterCategory)) categoryFilter.value = selectedFilterCategory;
  if (categories.includes(selectedProductCategory)) newProductCategory.value = selectedProductCategory;

  renderAddedCategories();
}

function renderAddedCategories() {
  addedCategoryList.innerHTML = "";

  if (addedCategories.length === 0) {
    addedCategoryList.innerHTML = "<p>No added categories yet.</p>";
    return;
  }

  addedCategories.forEach(category => {
    const categoryBadge = document.createElement("span");
    categoryBadge.classList.add("category-badge");
    categoryBadge.textContent = category;
    addedCategoryList.appendChild(categoryBadge);
  });
}

function isFavorited(productId) {
  return wishlist.includes(productId);
}

function toggleWishlist(productId) {
  if (isFavorited(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
  } else {
    wishlist.push(productId);
  }

  saveWishlist();
  displayProducts(getFilteredProducts());
  renderWishlist();
}

function renderWishlist() {
  wishlistItems.innerHTML = "";
  wishlist = wishlist.filter(productId => products.some(product => product.id === productId));
  saveWishlist();

  if (wishlist.length === 0) {
    wishlistItems.innerHTML = "<p>No favorite products yet.</p>";
    return;
  }

  wishlist.forEach(productId => {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const row = document.createElement("div");
    row.classList.add("wishlist-item");
    row.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div>
        <strong>${product.name}</strong>
        <small>${product.category} • ${formatMoney(product.price)} • Stock: ${product.stock}</small>
      </div>
      <div class="wishlist-actions">
        <button type="button" onclick="openProductModal(${product.id})">View</button>
        <button type="button" onclick="toggleWishlist(${product.id})">Remove</button>
      </div>
    `;
    wishlistItems.appendChild(row);
  });
}

function getFilteredProducts() {
  const selectedCategory = categoryFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  return products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });
}

function displayProducts(items) {
  productList.innerHTML = "";

  if (items.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  items.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card", "fade-in-card");

    const adminBadge = product.addedByAdmin && currentUserIsAdmin()
      ? '<p class="admin-badge">Added by Admin</p>'
      : '';

    const adminButtons = currentUserIsAdmin()
      ? `
          <button class="edit-product-btn" onclick="startEditProduct(${product.id})">Edit Product</button>
          <button class="delete-product-btn" onclick="deleteProduct(${product.id})">Delete Product</button>
        `
      : '';

    const stockClass = product.stock <= 0 ? "stock-empty" : product.stock <= LOW_STOCK_LIMIT ? "stock-low" : "stock-good";
    const stockLabel = product.stock <= 0 ? "Out of stock" : product.stock <= LOW_STOCK_LIMIT ? `Low stock: ${product.stock}` : `Stock: ${product.stock}`;
    const reviewStats = getReviewStats(product.id);
    const favoriteText = isFavorited(product.id) ? "♥ Favorited" : "♡ Favorite";
    const addDisabled = product.stock <= 0 ? "disabled" : "";

    card.innerHTML = `
      <button class="product-image-btn" type="button" onclick="openProductModal(${product.id})">
        <img src="${product.image}" alt="${product.name}">
      </button>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <p class="product-rating-summary">${reviewStats.label}</p>
      <p class="stock-badge ${stockClass}">${stockLabel}</p>
      ${adminBadge}
      <div class="price">${formatMoney(product.price)}</div>
      <div class="product-card-actions">
        <button onclick="addToCart(${product.id})" ${addDisabled}>${product.stock <= 0 ? "Out of Stock" : "Add to Cart"}</button>
        <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">${favoriteText}</button>
        <button class="view-details-btn" onclick="openProductModal(${product.id})">View Details</button>
        ${adminButtons}
      </div>
    `;

    productList.appendChild(card);
  });
}

function openProductModal(productId) {
  const product = products.find(item => item.id === productId);
  if (!product || !productModal) return;

  activeModalProductId = product.id;
  modalProductImage.src = product.image;
  modalProductImage.alt = product.name;
  modalProductName.textContent = product.name;
  modalProductDescription.textContent = product.description;
  modalProductCategory.textContent = product.category;
  modalProductStock.textContent = product.stock <= 0 ? "Out of stock" : product.stock;
  modalProductPrice.textContent = formatMoney(product.price);
  modalAddToCartBtn.disabled = product.stock <= 0;
  modalAddToCartBtn.textContent = product.stock <= 0 ? "Out of Stock" : "Add to Cart";
  modalAddToCartBtn.onclick = function() {
    addToCart(product.id);
    closeProductDetails();
  };

  clearReviewMessage();
  renderProductReviews(product.id);
  productModal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    productModal.scrollTo({ top: 0, behavior: "smooth" });
    const modalContent = productModal.querySelector(".product-modal-content");
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: "smooth" });
      modalContent.focus({ preventScroll: true });
    }
  });
}


function renderProductReviews(productId) {
  if (!productReviewList || !modalReviewSummary) return;

  const user = getLoggedInUserFromStorage();
  const reviews = getProductReviews(productId).slice().reverse();
  const stats = getReviewStats(productId);
  const existingReview = user
    ? productReviews.find(review => Number(review.productId) === Number(productId) && review.username === user.username)
    : null;

  modalReviewSummary.textContent = stats.label;
  productReviewList.innerHTML = "";

  if (reviewForm) {
    const canReview = user && user.role !== "admin";
    reviewForm.classList.toggle("hidden", !canReview);

    if (canReview) {
      reviewRating.value = existingReview ? String(existingReview.rating) : "";
      reviewComment.value = existingReview ? existingReview.comment : "";
      submitReviewBtn.textContent = existingReview ? "Update Review" : "Submit Review";
    }
  }

  if (reviews.length === 0) {
    productReviewList.innerHTML = "<p>No reviews yet. Be the first customer to review this product.</p>";
    return;
  }

  reviews.forEach(review => {
    const reviewRow = document.createElement("div");
    reviewRow.classList.add("review-item");

    const canDelete = user && (user.role === "admin" || user.username === review.username);
    const deleteButton = canDelete
      ? `<button type="button" onclick="deleteProductReview('${review.id}')">Delete</button>`
      : "";

    reviewRow.innerHTML = `
      <div>
        <div class="review-title-line">
          <strong>${escapeHtml(review.accountName || review.username)}</strong>
          <span class="review-stars">${renderStars(review.rating)}</span>
        </div>
        <small>${new Date(review.date).toLocaleString()}</small>
        <p>${escapeHtml(review.comment)}</p>
      </div>
      <div class="review-actions">
        ${deleteButton}
      </div>
    `;

    productReviewList.appendChild(reviewRow);
  });
}

function submitProductReview(event) {
  event.preventDefault();

  const user = getLoggedInUserFromStorage();
  if (!user || user.role === "admin") {
    showReviewMessage("Only customer accounts can submit product reviews.", "error");
    return;
  }

  if (!activeModalProductId) {
    showReviewMessage("Please open a product first.", "error");
    return;
  }

  const rating = Number(reviewRating.value);
  const comment = reviewComment.value.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    showReviewMessage("Please select a rating from 1 to 5 stars.", "error");
    return;
  }

  if (!comment) {
    showReviewMessage("Please write a short review.", "error");
    return;
  }

  const existingReview = productReviews.find(review =>
    Number(review.productId) === Number(activeModalProductId) && review.username === user.username
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.date = new Date().toISOString();
    existingReview.accountName = user.name || user.username;
    showReviewMessage("Your review has been updated.");
  } else {
    productReviews.push({
      id: `REV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: activeModalProductId,
      username: user.username,
      accountName: user.name || user.username,
      rating,
      comment,
      date: new Date().toISOString()
    });
    showReviewMessage("Thank you. Your review has been added.");
  }

  saveProductReviews();
  renderProductReviews(activeModalProductId);
  displayProducts(getFilteredProducts());
  updateAdminDashboard();
}

function deleteProductReview(reviewId) {
  const user = getLoggedInUserFromStorage();
  const review = productReviews.find(item => item.id === reviewId);

  if (!user || !review) return;

  const canDelete = user.role === "admin" || user.username === review.username;
  if (!canDelete) {
    showReviewMessage("You can only delete your own review.", "error");
    return;
  }

  const confirmDelete = confirm("Delete this review?");
  if (!confirmDelete) return;

  const productId = review.productId;
  productReviews = productReviews.filter(item => item.id !== reviewId);
  saveProductReviews();
  renderProductReviews(productId);
  displayProducts(getFilteredProducts());
  updateAdminDashboard();
  showReviewMessage("Review deleted.");
}

function closeProductDetails() {
  if (productModal) productModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    alert("This product is out of stock.");
    return;
  }

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      alert("You reached the available stock for this product.");
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCart();
}

function increaseQuantity(productId) {
  const item = cart.find(item => item.id === productId);
  const product = products.find(product => product.id === productId);
  if (!item || !product) return;

  if (item.quantity >= product.stock) {
    alert("You reached the available stock for this product.");
    return;
  }

  item.quantity += 1;
  saveCart();
  updateCart();
}

function decreaseQuantity(productId) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity -= 1;
  if (item.quantity <= 0) cart = cart.filter(cartItem => cartItem.id !== productId);

  saveCart();
  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCart();
}

function getCartTotals() {
  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  });

  return { totalItems, totalPrice };
}

function updateCart() {
  syncCartWithProducts();
  cartItems.innerHTML = "";
  const { totalItems, totalPrice } = getCartTotals();

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatMoney(totalPrice);
  checkoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>No items in cart yet.</p>";
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.classList.add("cart-item");
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        Qty: ${item.quantity} × ${formatMoney(item.price)}<br>
        <small>Available stock: ${item.stock}</small>
      </div>
      <div class="cart-actions">
        <strong>${formatMoney(item.quantity * item.price)}</strong>
        <div>
          <button onclick="decreaseQuantity(${item.id})">−</button>
          <button onclick="increaseQuantity(${item.id})">+</button>
          <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
    cartItems.appendChild(row);
  });
}

function filterProducts() {
  displayProducts(getFilteredProducts());
}

function showAdminMessage(message, type = "success") {
  adminProductMessage.textContent = message;
  adminProductMessage.classList.remove("hidden", "admin-error", "admin-success");
  adminProductMessage.classList.add(type === "error" ? "admin-error" : "admin-success");
}

function getNextProductId() {
  const allIds = [...baseProducts, ...addedProducts].map(product => product.id);
  if (allIds.length === 0) return 1;
  return Math.max(...allIds) + 1;
}

function setupAdminPanel() {
  if (!currentUserIsAdmin()) {
    adminProductSection.classList.add("hidden");
    return;
  }

  adminProductSection.classList.remove("hidden");
  renderDiscountCodes();
}

function resetProductForm() {
  editingProductId = null;
  addProductForm.reset();
  adminSubmitProductBtn.textContent = "Add Product";
  cancelEditProductBtn.classList.add("hidden");
}

function getProductFormData() {
  const name = newProductName.value.trim();
  const category = newProductCategory.value;
  const price = Number(newProductPrice.value);
  const stock = Number(newProductStock.value);
  const image = newProductImage.value.trim();
  const description = newProductDescription.value.trim();

  return { name, category, price, stock, image, description };
}

function validateProductData(productData) {
  if (!productData.name || !productData.category || !productData.price || productData.stock === "" || !productData.image || !productData.description) {
    showAdminMessage("Please complete all product fields.", "error");
    return false;
  }

  if (productData.price <= 0) {
    showAdminMessage("Product price must be greater than zero.", "error");
    return false;
  }

  if (!Number.isInteger(productData.stock) || productData.stock < 0) {
    showAdminMessage("Stock quantity must be a whole number of zero or higher.", "error");
    return false;
  }

  return true;
}

function updateProductInCart(updatedProduct) {
  cart = cart
    .map(item => {
      if (item.id !== updatedProduct.id) return item;
      const quantity = Math.min(item.quantity, updatedProduct.stock);
      if (quantity <= 0) return null;
      return { ...updatedProduct, quantity };
    })
    .filter(Boolean);
  saveCart();
}

function deleteProduct(productId) {
  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can delete products.", "error");
    return;
  }

  const product = products.find(item => item.id === productId);
  if (!product) {
    showAdminMessage("Product not found.", "error");
    return;
  }

  const confirmDelete = confirm(`Delete ${product.name} from the shop?`);
  if (!confirmDelete) return;

  addedProducts = addedProducts.filter(item => item.id !== productId);
  delete productEdits[productId];

  if (!deletedProductIds.includes(productId)) deletedProductIds.push(productId);

  cart = cart.filter(item => item.id !== productId);
  wishlist = wishlist.filter(id => id !== productId);
  productReviews = productReviews.filter(review => Number(review.productId) !== Number(productId));

  saveAddedProducts();
  saveProductEdits();
  saveDeletedProducts();
  saveProductReviews();
  saveCart();
  saveWishlist();
  rebuildProducts();
  refreshCategories();
  filterProducts();
  renderWishlist();
  updateCart();
  updateAdminDashboard();
  closeProductDetails();
  if (editingProductId === productId) resetProductForm();
  showAdminMessage(`${product.name} has been deleted.`);
}

function startEditProduct(productId) {
  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can edit products.", "error");
    return;
  }

  const product = products.find(item => item.id === productId);
  if (!product) {
    showAdminMessage("Product not found.", "error");
    return;
  }

  editingProductId = productId;
  newProductName.value = product.name;
  newProductCategory.value = product.category;
  newProductPrice.value = product.price;
  newProductStock.value = product.stock;
  newProductImage.value = product.image;
  newProductDescription.value = product.description;

  adminSubmitProductBtn.textContent = "Save Product Changes";
  cancelEditProductBtn.classList.remove("hidden");
  showAdminMessage(`Editing ${product.name}. Change the fields, then click Save Product Changes.`);
  adminProductSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveEditedProduct(productId, productData) {
  productEdits[productId] = {
    ...productEdits[productId],
    ...productData,
    price: Number(productData.price),
    stock: Math.max(0, Math.floor(Number(productData.stock)))
  };

  saveProductEdits();
  rebuildProducts();

  const updatedProduct = products.find(product => product.id === productId);
  if (updatedProduct) updateProductInCart(updatedProduct);

  refreshCategories();
  filterProducts();
  renderWishlist();
  updateCart();
  updateAdminDashboard();
  resetProductForm();
  showAdminMessage(`${productData.name} has been updated.`);
}

function getVisibleOrders() {
  const user = getLoggedInUserFromStorage();
  if (!user) return [];

  let visibleOrders = user.role === "admin"
    ? orders
    : orders.filter(order => order.username === user.username);

  if (user.role === "admin" && orderStatusFilter && orderStatusFilter.value !== "all") {
    visibleOrders = visibleOrders.filter(order => order.status === orderStatusFilter.value);
  }

  return visibleOrders;
}

function renderOrderHistory() {
  loadOrders();
  const visibleOrders = getVisibleOrders().slice().reverse();
  const user = getLoggedInUserFromStorage();

  if (orderHistoryIntro) {
    orderHistoryIntro.textContent = user && user.role === "admin"
      ? "Manage all customer orders, update order statuses, and track recent purchases."
      : "Your recent orders placed in this browser.";
  }

  if (orderStatusFilterWrap) {
    orderStatusFilterWrap.classList.toggle("hidden", !(user && user.role === "admin"));
  }

  if (clearOrderHistoryBtn && user && user.role === "admin") {
    clearOrderHistoryBtn.textContent = "Clear All Order History";
  }

  orderHistoryItems.innerHTML = "";

  if (visibleOrders.length === 0) {
    orderHistoryItems.innerHTML = "<p>No orders yet.</p>";
    return;
  }

  visibleOrders.forEach(order => {
    const row = document.createElement("div");
    row.classList.add("order-history-item");

    const itemSummary = order.items.map(item => `${item.quantity}× ${item.name}`).join(", ");
    const discountLine = order.discountCode
      ? `<small>Discount: ${order.discountCode} (${order.discountPercent}% off, -${formatMoney(order.discountAmount || 0)})</small>`
      : "";

    const status = order.status || "Pending";
    const statusBadge = `<span class="order-status-badge ${getOrderStatusClass(status)}">${status}</span>`;

    const adminStatusControl = user && user.role === "admin"
      ? `
        <label class="order-status-control">
          Update Status
          <select onchange="updateOrderStatus('${order.orderId}', this.value)">
            ${getOrderStatusOptions(status)}
          </select>
        </label>
      `
      : "";

    row.innerHTML = `
      <div class="order-history-main">
        <div class="order-title-line">
          <strong>${order.orderId}</strong>
          ${statusBadge}
        </div>
        <small>${new Date(order.date).toLocaleString()} • ${order.paymentMethod}</small>
        <p>${itemSummary}</p>
        ${discountLine}
        <small>Customer: ${order.customerName} • ${order.customerPhone || "No phone"} • ${order.customerEmail || "No email"}</small>
        <small>Address: ${order.deliveryAddress || "No address"}</small>
      </div>
      <div class="order-total-block">
        <strong>${formatMoney(order.totalPrice)}</strong>
        <small>${order.accountName || order.customerName}</small>
        ${adminStatusControl}
      </div>
    `;

    orderHistoryItems.appendChild(row);
  });
}

function updateOrderStatus(orderId, newStatus) {
  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can update order status.", "error");
    renderOrderHistory();
    return;
  }

  if (!ORDER_STATUSES.includes(newStatus)) {
    showAdminMessage("Invalid order status selected.", "error");
    renderOrderHistory();
    return;
  }

  loadOrders();
  const order = orders.find(item => item.orderId === orderId);

  if (!order) {
    showAdminMessage("Order not found.", "error");
    renderOrderHistory();
    return;
  }

  order.status = newStatus;
  order.statusUpdatedAt = new Date().toISOString();
  saveOrders();
  renderOrderHistory();
  updateAdminDashboard();
  showAdminMessage(`${order.orderId} status updated to ${newStatus}.`);
}

function updateAdminDashboard() {
  if (!currentUserIsAdmin()) return;

  orders = (JSON.parse(localStorage.getItem("blackboardOrders")) || []).map(normalizeOrderStatus);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter(product => product.stock > 0 && product.stock <= LOW_STOCK_LIMIT).length;
  const pendingOrders = orders.filter(order => order.status === "Pending").length;
  const deliveredOrders = orders.filter(order => order.status === "Delivered").length;
  const totalSales = orders
    .filter(order => order.status !== "Cancelled")
    .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

  dashboardProducts.textContent = products.length;
  dashboardStock.textContent = totalStock;
  dashboardLowStock.textContent = lowStock;
  dashboardOrders.textContent = orders.length;
  if (dashboardPendingOrders) dashboardPendingOrders.textContent = pendingOrders;
  if (dashboardDeliveredOrders) dashboardDeliveredOrders.textContent = deliveredOrders;
  dashboardSales.textContent = formatMoney(totalSales);
  if (dashboardDiscounts) dashboardDiscounts.textContent = discountCodes.length;
  if (dashboardReviews) dashboardReviews.textContent = productReviews.length;
}


if (generateDiscountCodeBtn) {
  generateDiscountCodeBtn.addEventListener("click", function() {
    if (!currentUserIsAdmin()) return;
    let newCode = generateRandomDiscountCode();
    while (discountCodes.some(discount => discount.code === newCode)) {
      newCode = generateRandomDiscountCode();
    }
    discountCodeInput.value = newCode;
  });
}

if (addDiscountForm) {
  addDiscountForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!currentUserIsAdmin()) {
      showAdminMessage("Only the admin account can add discount codes.", "error");
      return;
    }

    const code = normalizeDiscountCode(discountCodeInput.value);
    const percent = Number(discountPercentInput.value);

    if (!code) {
      showAdminMessage("Please enter or generate a discount code.", "error");
      return;
    }

    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      showAdminMessage("Discount percentage must be a whole number from 1 to 100.", "error");
      return;
    }

    const existingDiscount = discountCodes.find(discount => discount.code === code);

    if (existingDiscount) {
      existingDiscount.percent = percent;
      showAdminMessage(`${code} discount code has been updated to ${percent}% off.`);
    } else {
      discountCodes.push({ code, percent, createdAt: new Date().toISOString() });
      showAdminMessage(`${code} discount code has been created with ${percent}% off.`);
    }

    saveDiscountCodes();
    renderDiscountCodes();
    updateAdminDashboard();
    addDiscountForm.reset();
  });
}

if (clearDiscountCodesBtn) {
  clearDiscountCodesBtn.addEventListener("click", function() {
    if (!currentUserIsAdmin()) {
      showAdminMessage("Only the admin account can clear discount codes.", "error");
      return;
    }

    const confirmClear = confirm("Remove all discount codes in this browser?");
    if (!confirmClear) return;

    discountCodes = [];
    saveDiscountCodes();
    renderDiscountCodes();
    updateAdminDashboard();
    showAdminMessage("All discount codes have been cleared.");
  });
}

addCategoryForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can add categories.", "error");
    return;
  }

  const categoryName = newCategoryName.value.trim();

  if (!categoryName) {
    showAdminMessage("Please enter a category name.", "error");
    return;
  }

  const categoryAlreadyExists = getAllCategories().some(category => category.toLowerCase() === categoryName.toLowerCase());

  if (categoryAlreadyExists) {
    showAdminMessage("That category already exists.", "error");
    return;
  }

  addedCategories.push(categoryName);
  saveAddedCategories();
  refreshCategories();
  newProductCategory.value = categoryName;
  addCategoryForm.reset();
  updateAdminDashboard();
  showAdminMessage(`${categoryName} category has been added.`);
});

addProductForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can add or edit products.", "error");
    return;
  }

  const productData = getProductFormData();

  if (!validateProductData(productData)) return;

  if (editingProductId !== null) {
    saveEditedProduct(editingProductId, productData);
    return;
  }

  const newProduct = {
    id: getNextProductId(),
    ...productData,
    price: Number(productData.price),
    stock: Math.max(0, Math.floor(Number(productData.stock))),
    addedByAdmin: true
  };

  addedProducts.push(newProduct);
  saveAddedProducts();
  rebuildProducts();
  refreshCategories();
  filterProducts();
  renderWishlist();
  resetProductForm();
  updateAdminDashboard();
  showAdminMessage(`${newProduct.name} has been added to the product list.`);
});

cancelEditProductBtn.addEventListener("click", function() {
  resetProductForm();
  showAdminMessage("Edit cancelled.");
});

clearAddedProductsBtn.addEventListener("click", function() {
  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can clear added products.", "error");
    return;
  }

  const confirmClear = confirm("Remove all products added by the admin in this browser?");
  if (!confirmClear) return;

  const addedProductIds = addedProducts.map(product => product.id);
  addedProducts = [];

  addedProductIds.forEach(productId => {
    delete productEdits[productId];
    if (!deletedProductIds.includes(productId)) deletedProductIds.push(productId);
  });

  cart = cart.filter(item => !addedProductIds.includes(item.id));
  wishlist = wishlist.filter(id => !addedProductIds.includes(id));

  saveAddedProducts();
  saveProductEdits();
  saveDeletedProducts();
  saveProductReviews();
  saveCart();
  saveWishlist();
  rebuildProducts();
  refreshCategories();
  filterProducts();
  renderWishlist();
  updateCart();
  updateAdminDashboard();
  resetProductForm();
  showAdminMessage("All added products have been cleared.");
});

clearAddedCategoriesBtn.addEventListener("click", function() {
  if (!currentUserIsAdmin()) {
    showAdminMessage("Only the admin account can clear added categories.", "error");
    return;
  }

  const confirmClear = confirm("Remove all added categories in this browser? Products using those categories will stay.");
  if (!confirmClear) return;

  addedCategories = [];
  saveAddedCategories();
  refreshCategories();
  filterProducts();
  updateAdminDashboard();
  showAdminMessage("All added categories have been cleared.");
});

clearWishlistBtn.addEventListener("click", function() {
  const confirmClear = confirm("Remove all products from your wishlist?");
  if (!confirmClear) return;

  wishlist = [];
  saveWishlist();
  renderWishlist();
  filterProducts();
});

clearOrderHistoryBtn.addEventListener("click", function() {
  const user = getLoggedInUserFromStorage();
  if (!user) return;

  const confirmClear = confirm(user.role === "admin" ? "Clear all order history in this browser?" : "Clear your order history in this browser?");
  if (!confirmClear) return;

  if (user.role === "admin") {
    orders = [];
  } else {
    orders = orders.filter(order => order.username !== user.username);
  }

  saveOrders();
  renderOrderHistory();
  updateAdminDashboard();
});


if (reviewForm) {
  reviewForm.addEventListener("submit", submitProductReview);
}

if (closeProductModal) closeProductModal.addEventListener("click", closeProductDetails);

if (productModal) {
  productModal.addEventListener("click", function(event) {
    if (event.target === productModal) closeProductDetails();
  });
}

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") closeProductDetails();
});

if (orderStatusFilter) {
  orderStatusFilter.addEventListener("change", renderOrderHistory);
}

categoryFilter.addEventListener("change", filterProducts);
searchInput.addEventListener("input", filterProducts);
checkoutBtn.addEventListener("click", () => {
  window.location.href = "checkout.html";
});
