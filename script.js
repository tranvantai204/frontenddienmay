document.getElementById('searchInput').addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#accountTable tr');

    rows.forEach(row => {
        const account = row.cells[1].textContent.toLowerCase();
        row.style.display = account.includes(filter) ? '' : 'none';
    });
});
let editingRow = null;

function openAddProductModal() {
    document.getElementById('modalTitle').innerText = 'Thêm sản phẩm';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    editingRow = null;
    document.getElementById('productModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function saveProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;

    if (editingRow) {
        // Cập nhật sản phẩm hiện tại
        editingRow.cells[1].innerText = name;
        editingRow.cells[2].innerText = price + ' VND';
    } else {
        // Thêm sản phẩm mới
        const table = document.getElementById('productTable');
        const row = table.insertRow();
        row.innerHTML = `
            <td>${table.rows.length}</td>
            <td>${name}</td>
            <td>${price} VND</td>
            <td>
                <button class="edit-btn" onclick="editProduct(this)">Sửa</button>
                <button class="delete-btn" onclick="deleteProduct(this)">Xóa</button>
            </td>
        `;
    }
    closeModal();
}

function editProduct(button) {
    editingRow = button.parentElement.parentElement;
    document.getElementById('modalTitle').innerText = 'Sửa sản phẩm';
    document.getElementById('productName').value = editingRow.cells[1].innerText;
    document.getElementById('productPrice').value = parseInt(editingRow.cells[2].innerText);
    document.getElementById('productModal').style.display = 'block';
}

function deleteProduct(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}
// script.js

// Hàm hiển thị danh sách sản phẩm từ LocalStorage
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const table = document.getElementById('productTable');
    table.innerHTML = ''; // Xóa nội dung cũ

    products.forEach((product, index) => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.price} VND</td>
            <td>
                <button class="edit-btn" onclick="editProduct(this)">Sửa</button>
                <button class="delete-btn" onclick="deleteProduct(this)">Xóa</button>
            </td>
        `;
    });
}

// Gọi hàm loadProducts khi trang được tải
window.onload = loadProducts;

// Hàm xóa sản phẩm
function deleteProduct(button) {
    const row = button.parentElement.parentElement;
    const index = row.rowIndex - 1; // Lấy chỉ số sản phẩm

    let products = JSON.parse(localStorage.getItem('products'));
    products.splice(index, 1); // Xóa sản phẩm khỏi mảng
    localStorage.setItem('products', JSON.stringify(products)); // Cập nhật LocalStorage

    loadProducts(); // Tải lại danh sách sản phẩm
}
// Function to get query parameters
function getQueryParams(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

// Pre-fill the form with existing account details
document.addEventListener("DOMContentLoaded", function() {
    const email = getQueryParams("email");
    // Here you would typically fetch the account details from your server
    // Simulating data fetching with a static example:
    const existingAccount = {
        email: email,
        brand: "FOODBOOK",
        stores: "FOODBOOK: Toàn hệ thống",
        status: "active"
    };

    // Populate the form fields
    document.getElementById("email").value = existingAccount.email;
    document.getElementById("brand").value = existingAccount.brand;
    document.getElementById("stores").value = existingAccount.stores;
    document.getElementById("status").value = existingAccount.status;
});

// JavaScript to handle form submission
document.getElementById("editAccountForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const email = document.getElementById("email").value;
    const brand = document.getElementById("brand").value;
    const stores = document.getElementById("stores").value;
    const status = document.getElementById("status").value;

    // Here, you would typically send this data to your server via AJAX
    console.log("Updated Account Info:", { email, brand, stores, status });

    // Redirect back to account list or show a success message
    alert("Tài khoản đã được cập nhật thành công!");
    location.href = 'account_list.html'; // Redirect back to the account list
});
       // JavaScript code for handling registration
       document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect the form data
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        // Here you would typically send the data to your server for processing.
        // For now, we will just display a success message.
        alert(`Đăng ký thành công!\nTên đăng nhập: ${username}\nEmail: ${email}\nSố điện thoại: ${phone}`);
        
        // Optionally, redirect to the login page
        // window.location.href = 'login.html'; 
    });
            // Chuyển hướng đến trang cập nhật sản phẩm cùng với ID sản phẩm
            function redirectToUpdatePage(productId) {
                location.href = `updateproduct.html?id=${productId}`;
            }
    
            function deleteProduct(button) {
                const row = button.parentElement.parentElement;
                row.remove(); // Xóa sản phẩm khỏi giao diện (giả lập)
                alert('Sản phẩm đã được xóa!');
            }



