document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const totalAmountElement = document.getElementById('totalAmount');
    let totalAmount = 0;
    let cartItems = [];
    
    if (!token) {
        alert('Token không tồn tại. Vui lòng đăng nhập.');
        return;
    }
    
    loadCart();
    
    function loadCart() {
        fetch('http://localhost/CuaHangDT/api/gioHang/get_cart.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const cartList = document.getElementById('cartItems');
            cartList.innerHTML = '';
            cartItems = data.records || [];
            totalAmount = 0;
            
            if (cartItems.length > 0) {
                cartItems.forEach(item => {
                    const cartItemRow = document.createElement('tr');
                    cartItemRow.innerHTML = `
                        <td><img src="${item.thumbnail}" alt="${item.product_name}" class="img-thumbnail" style="width: 100px;"></td>
                        <td>${item.product_name}</td>
                        <td>${Number(item.price).toLocaleString()} VND</td>
                        <td>
                            <div class="quantity-controls">
                                <button class="btn btn-sm btn-primary decrease-btn" data-product-id="${item.product_id}">-</button>
                                <span class="mx-2 quantity-value">${item.quantity}</span>
                                <button class="btn btn-sm btn-primary increase-btn" data-product-id="${item.product_id}">+</button>
                            </div>
                        </td>
                        <td>${Number(item.price * item.quantity).toLocaleString()} VND</td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-btn" data-product-id="${item.product_id}">Xóa</button>
                        </td>
                    `;
                    cartList.appendChild(cartItemRow);
                    totalAmount += item.price * item.quantity;
                });
                
                totalAmountElement.innerText = `${Number(totalAmount).toLocaleString()} VND`;
                
                // Add event listeners for buttons
                addQuantityControlListeners();
            } else {
                cartList.innerHTML = '<tr><td colspan="6" class="text-center">Giỏ hàng của bạn trống.</td></tr>';
                totalAmountElement.innerText = '0 VND';
            }
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
            alert('Có lỗi xảy ra khi tải giỏ hàng');
        });
    }

    function addQuantityControlListeners() {
        // Decrease quantity
        document.querySelectorAll('.decrease-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const currentQuantityElement = this.parentElement.querySelector('.quantity-value');
                const currentQuantity = parseInt(currentQuantityElement.textContent);
                
                if (currentQuantity > 1) {
                    // Chuẩn bị dữ liệu cho API
                    const updatedItems = cartItems.map(item => ({
                        product_id: item.product_id.toString(),
                        quantity: item.product_id.toString() === productId ? 
                            (currentQuantity - 1).toString() : 
                            item.quantity.toString()
                    }));

                    updateCartQuantities(updatedItems);
                } else if (currentQuantity === 1) {
                    if (confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                        removeItem(productId);
                    }
                }
            });
        });

        // Increase quantity
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const currentQuantityElement = this.parentElement.querySelector('.quantity-value');
                const currentQuantity = parseInt(currentQuantityElement.textContent);
                
                // Chuẩn bị dữ liệu cho API
                const updatedItems = cartItems.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.product_id.toString() === productId ? 
                        (currentQuantity + 1).toString() : 
                        item.quantity.toString()
                }));

                updateCartQuantities(updatedItems);
            });
        });

        // Delete item
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                removeItem(productId);
            });
        });
    }

    function updateCartQuantities(items) {
        fetch('http://localhost/CuaHangDT/api/gioHang/update_quantities.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: items })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Cart quantity was updated.") {
                loadCart(); // Reload cart after successful update
            } else {
                alert('Cập nhật số lượng sản phẩm không thành công.');
            }
        })
        .catch(error => {
            console.error('Error updating cart items:', error);
            alert('Có lỗi xảy ra khi cập nhật giỏ hàng');
        });
    }

    function removeItem(productId) { 
        const token = localStorage.getItem('token'); 
        if (!token) { 
            alert('Token không tồn tại. Vui lòng đăng nhập.'); 
            return; 
        } 
        fetch('http://localhost/CuaHangDT/api/gioHang/remove_from_cart.php', { 
            method: 'DELETE', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify({ 
                product_id: productId 
            }) }) 
            .then(response => response.json()) 
            .then(data => { 
                if (data.message === "Product was removed from cart.") { 
                    loadCart(); 
                    // Gọi hàm loadCart để tải lại giỏ hàng 
                } 
                else { 
                    alert('Xóa sản phẩm không thành công.'); 
                } 
            }) 
            .catch(error => { 
                console.error('Error removing cart item:', error); 
                alert('Có lỗi xảy ra khi xóa sản phẩm'); 
            }
        );
    }

    
});

