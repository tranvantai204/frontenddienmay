document.addEventListener('DOMContentLoaded', function() {
    const category = document.body.getAttribute('data-category'); // Thêm 'data-category' vào thẻ <body> của mỗi trang
    displaySearchHistory(category);

    // Gọi hiển thị sản phẩm và thêm sự kiện cho nút tìm kiếm
    fetchProducts(category);
    document.getElementById("search-button").addEventListener("click", function() {
        searchProducts(category);
    });
});

// Tải và hiển thị sản phẩm từ API
function fetchProducts(category) {
    fetch(`http://localhost/CuaHangDT/api/sanpham/read.php?category=${category}&page=1&limit=10&sort_by=price&sort_order=ASC`)
    .then(response => response.json())
    .then(data => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = data.data.map(createProductHTML).join("");
    })
    .catch(error => console.error('Error fetching products:', error));
}

// Tạo cấu trúc HTML của sản phẩm
function createProductHTML(product) {
    return `
        <div class="product" onclick="redirectToProduct(${product.product_id})">
            <img src="${product.thumbnail_image}" alt="${product.product_name}">
            <h4><a href="#">${product.product_name}</a></h4>
            <p class="product-price">Giá: ${Number(product.price).toLocaleString()} triệu VND</p>
            <div><button onclick="addToCart(event, ${product.product_id}, 1)">Thêm vào giỏ hàng</button></div>
        </div>
    `;
}

// Chuyển hướng đến trang thông tin sản phẩm
function redirectToProduct(productId) {
    window.location.href = `informationproduct.html?id=${productId}`;
}

// Thêm sản phẩm vào giỏ hàng với xác thực
function addToCart(event, productId, quantity) {
    event.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn chưa đang nhập, vui lòng đăng nhập để thêm.');
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
        alert(data.message === "Product added to cart successfully." ? 'Thêm vào giỏ hàng thành công!' : 'Không thể thêm vào giỏ hàng.');
    })
    .catch(error => console.error('Lỗi:', error));
}

// Tìm kiếm sản phẩm theo tên và hiển thị kết quả
function searchProducts() {
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    const products = document.querySelectorAll(".product");
    let found = false;
    products.forEach(product => {
    // document.querySelectorAll(".product").forEach((product) => {
        const productName = product.querySelector("h4 a").innerText.toLowerCase();
        if (productName.includes(searchValue)) {
            product.style.display = "block";
            found = true;
        } else {
            product.style.display = "none";
        }
        // product.style.display = productName.includes(searchValue) ? "block" : "none";
    });
    if (found) {
        saveSearchHistory(searchValue);
    } else {
        alert('Không tìm thấy sản phẩm phù hợp.');
    }
    // saveSearchHistory(searchValue);
}

// Lưu và hiển thị lịch sử tìm kiếm theo danh mục
function saveSearchHistory(searchTerm, category) {
    if (!searchTerm) return;
    const historyKey = `searchHistory_${category}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    if (!history.includes(searchTerm)) {
        history.push(searchTerm);
        localStorage.setItem(historyKey, JSON.stringify(history));
    }
}

function displaySearchHistory(category) {
    const historyContainer = document.getElementById("history-container");
    const historyKey = `searchHistory_${category}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    historyContainer.innerHTML = history.map(term => `<p>${term}</p>`).join("");
}

// let cartCount = 0;
// function getToken() { 
//     return localStorage.getItem('token'); 
// } 
// function addToCart(event, productId, quantity) { 
//     event.stopPropagation(); // Ngăn chặn sự kiện click truyền lên từ nút tới div cha 
//     const token = getToken(); 
//     if (!token) { 
//         alert('Bạn chưa đang nhập, Vui lòng đăng nhập để thêm.'); 
//         return; 
//     } 
//     const apiUrl = 'http://localhost/CuaHangDT/api/gioHang/add_to_cart.php'; 
//     fetch(apiUrl, { 
//         method: 'POST', 
//         headers: { 
//             'Content-Type': 'application/json', 
//             'Authorization': `Bearer ${token}` 
//         }, 
//         body: JSON.stringify({ 
//             product_id: productId, 
//             quantity: quantity 
//         }) 
//     }) 
//     .then(response => response.json()) 
//     .then(data => { 
//         if (data.message === "Product added to cart successfully.") { 
//             alert('Thêm vào giỏ hàng thành công!'); 
//         } else { 
//             alert('Không thể thêm vào giỏ hàng.'); 
//         } 
//     }) 
//     .catch(error => console.error('Lỗi:', error)); 
// }


// function searchProducts() {
//     const searchInput = document.getElementById("search-input");
//     const products = document.querySelectorAll(".product");
//     const searchValue = searchInput.value.toLowerCase();

//     products.forEach((product) => {
//         const productName = product.querySelector("h4 a").innerText.toLowerCase();
//         if (productName.includes(searchValue)) {
//             product.style.display = "block";
//         } else {
//             product.style.display = "none";
//         }
//     });
//     saveSearchHistory(searchValue);
// }

// function saveSearchHistory (searchTerm){
//     if (!searchTerm) return;
//     let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
//     if (!history.includes(searchTerm)) {
//         history.push(searchTerm);
//         localStorage.setItem("searchHistory", JSON.stringify(history));
//     }
// }

// function displaySearchHistory(){
//     const historyContainer = document.getElementById("history-container");
//     let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
//     historyContainer.innerHTML = history.map(term => `<p>${term}</p>`).join("");
// }

// document.addEventListener(`DOMContentLoaded`, function() {
//     displaySearchHistory();

//     const searchButton = document.getElementById("search-button");
//     searchButton.addEventListener("click",function() {
//         searchProducts();
//     });
// });
