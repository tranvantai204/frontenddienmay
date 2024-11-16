let currentPage = 1;
const limit = 10; // Số sản phẩm trên mỗi trang
const token = localStorage.getItem('token');
console.log('Token:', token); // Kiểm tra token

function fetchProducts(page) {
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    fetch(`http://localhost/CuaHangDT/api/sanPham/read.php?page=${page}&t=${timestamp}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched products:', data); // Log data để debug
            if (data.data && data.paging) {
                displayProducts(data.data);
                updatePagination(data.paging.total_pages, page);
            } else {
                console.error('Invalid data structure:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách sản phẩm'
            });
        });
}

function displayProducts(products) {
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = ''; // Xóa danh sách sản phẩm hiện tại
    products.forEach((product, index) => {
        const productRow = document.createElement('tr');
        productRow.innerHTML = `
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
        productTable.appendChild(productRow);
    });
}

function updatePagination(totalPages, currentPage) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = ''; // Xóa các nút phân trang cũ

    // Nút "Quay lại"
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Quay lại';
    prevButton.disabled = currentPage === 1;
    prevButton.className = currentPage === 1 ? 'active' : '';
    prevButton.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevButton);

    // Nút số trang
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.disabled = i === currentPage;
        pageButton.onclick = () => changePage(i);
        pagination.appendChild(pageButton);
    }

    // Nút "Tiếp"
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Tiếp';
    nextButton.disabled = currentPage === totalPages;
    nextButton.className = currentPage === totalPages ? 'active' : '';
    nextButton.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextButton);
}

// Thêm sự kiện lắng nghe cho nút Previous
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--; // Giảm trang hiện tại
        fetchProducts(currentPage); // Gọi lại sản phẩm cho trang mới
    }
});

// Thêm sự kiện lắng nghe cho nút Next
document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++; // Tăng trang hiện tại
    fetchProducts(currentPage); // Gọi lại sản phẩm cho trang mới
});

// Tải sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(currentPage);
    fetchSuppliers(); // Lấy danh sách nhà cung cấp khi tải trang
});

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
function editProduct(product) {
    // Mở modal hoặc dẫn tới trang sửa sản phẩm
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'block'; // Hiển thị modal sửa sản phẩm

    // Điền thông tin hiện tại của sản phẩm vào các trường input
    document.getElementById('editProductId').value = product.product_id;
    document.getElementById('editProductName').value = product.product_name;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editStock').value = product.stock;
    document.getElementById('editCategory').value = product.category_id;
    document.getElementById('editSupplier').value = product.supplier_id;
}

// Hàm lưu thay đổi sản phẩm
function saveProductChanges() {
    const productId = document.getElementById('editProductId').value;
    const updatedProduct = {
        product_name: document.getElementById('editProductName').value,
        description: document.getElementById('editDescription').value,
        price: parseFloat(document.getElementById('editPrice').value),
        stock: parseInt(document.getElementById('editStock').value),
        category_id: parseInt(document.getElementById('editCategory').value),
        supplier_id: parseInt(document.getElementById('editSupplier').value)
    };

    if (!productId || !updatedProduct.product_name || isNaN(updatedProduct.price) || isNaN(updatedProduct.stock)) {
        alert('Vui lòng điền đầy đủ thông tin sản phẩm.');
        return;
    }

    const token = localStorage.getItem('token');
    const updateProductPromise = fetch(`http://localhost/CuaHangDT/api/sanPham/update.php?id=${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
    });

    const supplierId = updatedProduct.supplier_id;
    const updatedSupplier = {
        supplier_name: document.getElementById('editSupplierName').value,
        contact_email: document.getElementById('editSupplierEmail').value,
    };

    const updateSupplierPromise = fetch(`http://localhost/CuaHangDT/api/nhaCungCap/update.php?id=${supplierId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSupplier)
    });

    Promise.all([updateProductPromise, updateSupplierPromise])
        .then(responses => Promise.all(responses.map(res => {
            if (!res.ok) {
                throw new Error('Mã lỗi: ' + res.status);
            }
            return res.json();
        })))
        .then(data => {
            const productUpdate = data[0];
            const supplierUpdate = data[1];

            if (productUpdate.success && supplierUpdate.success) {
                alert('Cập nhật sản phẩm và nhà cung cấp thành công!');
                fetchProducts(currentPage);
                document.getElementById('editModal').style.display = 'none';
            } else {
                alert('Có lỗi xảy ra khi cập nhật: ' + (productUpdate.message || supplierUpdate.message));
 }
        })
        .catch(error => {
            console.error('Error updating product or supplier:', error);
            alert('Có lỗi xảy ra khi cập nhật sản phẩm hoặc nhà cung cấp. Vui lòng kiểm tra console để biết thêm thông tin.');
        });
}

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

// Hàm đóng modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}