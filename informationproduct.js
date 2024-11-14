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
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    fetch(`http://localhost/CuaHangDT/api/sanpham/show.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            const productDetail = document.getElementById('product-detail');
            const product = data;

            productDetail.innerHTML += `
                <div class="slideshow-container">
                    <div class="mySlides">
                        <img src="${product.thumbnail_image}" style="width:30%">
                        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                        <a class="next" onclick="plusSlides(1)">&#10095;</a>
                    </div>
                    <div class="mySlides">
                        <img src="${product.detail_image1}" style="width:30%">
                        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                        <a class="next" onclick="plusSlides(1)">&#10095;</a>
                    </div>
                    <div class="mySlides">
                        <img src="${product.detail_image2}" style="width:30%">
                        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                        <a class="next" onclick="plusSlides(1)">&#10095;</a>
                    </div>
                    <div class="mySlides">
                        <img src="${product.detail_image3}" style="width:30%">
                        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                        <a class="next" onclick="plusSlides(1)">&#10095;</a>
                    </div>  
                </div>

                <div id="slide-number" style="text-align: center; margin-top: 10px;"></div>
                <div class ="thumbnail_grid">
                    <img class="thumbnail" src="${product.thumbnail_image}" style="width:40% onclick="currentSlide(1)">
                    <img class="thumbnail" src="${product.detail_image1}" style="width:20%" onclick="currentSlide(2)">
                    <img class="thumbnail" src="${product.detail_image2}" style="width:20%" onclick="currentSlide(3)">
                    <img class="thumbnail" src="${product.detail_image3}" style="width:20%" onclick="currentSlide(4)">
                </div>
                <div class="product-info">
                    <h4>${product.product_name}</h4>
                    <p>${product.description}</p>
                    <p>Giá: <strong>${Number(product.price).toLocaleString()} triệu VND</strong></p>
                    <button onclick="addToCart(${productId}, 1)">Thêm vào giỏ hàng</button>
                </div>
            `;
            // slideCount = document.getElementsByClassName("mySlides").length; // Cập nhật slideCount sau khi thêm HTML
            showSlides();   
        })
        .catch(error => console.error('Error fetching product detail:', error)); 
});
function getToken() {
    return localStorage.getItem('token');
}
function addToCart(productId, quantity) {
    const token = getToken();

    if (!token) {
        alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
        return;
    }
    const apiUrl = 'http://localhost/CuaHangDT/api/gioHang/add_to_cart.php';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Product added to cart successfully.") {
            alert('Thêm vào giỏ hàng thành công!');
        } else {
            alert('Không thể thêm vào giỏ hàng.');
        }
    })
    .catch(error => console.error('Lỗi:', error));
}


