document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.products');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    
    let allProducts = [];
    let currentIndex = 0;
    const productsToShow = 20;
    let isAnimating = false;
    
    function fetchProducts() {
        const token = localStorage.getItem('token');
        fetch('http://localhost/CuaHangDT/api/sanPham/read.php', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                allProducts = data.data;
                displayProducts();
                updateNavButtons();
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function displayProducts() {
        // Tạo một mảng sản phẩm hiển thị
        let productsToDisplay = [];
        
        // Lấy 5 sản phẩm từ vị trí hiện tại
        for(let i = 0; i < productsToShow; i++) {
            if(allProducts[currentIndex + i]) {
                productsToDisplay.push(allProducts[currentIndex + i]);
            }
        }
        
        // Tạo HTML cho tất cả sản phẩm
        const productsHTML = productsToDisplay.map(product => createProductHTML(product)).join('');
        
        // Tạo wrapper mới với class để animation
        const wrapper = document.createElement('div');
        wrapper.className = 'products-wrapper';
        wrapper.innerHTML = productsHTML;
        
        // Thêm class animation tương ứng
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateX(20px)';
        
        // Xóa wrapper cũ nếu có
        const oldWrapper = container.querySelector('.products-wrapper');
        if (oldWrapper) {
            oldWrapper.remove();
        }
        
        // Thêm wrapper mới
        container.appendChild(wrapper);
        
        // Force reflow
        wrapper.offsetHeight;
        
        // Thêm animation
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'translateX(0)';
    }
    
    function updateNavButtons() {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex + productsToShow >= allProducts.length;
        prevButton.classList.toggle('disabled', currentIndex === 0);
        nextButton.classList.toggle('disabled', currentIndex + productsToShow >= allProducts.length);
    }
    
    prevButton.addEventListener('click', () => {
        if(currentIndex > 0 && !isAnimating) {
            isAnimating = true;
            currentIndex--;
            displayProducts();
            updateNavButtons();
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }
    });
    
    nextButton.addEventListener('click', () => {
        if(currentIndex + productsToShow < allProducts.length && !isAnimating) {
            isAnimating = true;
            currentIndex++;
            displayProducts();
            updateNavButtons();
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }
    });
    
    fetchProducts();
});

function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found');
        return;
    }

    fetch('http://localhost/CuaHangDT/api/gioHang/read.php', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Cart data:', data);
        if (data.data) {
            const totalQuantity = data.data.reduce((sum, item) => {
                console.log('Item:', item);
                console.log('Quantity:', item.quantity);
                return sum + parseInt(item.quantity);
            }, 0);
            console.log('Total quantity:', totalQuantity);
            document.getElementById('cart-count').textContent = totalQuantity;
        } else {
            document.getElementById('cart-count').textContent = '0';
        }
    })
    .catch(error => {
        console.error('Error fetching cart count:', error);
        document.getElementById('cart-count').textContent = '0';
    });
}

function fetchProducts() {
    fetch('http://localhost/CuaHangDT/api/sanpham/read.php?page=1&limit=20&sort_by=price&sort_order=ASC')
    .then(response => response.json())
    .then(data => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = data.data.map(createProductHTML).join("");
    })
    .catch(error => console.error('Error fetching products:', error));
}

function createProductHTML(product) {
    return `
        <div class="product" onclick="redirectToProduct(${product.product_id})">
            <div class="discount-label">
                ${product.discount ? `Giảm ${product.discount}%` : ''}
            </div>
            
            <div class="product-image">
                <img src="${product.thumbnail_image}" alt="${product.product_name}">
            </div>
            
            <div class="product-info">
                <h4 class="product-name">${product.product_name}</h4>
                
                <div class="price-container">
                    <span class="current-price">${Number(product.price).toLocaleString()}đ</span>
                    ${product.original_price ? `
                        <span class="original-price">${Number(product.original_price).toLocaleString()}đ</span>
                    ` : ''}
                </div>

                <div class="promotion-info">
                    <span class="promo-tag">Trả góp 0%</span>
                    <div class="member-discount">
                        Smember giảm thêm đến ${(product.price * 0.02).toLocaleString()}đ
                    </div>
                </div>

                <div class="product-action">
                    <button onclick="addToCart(event, ${product.product_id}, 1)">Thêm vào giỏ hàng</button>
                </div>
            </div>
        </div>
    `;
}

function redirectToProduct(productId) {
    window.location.href = `informationproduct.html?id=${productId}`;
}

function addToCart(event, productId, quantity) {
    event.stopPropagation();
    const button = event.target;
    
    button.classList.add('button-click');
    setTimeout(() => {
        button.classList.remove('button-click');
    }, 200);

    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Bạn chưa đăng nhập, Vui lòng đăng nhập để thêm!',
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
        body: JSON.stringify({ product_id: productId, quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === "Product added to cart successfully.") {
            const cartCountElement = document.getElementById('cart-count');
            const currentCount = parseInt(cartCountElement.textContent || 0);
            cartCountElement.textContent = currentCount + quantity;

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Sản phẩm đã được thêm vào giỏ hàng thành công!',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: 1500
            });
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

function searchProducts() {
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    const products = document.querySelectorAll(".product");
    let found = false;
    products.forEach(product => {
        const productName = product.querySelector("h4 a").innerText.toLowerCase();
        if (productName.includes(searchValue)) {
            product.style.display = "block";
            found = true;
        } else {
            product.style.display = "none";
        }
    });
    if (found) {
        saveSearchHistory(searchValue);
    } else {
        alert('Không tìm thấy sản phẩm phù hợp.');
    }
}

function saveSearchHistory(searchTerm) {
    if (!searchTerm) return;
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!history.includes(searchTerm)) {
        history.push(searchTerm);
        localStorage.setItem("searchHistory", JSON.stringify(history));
    }
}

function displaySearchHistory() {
    const historyContainer = document.getElementById("history-container");
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    historyContainer.innerHTML = history.map(term => `<p>${term}</p>`).join("");
    historyContainer.style.display = 'block';

    document.querySelectorAll(".history-item").forEach(item =>{
        item.addEventListener('click', function() {
            document.getElementById("search-input").value = item.textContent;
            searchProducts();
        });
    });
}

