// Your existing variables
let products = document.querySelector("#products");
let overLay = document.querySelector(".overlay");
let product = document.querySelectorAll(".product");
let allProducts = [];
let allCartProducts = document.querySelector(".cart-header");
let numOfCartItems = document.querySelector(".num-of-items");
let neworderConfirmation = document.querySelector(".confirm-items");

let confirmTotal = document.querySelector(".order-total > span");
let emptyCart = document.querySelector(".empty-cart");
let totalCost = document.querySelector(".totalCost");

// loc
let cartState = JSON.parse(localStorage.getItem("data")) || [];
console.log(cartState);

// Track cart state for each product
// Your existing cartproducts function

function cartproducts() {
  allCartProducts.innerHTML = "";

  cartState.map((item) => {
    console.log(item);
    allCartProducts.innerHTML += `
  <div class="pricing-container">
    <div class="cart-pricing">
      <h3>${item?.category}</h3>
        <div class='pricing'>
          <span class="amount">${item?.quantity}x</span>
          <span class="price">@$${item?.price.toFixed(2)}</span>
          <span class="total">$${(item?.price * item?.quantity).toFixed(
            2
          )}</span>
        </div>
    </div>

      <button id="remove-item" onclick="removeFromCart(${item?.id})">
         <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
         width="24" height="24" fill="none" viewBox="0 0 24 24">
         <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
           </svg>
      </button>
  </div>
    `;
  });
}

// Your fetchData function (unchanged)
async function fetchData() {
  const response = await fetch(`http://localhost:8000/data`);
  const data = await response.json();

  return data;
}

fetchData().then((data) => {
  allProducts = data;
  cartproducts();
  displayProduct();
});

function displayProduct() {
  products.innerHTML = "";

  allProducts.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("product");
    div.setAttribute("data-key", item.id);

    const productInCart = cartState.find((product) => product?.id == item.id);
    // Conditionally render either "Add to Cart" button or quantity controls
    div.innerHTML = `
      <div class="item">
        <img src=${
          window.innerWidth < 768 ? item.image.mobile : item.image.desktop
        } alt=${item.name} style= "border: ${
      productInCart ? "3px solid #D87D4A" : "none"
    }";>
      </div>
      ${
        productInCart
          ? incrementCartButton(item.id) // Show quantity controls if item is in cart
          : addToCartButton(item.id) // Show "Add to Cart" if item not in cart
      }
      <div class="info">
      <p>${item?.category}</p>
      <p>${item?.name}</p>
      <p>$${item?.price}</p>
      </div>
    `;
    products.appendChild(div);
    storeProducts();
  });
}

// Existing addToCartButton function (unchanged)
function addToCartButton(id) {
  return `
    <button class="add-to-cart" data-key=${id}>
      <img src="./assets/images/icon-add-to-cart.svg" alt="">
      <p class="text">Add to cart</p>
    </button>
  `;
}

// Modified incrementCartButton function with SVG icons for increment/decrement buttons
function incrementCartButton(id) {
  const product = cartState.find((product) => product?.id == id);
  const quantity = product?.quantity || 1; // Ensure quantity is not undefined
  // product.image.style.border = "2px solid #D87D4A";
  return `
    <div class="quantity add-to-cart">
      <button onclick="decrementQuantity(${id})">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-minus" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span>${quantity}</span>
      <button onclick="incrementQuantity(${id})">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  `;
}

// Existing product click handler (modified to work with updated logic)
products.addEventListener("click", (event) => {
  const target = event.target.closest(".add-to-cart");

  console.log(target);

  if (!target || !target.classList.contains("add-to-cart")) return;

  const productId = target.dataset.key;
  console.log({ productId });
  let product = allProducts.find((product) => product.id == productId);

  console.log({ product });

  if (product) {
    cartState.push({ ...product, quantity: 1 });
    storeProducts();
  }
  if (cartState.length > 0) {
    emptyCart.style.display = "none";
    calculateTotal();
    storeProducts();
  } else {
    emptyCart.style.display = "block";
  }

  // Update the cart UI and product list UI
  updateCartUI();
  calculateTotal();
  console.log({ cartState });
});

