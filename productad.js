let currentPage = 1;
const limit = 10;

// Thêm biến toàn cục để lưu product_id hiện tại
let currentProductId = null;

function fetchProducts(page) {
    currentPage = page;
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = '<tr><td colspan="6">Đang tải...</td></tr>';

    fetch(`http://localhost/CuaHangDT/api/sanPham/read.php?page=${page}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                displayProducts(data.data);
                const totalPages = data.paging.total_pages;
                updatePagination(totalPages);
            } else {
                productTable.innerHTML = '<tr><td colspan="6">Không có dữ liệu</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            productTable.innerHTML = '<tr><td colspan="6">Lỗi khi tải dữ liệu</td></tr>';
        });
}

function updatePagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Nút Previous
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trang trước';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1);
    pagination.appendChild(prevButton);

    // Hiển thị số trang hiện tại
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
    pagination.appendChild(pageInfo);

    // Nút Next
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Trang sau';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1);
    pagination.appendChild(nextButton);
}

function goToPage(page) {
    if (page >= 1) {
        fetchProducts(page);
    }
}

function displayProducts(products) {
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = '';
    
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${(currentPage - 1) * limit + index + 1}</td>
            <td>${product.product_name}</td>
            <td>${product.price} VND</td>
            <td>${product.stock}</td>
            <td><img src="${product.thumbnail_image}" alt="${product.product_name}" style="width: 100px;"></td>
            <td>
                <button class="button-edit" onclick='editProduct(${JSON.stringify(product)})'>Sửa</button>
                <button class="button-delete" onclick="deleteProduct(${product.product_id})">Xóa</button>
            </td>
        `;
        productTable.appendChild(row);
    });
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(1);
    fetchSuppliers();
});

// CSS cho phân trang
const style = document.createElement('style');
style.textContent = `
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin: 20px 0;
    }

    .pagination button {
        padding: 8px 16px;
        background-color: #4a3d93;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .pagination button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .pagination span {
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// Hàm lấy nhà cung cấp
function fetchSuppliers() {
    return fetch('http://localhost/CuaHangDT/api/nhacungcap/read.php')
        .then(response => response.json())
        .then(data => {
            const supplierSelect = document.getElementById('editSupplier');
            supplierSelect.innerHTML = ''; // Xóa các tùy chọn hiện có
            if (data.data && data.data.length > 0) {
                data.data.forEach(supplier => {
                    const option = document.createElement('option');
                    option.value = supplier.supplier_id;
                    option.textContent = supplier.supplier_name;
                    supplierSelect.appendChild(option);
                });
            } else {
                supplierSelect.innerHTML = '<option value="">Không có nhà cung cấp nào.</option>';
            }
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

// Hàm hiển thị modal và điền thông tin sản phẩm
function editProduct(product) {
    console.log('Editing product:', product);
    
    // Lưu product_id vào biến toàn cục
    currentProductId = product.product_id;
    console.log('Set currentProductId:', currentProductId);

    // Set giá trị cho các trường input
    document.getElementById('editProductName').value = product.product_name;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editStock').value = product.stock;
    document.getElementById('editCategory').value = product.category_id;
    document.getElementById('editSupplier').value = product.supplier_id;

    // Hiển thị modal
    document.getElementById('editModal').style.display = 'block';
}

// Hàm đóng modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentProductId = null;
}

// Hàm lưu thay đổi
async function saveProductChanges() {
    try {
        if (!currentProductId) {
            throw new Error('Không tìm thấy ID sản phẩm');
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập');
        }

        // Tạo object dữ liệu
        const productData = {
            product_name: document.getElementById('editProductName').value,
            description: document.getElementById('editDescription').value,
            price: document.getElementById('editPrice').value,
            stock: document.getElementById('editStock').value,
            category_id: document.getElementById('editCategory').value,
            supplier_id: document.getElementById('editSupplier').value
        };

        console.log('Sending data:', productData);

        // Gửi request với PUT method và product_id trong URL
        const response = await fetch(`http://localhost/CuaHangDT/api/sanPham/update.php?id=${currentProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Server response:', data);

        if (data.message === "sanPham Updated") {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Sản phẩm đã được cập nhật',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                currentProductId = null;
                document.getElementById('editModal').style.display = 'none';
                fetchProducts(currentPage);
            });
        } else {
            throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
        }

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            currentProductId: currentProductId
        });

        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: error.message,
            confirmButtonText: 'Đóng'
        });
    }
}

// Thêm hàm kiểm tra token
function checkToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa đăng nhập',
            text: 'Vui lòng đăng nhập để tiếp tục',
            confirmButtonText: 'Đăng nhập ngay',
            confirmButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
        });
        return false;
    }
    return true;
}

// Thêm hàm validate dữ liệu trước khi gửi
function validateProductData(formData) {
    const errors = [];
    
    if (!formData.get('product_name')) {
        errors.push('Tên sản phẩm không được để trống');
    }
    if (!formData.get('price') || formData.get('price') <= 0) {
        errors.push('Giá sản phẩm không hợp lệ');
    }
    if (!formData.get('stock') || formData.get('stock') < 0) {
        errors.push('Số lượng không hợp lệ');
    }
    
    return errors;
}

// Thêm hàm preview hình ảnh (tùy chọn)
function previewImage(input, imgId) {
    const preview = document.getElementById(imgId);
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Thêm event listeners cho các input file
document.getElementById('editThumbnail').addEventListener('change', function() {
    previewImage(this, 'currentThumbnail');
});
document.getElementById('editDetail1').addEventListener('change', function() {
    previewImage(this, 'currentDetail1');
});
document.getElementById('editDetail2').addEventListener('change', function() {
    previewImage(this, 'currentDetail2');
});
document.getElementById('editDetail3').addEventListener('change', function() {
    previewImage(this, 'currentDetail3');
});

// Hàm xóa sản phẩm
function deleteProduct(productId) {
    console.log('Attempting to delete product with ID:', productId);
    const token = localStorage.getItem('token');

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('User confirmed deletion');
            fetch(`http://localhost/CuaHangDT/api/sanPham/delete.php?id=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                console.log('Response from delete API:', response);
                return response.text(); // Đọc response dưới dạng text
            })
            .then(text => {
                try {
                    const data = JSON.parse(text); // Cố gắng parse JSON
                    console.log('Data received after delete:', data);
                    if (data.success) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Sản phẩm đã được xóa.",
                            icon: "success"
                        }).then(() => {
                            fetchProducts(currentPage); // Tải lại danh sách sau khi xóa thành công
                        });
                    } else {
                        throw new Error(data.message || 'Không thể xóa sản phẩm');
                    }
                } catch (error) {
                    // Nếu không parse được JSON, hiển thị lỗi text
                    console.error('Error parsing response:', text);
                    if (text.includes('SQLSTATE[23000]')) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Không thể xóa sản phẩm',
                            text: 'Sản phẩm này đang được tham chiếu trong các đơn hàng và không thể bị xóa.'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Có lỗi xảy ra',
                            text: text || 'Vui lòng kiểm tra console để biết thêm thông tin.'
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Có lỗi xảy ra',
                    text: error.message || 'Vui lòng kiểm tra console để biết thêm thông tin.'
                });
            });
        } else {
            console.log('User canceled deletion');
        }
    });
}

// Thêm event listener khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem có product_id trong URL không (nếu cần)
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromUrl = urlParams.get('id');
    if (productIdFromUrl) {
        currentProductId = productIdFromUrl;
    }
});

// Thêm hàm để kiểm tra response
async function checkResponse(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid server response');
    }
}