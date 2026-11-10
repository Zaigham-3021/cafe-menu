// Daylight Cafe website JavaScript
const CART_KEY = "daylightCafeCart";

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function money(amount) {
  return "Rs. " + Number(amount).toLocaleString("en-PK");
}
function updateCartCount() {
  const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
}
function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
}
function setupSliders() {
  document.querySelectorAll("[data-slider]").forEach(slider => {
    const slides = [...slider.querySelectorAll(".slide")];
    const dots = slider.querySelector(".slider-dots");
    if (!slides.length) return;
    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains("active")));
    const show = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      if (dots) [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === current));
    };
    if (dots) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show picture " + (i + 1));
        dot.addEventListener("click", () => show(i));
        dots.appendChild(dot);
      });
    }
    slider.querySelector(".prev")?.addEventListener("click", () => show(current - 1));
    slider.querySelector(".next")?.addEventListener("click", () => show(current + 1));
    show(current);
  });
}
function setupAddToCart() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const cart = readCart();
      const id = button.dataset.id;
      const existing = cart.find(item => item.id === id);
      if (existing) existing.quantity += 1;
      else cart.push({ id, name: button.dataset.name, price: Number(button.dataset.price), quantity: 1 });
      saveCart(cart);
      const message = document.querySelector(".cart-message");
      if (message) message.textContent = button.dataset.name + " added to your cart.";
    });
  });
}
function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  const cart = readCart();
  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty. Visit the <a href="menu.html">menu</a> to add something delicious.</p>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-row">
        <div><h3>${escapeHTML(item.name)}</h3><p>${money(item.price)} each</p></div>
        <div class="quantity-controls">
          <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="remove-item" data-action="remove" data-id="${item.id}">Remove</button>
      </div>`).join("");
  }
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-total").textContent = money(subtotal);
  container.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.action, id = button.dataset.id;
      let next = readCart();
      const item = next.find(entry => entry.id === id);
      if (action === "remove") next = next.filter(entry => entry.id !== id);
      else if (item && action === "increase") item.quantity++;
      else if (item && action === "decrease") item.quantity--;
      next = next.filter(entry => entry.quantity > 0);
      saveCart(next);
      renderCart();
    });
  });
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function setupCheckout() {
  const button = document.getElementById("confirm-order");
  if (!button) return;
  button.addEventListener("click", () => {
    const cart = readCart();
    const message = document.getElementById("checkout-message");
    if (!cart.length) {
      message.textContent = "Your cart is empty. Please add an item first.";
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert("Thank you! Your order has been confirmed. Total: " + money(total));
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
    message.textContent = "Your order was confirmed successfully.";
  });
}
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    document.getElementById("contact-feedback").textContent =
      "Thank you for contacting Daylight Cafe! This demo form does not send messages to a server.";
    form.reset();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  setupNavigation();
  setupSliders();
  setupAddToCart();
  updateCartCount();
  renderCart();
  setupCheckout();
  setupContactForm();
});
