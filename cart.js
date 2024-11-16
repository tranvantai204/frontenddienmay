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
        // Xử lý nút giảm số lượng
        document.querySelectorAll('.decrease-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const quantitySpan = this.parentElement.querySelector('.quantity-value');
                let currentQuantity = parseInt(quantitySpan.textContent);

                if (currentQuantity <= 1) {
                    // Thông báo xác nhận nhanh
                    Swal.fire({
                        title: 'Xóa sản phẩm?',
                        text: "bạn có muốn xóa sản phẩm này?",
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Xóa',
                        cancelButtonText: 'Hủy',
                        timer: 5000,
                        timerProgressBar: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            deleteCartItem(productId);
                        }
                    });
                } else {
                    updateQuantity(productId, currentQuantity - 1);
                }
            });
        });

        // Xử lý nút tăng số lượng
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const quantitySpan = this.parentElement.querySelector('.quantity-value');
                let currentQuantity = parseInt(quantitySpan.textContent);
                updateQuantity(productId, currentQuantity + 1);
            });
        });

        // Xử lý nút xóa
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const productName = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                
                Swal.fire({
                    title: 'Xóa sản phẩm?',
                    text: `Xóa "${productName}" khỏi giỏ hàng?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Xóa',
                    cancelButtonText: 'Hủy',
                    timer: 5000,
                    timerProgressBar: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteCartItem(productId);
                    }
                });
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

    // Hàm xóa sản phẩm
    function deleteCartItem(productId) {
        const token = localStorage.getItem('token');

        // Hiển thị loading ngắn gọn
        Swal.fire({
            title: 'Đang xóa...',
            allowOutsideClick: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Debug: Log request
        console.log('Deleting product:', productId);

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
        .then(response => {
            // Debug: Log response status
            console.log('Response status:', response.status);
            return response.text();
        })
        .then(text => {
            // Debug: Log raw response
            console.log('Raw response:', text);

            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);

                // Kiểm tra nhiều loại message có thể có
                if (data.message === "Product was removed from cart." || 
                    data.message === "Cart item deleted." ||
                    data.message === "Deleted successfully") {
                    
                    // Tắt loading và hiển thị thành công
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa sản phẩm',
                        showConfirmButton: false,
                        timer: 800
                    });

                    // Load lại giỏ hàng
                    setTimeout(() => {
                        loadCart();
                    }, 500);
                } else {
                    // Nếu có lỗi cụ thể từ server
                    throw new Error(data.message || 'Không thể xóa sản phẩm');
                }
            } catch (e) {
                console.error('Parse or processing error:', e);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể xóa sản phẩm. Vui lòng thử lại.',
                    showConfirmButton: true,
                    timer: 1500
                });
            }
        })
        .catch(error => {
            console.error('Network or other error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
                showConfirmButton: true,
                timer: 1500
            });
        });
    }

    // Thêm event listener cho nút thanh toán
    document.querySelector('.checkout-btn').addEventListener('click', function() {
        // Kiểm tra xem giỏ hàng có trống không
        const cartItems = document.querySelectorAll('#cartItems tr');
        const isEmpty = cartItems.length === 0 || 
                       (cartItems.length === 1 && cartItems[0].querySelector('td').colSpan === 6);

        if (isEmpty) {
            Swal.fire({
                icon: 'warning',
                title: 'Giỏ hàng trống',
                text: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán!',
                confirmButtonText: 'Đồng ý',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Nếu giỏ hàng có sản phẩm
        Swal.fire({
            title: 'Xác nhận thanh toán',
            text: 'Bạn có muốn tiến hành thanh toán không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Thanh toán ngay',
            cancelButtonText: 'Để sau',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise((resolve) => {
                    // Hiển thị form điền thông tin
                    Swal.fire({
                        title: 'Thông tin giao hàng',
                        html: `
                            <form id="shippingForm" class="text-left">
                                <div class="form-group mb-3">
                                    <label for="fullName">Họ và tên</label>
                                    <input type="text" id="fullName" class="form-control" required>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="phone">Số điện thoại</label>
                                    <input type="tel" id="phone" class="form-control" required>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="address">Địa chỉ giao hàng</label>
                                    <textarea id="address" class="form-control" rows="3" required></textarea>
                                </div>
                                <div class="form-group mb-3">
                                    <label>Phương thức thanh toán</label>
                                    <div class="form-check">
                                        <input type="radio" id="cod" name="paymentMethod" class="form-check-input" value="cod" checked>
                                        <label class="form-check-label" for="cod">Thanh toán khi nhận hàng (COD)</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="radio" id="banking" name="paymentMethod" class="form-check-input" value="banking">
                                        <label class="form-check-label" for="banking">Chuyển khoản ngân hàng</label>
                                    </div>
                                </div>
                            </form>
                        `,
                        confirmButtonText: 'Xác nhận',
                        cancelButtonText: 'Hủy',
                        showCancelButton: true,
                        focusConfirm: false,
                        preConfirm: () => {
                            const form = document.getElementById('shippingForm');
                            if (!form.checkValidity()) {
                                Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
                                return false;
                            }
                            return {
                                fullName: document.getElementById('fullName').value,
                                phone: document.getElementById('phone').value,
                                address: document.getElementById('address').value,
                                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
                            };
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Xử lý đơn hàng thành công
                            Swal.fire({
                                icon: 'success',
                                title: 'Đặt hàng thành công!',
                                text: 'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm nhất!',
                                confirmButtonText: 'Đồng ý',
                                allowOutsideClick: false
                            }).then(() => {
                                // Chuyển hướng về trang chủ hoặc trang đơn hàng
                                window.location.href = 'home.html';
                            });
                        }
                    });
                    resolve();
                });
            }
        });
    });

    // Thêm CSS cho form thanh toán
    const style = document.createElement('style');
    style.textContent = `
        .text-left {
            text-align: left;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-control {
            display: block;
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
            transition: border-color 0.15s ease-in-out;
        }
        .form-control:focus {
            border-color: #80bdff;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        }
        .form-check {
            margin-bottom: 0.5rem;
        }
        .mb-3 {
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(style);
});

