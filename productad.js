let currentPage = 1;
const limit = 10; // Số sản phẩm trên mỗi trang
const token = localStorage.getItem('token');
console.log('Token:', token); // Kiểm tra token

function fetchProducts(page) {
    fetch(`http://localhost/CuaHangDT/api/sanPham/read.php?page=${page}&limit=${limit}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.paging) {
                displayProducts(data.data);
                updatePagination(data.paging.total_pages, page);
            } else {
                console.error('No products found in response:', data);
            }
        })
        .catch(error => console.error('Error fetching products:', error));
}

function displayProducts(products) {
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = ''; // Xóa danh sách sản phẩm hiện tại
    
    // Giới hạn số sản phẩm hiển thị là 10
    const productsToShow = products.slice(0, limit);
    
    productsToShow.forEach((product, index) => {
        const productRow = document.createElement('tr');
        productRow.innerHTML = `
            <td>${(currentPage - 1) * limit + index + 1}</td>
            <td>${product.product_name}</td>
            <td>${product.price} VND</td>
            <td>${product.stock}</td>
            <td><img src="${product.thumbnail_image}" alt="${product.product_name}" style="width: 100px;"></td>
            <td>
                <button class="button-detail" onclick='showProductDetails(${JSON.stringify(product)})'>Xem</button>
                <button class="button-edit" onclick='editProduct(${JSON.stringify(product)})'>Sửa</button>
                <button class="button-delete" onclick="deleteProduct(${product.product_id})">Xóa</button>
            </td>
        `;
        productTable.appendChild(productRow);
    });
}

function updatePagination(totalPages, currentPage) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Lưu tổng số trang vào data attribute
    nextBtn.dataset.totalPages = totalPages;
    
    // Cập nhật trạng thái nút
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Thêm sự kiện lắng nghe cho nút Previous
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchProducts(currentPage);
    }
});

// Thêm sự kiện lắng nghe cho nút Next
document.getElementById('next-btn').addEventListener('click', () => {
    const totalPages = parseInt(document.getElementById('next-btn').dataset.totalPages);
    if (currentPage < totalPages) {
        currentPage++;
        fetchProducts(currentPage);
    }
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

// Hàm hiển thị chi tiết sản phẩm
function showProductDetails(product) {
    const detailModal = document.getElementById('detailModal');
    detailModal.style.display = 'block';

    fetch(`http://localhost/CuaHangDT/api/sanPham/show.php?id=${product.product_id}`)
        .then(response => response.json())
        .then(data => {
            console.log('Product data:', data);

            // Hiển thị thông tin cơ bản
            document.getElementById('detailProductName').textContent = data.product_name;
            document.getElementById('detailDescription').textContent = data.description;
            document.getElementById('detailPrice').textContent = data.price + ' VND';
            document.getElementById('detailStock').textContent = data.stock;
            document.getElementById('detailCategory').textContent = data.category_id;

            // Xử lý hiển thị hình ảnh thumbnail
            const mainImage = document.getElementById('mainImage');
            if (data.thumbnail_image && data.thumbnail_image.includes('cloudinary.com')) {
                console.log('Loading image:', data.thumbnail_image);
                mainImage.src = data.thumbnail_image;
                mainImage.style.display = 'block';

                mainImage.onload = function() {
                    console.log('Image loaded successfully');
                };

                mainImage.onerror = function() {
                    console.error('Failed to load image:', this.src);
                    this.style.display = 'none';
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không thể tải hình ảnh'
                    });
                };
            } else {
                console.log('No valid image URL found');
                mainImage.style.display = 'none';
            }

            // Fetch thông tin nhà cung cấp
            fetch(`http://localhost/CuaHangDT/api/nhaCungCap/show.php?id=${data.supplier_id}`)
                .then(response => response.json())
                .then(supplierData => {
                    document.getElementById('detailSupplier').textContent = 
                        supplierData.supplier_id ? supplierData.supplier_name : 'N/A';
                })
                .catch(error => {
                    console.error('Error fetching supplier:', error);
                    document.getElementById('detailSupplier').textContent = 'N/A';
                });
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải thông tin sản phẩm'
            });
        });
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
    console.log('Attempting to delete product with ID:', productId); // Kiểm tra ID sản phẩm

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
            console.log('User  confirmed deletion'); // Kiểm tra xác nhận xóa
            fetch(`http://localhost/CuaHangDT/api/sanPham/delete.php?id=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Nếu cần token xác thực
                },
            })
            .then(response => {
                console.log('Response from delete API:', response); // Kiểm tra phản hồi từ API
                return response.json();
            })
            .then(data => {
                console.log('Data received after delete:', data); // Kiểm tra dữ liệu trả về
                if (data.success) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Sản phẩm đã được xóa.",
                        icon: "success"
                    });
                    fetchProducts(currentPage); // Tải lại danh sách sản phẩm cho trang hiện tại sau khi xóa
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.message // Hiển thị thông báo lỗi
                    });
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Có lỗi xảy ra',
                    text: 'Vui lòng kiểm tra console để biết thêm thông tin.'
                });
            });
        } else {
            console.log('User  canceled deletion'); // Kiểm tra khi người dùng hủy
        }
    });
}

// Hàm đóng modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}