// Your existing variables
let products = document.querySelector("#products");
let product = document.querySelectorAll(".product");
let total = document.querySelector(".total");
let allProducts = [];
let cartState = []; // Track cart state for each product
let allCartProducts = document.querySelector(".cart-header");
let numOfCartItems = document.querySelector(".num-of-items");

// Your existing cartproducts function

function cartproducts() {
  allCartProducts.innerHTML = "";

  cartState.map((item) => {
    console.log(item);
    allCartProducts.innerHTML += `
    <div class="cart-header">
      <h3>${item?.category}</h3>
      <div>
        <div class='pricing'>
          <span class="amount">${item?.quantity}x</span>
          <span class="price">@$${item?.price}</span>
          <span class="total">$${(item?.price * item?.quantity).toFixed(
            2
          )}</span>
        </div>

        <button id="remove-item" onclick="removeFromCart(${item?.id})">
         <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
         width="24" height="24" fill="none" viewBox="0 0 24 24">
         <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
           </svg>
        </button>
      </div>
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
    console.log({ productInCart });
    // Conditionally render either "Add to Cart" button or quantity controls
    div.innerHTML = `
      <div class="item">
        <img src=${item.image.desktop} alt=${item.name}>
      </div>
      ${
        productInCart
          ? incrementCartButton(item.id) // Show quantity controls if item is in cart
          : addToCartButton(item.id) // Show "Add to Cart" if item not in cart
      }
      <i>${item.name}</i>
    `;
    products.appendChild(div);
  });
}

// Existing addToCartButton function (unchanged)
function addToCartButton(id) {
  return `
    <button class="add-to-cart" data-key=${id}>
      <p>Add to cart</p>
    </button>
  `;
}

// Modified incrementCartButton function with SVG icons for increment/decrement buttons
function incrementCartButton(id) {
  const product = cartState.find((product) => product?.id == id);
  const quantity = product?.quantity || 1; // Ensure quantity is not undefined
  return `
    <div class="quantity add-to-cart">
      <button onclick="decrementQuantity(${id})">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-minus" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span>${quantity}</span>
      <button onclick="incrementQuantity(${id})">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
  }

  // Update the cart UI and product list UI
  updateCartUI();
  console.log({ cartState });
});

function updateCartUI() {
  numOfCartItems.innerHTML =
    cartState.length >= 1 ? `Your Cart (${cartState.length})` : "Your Cart (0)";
  cartproducts();
  displayProduct(); // Update only the cart display
}

// function to remove from cart

function removeFromCart(id) {
  // console.log("removing from cart", id);
  const item = cartState.findIndex((product) => product.id == id);

  cartState.splice(item, 1);
  updateCartUI();
}

// Function to increment quantity
function incrementQuantity(id) {
  cartState = cartState.map((item) =>
    item.id == id ? { ...item, quantity: item.quantity + 1 } : item
  );

  // Update the cart UI and product list UI
  updateCartUI(); // Refresh product UI to show the updated quantity
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
  }
}
