// cart.js

// Hàm để tải giỏ hàng từ LocalStorage và hiển thị nó trên trang
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = ''; // Xóa nội dung cũ

    // Nếu giỏ hàng trống
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Giỏ hàng của bạn hiện đang trống.</p>';
        document.getElementById('totalAmount').innerText = '$0.00';
        return;
    }

    let totalAmount = 0; // Biến để tính tổng giá trị đơn hàng

    // Duyệt qua từng sản phẩm trong giỏ hàng và thêm vào giao diện
    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="item-info">
                <p><strong>${item.name}</strong></p>
                <p>Giá: ${item.price} VND</p>
            </div>
            <button class="remove-from-cart-btn" onclick="removeFromCart(${index})">Xóa</button>
        `;
        cartItemsContainer.appendChild(row);

        // Cộng dồn giá trị vào tổng
        totalAmount += parseFloat(item.price);
    });

    // Cập nhật tổng giá trị đơn hàng
    document.getElementById('totalAmount').innerText = totalAmount.toFixed(2) + ' VND';
}

// Hàm để xóa sản phẩm khỏi giỏ hàng
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1); // Xóa sản phẩm khỏi giỏ hàng
    localStorage.setItem('cart', JSON.stringify(cart)); // Cập nhật LocalStorage
    loadCart(); // Tải lại giỏ hàng
}

// Gọi hàm loadCart khi trang được tải
window.onload = loadCart;