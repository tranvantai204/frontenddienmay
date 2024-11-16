let slideIndex = 1;
function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    const thumbnails = document.getElementsByClassName("thumbnail");

    const slideCount = slides.length; // Cập nhật số lượng slide
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
        thumbnails[i].classList.remove("active-thumbnail");
    }
    // slideIndex++;
    if (slideIndex > slideCount) {
        slideIndex = 1;
    }else if(slideIndex < 1){
        slideIndex = slideCount;
    }
    slides[slideIndex - 1].style.display = "block";
    thumbnails[slideIndex -1].classList.add("active-thumbnail");
    // Cập nhật số lượng slide
    const slideNumberDisplay = document.getElementById('slide-number');
    slideNumberDisplay.innerHTML = `${slideIndex} / ${slideCount}`;
}

function currentSlide(n){
    slideIndex = n;
    showSlides();
}

function plusSlides(n) {
    slideIndex += n;
    showSlides();
}

document.addEventListener('DOMContentLoaded', function() {
    setupAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        fetchProductDetails(productId);
    }
});

function setupAuth() {
    const token = localStorage.getItem('token');
    const username = getUsernameFromToken(token);
    
    if (username) {
        document.getElementById('username').innerText = username;
        document.getElementById('greeting').style.display = 'inline';
        document.getElementById('account-link').style.display = 'inline';
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline';
    } else {
        document.getElementById('greeting').style.display = 'none';
        document.getElementById('account-link').style.display = 'none';
        document.getElementById('login-link').style.display = 'inline';
        document.getElementById('logout-link').style.display = 'none';
    }
}

function getUsernameFromToken(token) {
    if (!token) return null;
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(atob(payloadBase64));
    return payload.data?.username || null;
}

function fetchProductDetails(productId) {
    fetch(`http://localhost/CuaHangDT/api/sanpham/show.php?id=${productId}`)
        .then(response => response.json())
        .then(product => {
            console.log('Product data:', product);
            console.log('Description:', product.description);
            
            const productDetail = document.getElementById('product-detail');
            productDetail.innerHTML = `
                <div class="product-container">
                    <div class="product-gallery">
                        <div class="slideshow-container">
                            <div class="mySlides">
                                <img src="${product.thumbnail_image}" alt="${product.product_name}">
                            </div>
                            <div class="mySlides">
                                <img src="${product.detail_image1}" alt="${product.product_name}">
                            </div>
                            <div class="mySlides">
                                <img src="${product.detail_image2}" alt="${product.product_name}">
                            </div>
                            <div class="mySlides">
                                <img src="${product.detail_image3}" alt="${product.product_name}">
                            </div>
                            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                            <a class="next" onclick="plusSlides(1)">&#10095;</a>
                        </div>
                        <div id="slide-number"></div>
                        <div class="thumbnail-grid">
                            <img class="thumbnail" src="${product.thumbnail_image}" onclick="currentSlide(1)">
                            <img class="thumbnail" src="${product.detail_image1}" onclick="currentSlide(2)">
                            <img class="thumbnail" src="${product.detail_image2}" onclick="currentSlide(3)">
                            <img class="thumbnail" src="${product.detail_image3}" onclick="currentSlide(4)">
                        </div>
                    </div>
                    <div class="product-info">
                        <h1 class="product-title">${product.product_name}</h1>
                        <div class="product-price">
                            <span class="current-price">${Number(product.price).toLocaleString()} VND</span>
                        </div>
                        
                        <div class="product-description">
                            <h3>Mô tả sản phẩm</h3>
                            <div class="description-content">
                                ${product.mota || product.description || 'Chưa có mô tả cho sản phẩm này'}
                            </div>
                        </div>

                        <div class="product-details">
                            <h3>Chi tiết sản phẩm</h3>
                            <ul>
                                <li><strong>Danh mục:</strong> ${product.category_name || 'Đang cập nhật'}</li>
                                <li><strong>Thương hiệu:</strong> ${product.brand || 'Đang cập nhật'}</li>
                                <li><strong>Tình trạng:</strong> ${product.status || 'Còn hàng'}</li>
                            </ul>
                        </div>

                        <div class="product-actions">
                            <button class="buy-now-btn" onclick="buyNow(${product.product_id})">
                                <i class="fas fa-bolt"></i> Mua ngay
                            </button>
                            <button class="add-to-cart-btn" onclick="addToCart(event, ${product.product_id}, 1)">
                                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
                            </button>
                            <button class="continue-shopping-btn" onclick="window.location.href='home.html'">
                                <i class="fas fa-arrow-left"></i> Tiếp tục mua hàng
                            </button>
                        </div>
                        <div class="product-policies">
                            <div class="policy-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>Bảo hành chính hãng 12 tháng</span>
                            </div>
                            <div class="policy-item">
                                <i class="fas fa-sync"></i>
                                <span>Đổi trả trong 7 ngày</span>
                            </div>
                            <div class="policy-item">
                                <i class="fas fa-truck"></i>
                                <span>Giao hàng toàn quốc</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            showSlides();
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải thông tin sản phẩm.',
                confirmButtonText: 'OK'
            });
        });
}

function addToCart(event, productId, quantity) {
    if (event) {
        event.stopPropagation();
    }
    
    const token = localStorage.getItem('token');
    console.log('Adding to cart:', {productId, quantity, token}); // Thêm log để debug
    
    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!',
            confirmButtonText: 'OK'
        });
        return;
    }

    fetch('http://localhost/CuaHangDT/api/gioHang/add_to_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: parseInt(productId),
            quantity: parseInt(quantity)
        })
    })
    .then(response => {
        console.log('Response status:', response.status); // Thêm log để kiểm tra response
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data); // Thêm log để kiểm tra data
        if (data.message === "Product added to cart successfully.") {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Sản phẩm đã được thêm vào giỏ hàng!',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: 1500
            });
        } else {
            throw new Error(data.message || 'Lỗi không xác định');
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Đã xảy ra lỗi khi thêm vào giỏ hàng.',
            confirmButtonText: 'OK'
        });
    });
}

function buyNow(productId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Bạn cần đăng nhập để mua hàng!',
            confirmButtonText: 'OK'
        });
        return;
    }

    fetch('http://localhost/CuaHangDT/api/gioHang/add_to_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: parseInt(productId),
            quantity: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Product added to cart successfully.") {
            window.location.href = 'cart.html';
        } else {
            throw new Error(data.message || 'Lỗi không xác định');
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Đã xảy ra lỗi khi thêm vào giỏ hàng.',
            confirmButtonText: 'OK'
        });
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}



