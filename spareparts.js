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
document.addEventListener('DOMContentLoaded', function () {
    let productsData = [];

    // Fetch sản phẩm và hiển thị danh sách
    fetch(`http://localhost/CuaHangDT/api/sanpham/read.php?category_id=9`)
        .then(response => response.json())
        .then(data => {
            productsData = data.data;
            renderProducts(productsData);
        })
        .catch(error => console.error('Error fetching products:', error));

    // Hàm hiển thị sản phẩm
    function renderProducts(products) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Xóa nội dung cũ
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.addEventListener('click', function () {
                window.location.href = `informationproduct.html?id=${product.product_id}`;
            });

            productDiv.innerHTML = `
                <img src="${product.thumbnail_image}" alt="${product.product_name}">
                <h4><a href="#">${product.product_name}</a></h4>
                <p class="product-price">Giá: ${Number(product.price).toLocaleString()} triệu VND</p>
                <button onclick="addToCart(event, ${product.product_id}, 1)">Thêm vào giỏ hàng</button>

            `;
            productList.appendChild(productDiv);
        });
    }

    // Hàm lọc sản phẩm
    function filterProducts() {
        const priceFilter = document.getElementById('price').value;
        const filteredProducts = productsData.filter(product => {
            const productPrice = parseInt(product.price);
            if (priceFilter === '0-1000000') {
                return productPrice < 1000000;
            } else if (priceFilter === '1000000-2000000') {
                return productPrice >= 1000000 && productPrice < 2000000;
            } else if (priceFilter === '2000000-3000000') {
                return productPrice >= 2000000 && productPrice < 3000000;
            } else if (priceFilter === '3000000-4000000') {
                return productPrice >= 3000000 && productPrice < 4000000;
            // } else if (priceFilter === '40000000-50000000') {
            //     return productPrice >= 40000000 && productPrice < 50000000;
            }
            return true;
        });
        renderProducts(filteredProducts);
    }

    document.getElementById('filter-form').addEventListener('change', filterProducts);

    // Hiển thị chi tiết sản phẩm nếu có `productId` trong URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetch(`http://localhost/CuaHangDT/api/sanpham/show.php?id=${productId}`)
            .then(response => response.json())
            .then(data => {
                const productDetail = document.getElementById('product-detail');
                const product = data;

                productDetail.innerHTML = `
                    <div class="slideshow-container">
                        <div class="mySlides">
                            <img src="${product.thumbnail_image}" style="width:40%">
                            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                            <a class="next" onclick="plusSlides(1)">&#10095;</a>
                        </div>
                        <div class="mySlides">
                            <img src="${product.detail_image1}" style="width:40%">
                            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                            <a class="next" onclick="plusSlides(1)">&#10095;</a>
                        </div>
                        <div class="mySlides">
                            <img src="${product.detail_image2}" style="width:40%">
                            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                            <a class="next" onclick="plusSlides(1)">&#10095;</a>
                        </div>
                        <div class="mySlides">
                            <img src="${product.detail_image3}" style="width:40%">
                            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                            <a class="next" onclick="plusSlides(1)">&#10095;</a>
                        </div>
                    </div>

                    <div id="slide-number" style="text-align: center; margin-top: 10px;"></div>

                    <div class="thumbnail_grid">
                        <img class="thumbnail" src="${product.thumbnail_image}" style="width:20%" onclick="currentSlide(0)">
                        <img class="thumbnail" src="${product.detail_image1}" style="width:20%" onclick="currentSlide(1)">
                        <img class="thumbnail" src="${product.detail_image2}" style="width:20%" onclick="currentSlide(2)">
                        <img class="thumbnail" src="${product.detail_image3}" style="width:20%" onclick="currentSlide(3)">
                    </div>

                    <div class="product-info">
                        <h4>${product.product_name}</h4>
                        <p>${product.description}</p>
                        <p>Giá: <strong>${Number(product.price).toLocaleString()} VND</strong></p>
                        <button onclick="addToCart(${productId}, 1)">Thêm vào giỏ hàng</button>
                    </div>
                `;
                showSlides(); // Gọi hàm showSlides để khởi động trình chiếu
            })
            .catch(error => console.error('Error fetching product detail:', error));
    }
});
