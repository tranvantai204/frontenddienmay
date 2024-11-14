
// document.addEventListener('DOMContentLoaded', function() {
//     fetch('http://localhost/CuaHangDT/api/sanpham/read.php?category_id=${category_id}')
//     .then(response => response.json())
//     .then(data => {
//         const productList = document.getElementById('product-list');
//         data.data.forEach(product => {
//             const productDiv = document.createElement('div');
//             productDiv.className = 'product';
//             productDiv.addEventListener('click', function() {
//                 window.location.href = `informationproduct.html?id=${product.product_id}`;
//             });

//             productDiv.innerHTML = `
//                 <h4>Bộ lọc</h4>
//                 <form id="filter-form">
//                 <label for="price">Giá: VND</label>
//                 <select id="price" name="price">
//                     <option value="all">Tất cả</option>
//                     <option value="0-500">Dưới $500</option>
//                     <option value="500-1000">$500 - $1000</option>
//                     <option value="1000-1500">$1000 - $1500</option>
//                     <option value="1500+">Trên $1500</option>
//                 </select>
               

//             `;
//             productList.appendChild(productDiv);
//         });
//     }) 
//     .catch(error => console.error('Error fetching products:', error));
// });
// {/* <img src="${product.thumbnail_image}" alt="${product.product_name}">
// <h4><a href="#">${product.product_name}</a></h4>
// <p class="product-price">Giá: </p> */}