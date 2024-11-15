document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const totalAmountElement = document.getElementById('totalAmount');
    let totalAmount = 0;
    let cartItems = [];
    
    if (!token) {
        Swal.fire({
            title: 'Chưa đăng nhập!',
            text: 'Vui lòng đăng nhập để xem giỏ hàng',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng nhập ngay',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
        });
        return;
    }
    
    loadCart();
    
    function loadCart() {
        // Hiển thị loading
        Swal.fire({
            title: 'Đang tải...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch('http://localhost/CuaHangDT/api/gioHang/get_cart.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            Swal.close(); // Đóng loading
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
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải giỏ hàng',
                confirmButtonColor: '#d33'
            });
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
                    updateCartQuantities([{
                        product_id: productId,
                        quantity: (currentQuantity - 1).toString()
                    }]);
                } else if (currentQuantity === 1) {
                    Swal.fire({
                        title: 'Xác nhận xóa?',
                        text: 'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Có, xóa nó!',
                        cancelButtonText: 'Hủy'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            removeItem(productId);
                        }
                    });
                }
            });
        });

        // Increase quantity
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const currentQuantityElement = this.parentElement.querySelector('.quantity-value');
                const currentQuantity = parseInt(currentQuantityElement.textContent);
                
                updateCartQuantities([{
                    product_id: productId,
                    quantity: (currentQuantity + 1).toString()
                }]);
            });
        });

        // Delete item
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                Swal.fire({
                    title: 'Xác nhận xóa?',
                    text: 'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Có, xóa nó!',
                    cancelButtonText: 'Hủy'
                }).then((result) => {
                    if (result.isConfirmed) {
                        removeItem(productId);
                    }
                });
            });
        });
    }

    function updateCartQuantities(items) {
        Swal.fire({
            title: 'Đang cập nhật...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

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
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đã cập nhật số lượng',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true
                });
                loadCart();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể cập nhật số lượng',
                    confirmButtonColor: '#d33'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi cập nhật giỏ hàng',
                confirmButtonColor: '#d33'
            });
        });
    }

    function removeItem(productId) {
        Swal.fire({
            title: 'Đang xóa...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch('http://localhost/CuaHangDT/api/gioHang/remove_from_cart.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Product was removed from cart.") {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đã xóa sản phẩm',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true
                });
                loadCart();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể xóa sản phẩm',
                    confirmButtonColor: '#d33'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi xóa sản phẩm',
                confirmButtonColor: '#d33'
            });
        });
    }
});

