function addToCart(event) {
    event.preventDefault();
    const productName = event.target.parentNode.querySelector("h4 a").innerText;
    const productPrice = event.target.parentNode.querySelector(".product-price").innerText;

    // Cập nhật số lượng giỏ hàng
    cartCount++;
    document.getElementById("cart-count").innerText = cartCount;

    // Thêm sản phẩm vào giỏ hàng trong LocalStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name: productName, price: productPrice });
    localStorage.setItem('cart', JSON.stringify(cart));

    // Thêm hiệu ứng đưa vào giỏ hàng
    const cartIcon = document.querySelector(".cart i");
    const productImg = event.target.parentNode.querySelector("img");
    const cartAnimation = productImg.cloneNode(true);
    cartAnimation.classList.add("cart-animation");
    cartAnimation.style.position = "absolute";
    cartAnimation.style.top = event.clientY + "px";
    cartAnimation.style.left = event.clientX + "px";
    document.body.appendChild(cartAnimation);

    setTimeout(() => {
        cartAnimation.style.transform = "translateX(" + (cartIcon.offsetLeft - event.clientX) + "px) translateY(" + (cartIcon.offsetTop - event.clientY) + "px)";
    }, 0);

    setTimeout(() => {
        cartAnimation.remove();
    }, 500);
}
// Initialize cart count
let cartCount = 0;

// Load cart data from local storage on page load
window.onload = function() {
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    cartCount = cartData.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cart-count").innerText = cartCount;
};

function addToCart(productName, productPrice) {
    // Load existing cart data
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product is already in the cart
    const existingProductIndex = cart.findIndex(item => item.name === productName);
    if (existingProductIndex > -1) {
        // If it exists, increase the quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // If it doesn't exist, add it to the cart
        cart.push({ name: productName, price: productPrice, quantity: 1 });
    }

    // Save updated cart back to local storage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    cartCount++;
    document.getElementById("cart-count").innerText = cartCount;
}