let currentPage = 1;
const limit = 10;

function fetchProducts(page) {
    currentPage = page;
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = '<tr><td colspan="6">Đang tải...</td></tr>';

    fetch(`http://localhost/CuaHangDT/api/sanPham/read.php?page=${page}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            if (data.data) {
                displayProducts(data.data);
                const totalPages = data.total_pages || Math.ceil(data.total / limit);
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