function updateCartUI() {
  numOfCartItems.innerHTML =
    cartState.length >= 1
      ? `Your Cart (${quantityOfItemsInCart()})`
      : "Your Cart (0)";

  if (cartState.length > 0) {
    cartState.length > 0 && (emptyCart.style.display = "none");
  }

  // cartState.length > 0 && confirmOrder();

  storeProducts();
  cartproducts();
  displayProduct(); // Update only the cart display
}

// function to remove from cart

function removeFromCart(id) {
  // console.log("removing from cart", id);
  const item = cartState.findIndex((product) => product.id == id);

  cartState.splice(item, 1);
  if (!item && !cartState.length > 0) {
    emptyCart.style.display = "block";
  }
  storeProducts();
  updateCartUI();
  calculateTotal();
}

// Function to increment quantity
function incrementQuantity(id) {
  cartState = cartState.map((item) =>
    item.id == id ? { ...item, quantity: item.quantity + 1 } : item
  );

  // Update the cart UI and product list UI
  updateCartUI(); // Refresh product UI to show the updated quantity
  storeProducts();
}

// Function to decrement quantity
function decrementQuantity(id) {
  // Find the product in the cart
  const product = cartState.find((item) => item.id == id);

  if (product) {
    // Decrement the quantity if it's greater than 1
    if (product.quantity > 1) {
      cartState = cartState.map((item) =>
        item.id == id ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      // If the quantity is 1, remove the product from the cart
      cartState = cartState.filter((item) => item.id != id);
    }

    // Update the cart UI and product list UI
    updateCartUI(); // Refresh product UI to show the updated button
    storeProducts();
  }
}

function calculateTotal() {
  totalCost.innerHTML = cartState.length > 0 ? `${confirmOrder()}` : "";

  updateCartUI();
}
calculateTotal();

function quantityOfItemsInCart() {
  let total = cartState.reduce((total, item) => total + item.quantity, 0);
  storeProducts();
  return total;
}

function confirmOrder() {
  let total = 0;
  cartState.forEach((item) => {
    total += item.price * item.quantity;
  });
  confirmTotal.innerHTML = `$${total.toFixed(2)}`;
  storeProducts();
  return `
  <div class="order-total">
  <p>Order Total</p> 
  <span id="totalcost">$${total.toFixed(2)}</span>  
  </div>
  success border
  <div class="carbon-free">
 <img src="./assets/images/icon-carbon-neutral.svg" alt="carbon">
 <p>This is a <span>carbon-neutral</span> delivery</p>
  </div>
  
  <button class="confirm-order" onclick="placeOrder()">
    Confirm Order
  </button>
  `;
}

function placeOrder() {
  neworder();
  overLay.style.display = "block";
}

function neworder() {
  neworderConfirmation.innerHTML = "";

  cartState.forEach((item) => {
    neworderConfirmation.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="confirm-item">
          <div>
            <img src=${item?.image?.thumbnail} alt=${item?.name}>
            <div class="checkout-con">
              <p class="checkout-name">${item?.name}</p>
              <span class="checkout-quan">${item?.quantity}x
                <span class="checkout-price">@${item?.price}</span>
              </span>
            </div>
          </div>
          <p class="checkout-total">$${(item?.price * item?.quantity).toFixed(
            2
          )}</p>
        </div>
      `
    );
  });
}

overLay.addEventListener("click", (event) => {
  if (event.target.classList.contains("overlay")) {
    overLay.style.display = "none";
  }
});

function resetCart() {
  cartState = [];

  overLay.style.display = "none";
  emptyCart.style.display = "block";
  neworderConfirmation.innerHTML = "";
  totalCost.innerHTML = "";

  // storeProducts();
  updateCartUI();
}

function storeProducts() {
  localStorage.setItem("data", JSON.stringify(cartState));
}

updateCartUI();
storeProducts();
