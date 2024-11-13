document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadSuppliers();

    document.getElementById('addProductForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var formData = new FormData();
        formData.append('product_name', document.getElementById('product_name').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('stock', document.getElementById('stock').value);
        formData.append('category_id', document.getElementById('category_id').value);
        formData.append('supplier_id', document.getElementById('supplier_id').value);
        formData.append('thumbnail_image', document.getElementById('thumbnail_image').files[0]);
        formData.append('image_detail1', document.getElementById('image_detail1').files[0]);
        formData.append('image_detail2', document.getElementById('image_detail2').files[0]);

        var token = localStorage.getItem('token');
        console.log('Token trong addProduct.js:', token); // Kiểm tra xem token có tồn tại không
        
        if (!token) {
            alert('Không tìm thấy token. Vui lòng đăng nhập lại.');
            window.location.href = 'login.html';
            return;
        }
        

        fetch('http://localhost/CuaHangDT/api/sanpham/create.php', {
            method: 'POST',
            headers: { 
                'Authorization': 'Bearer ' + token 
            },
            body: formData
        })
        .then(response => response.json())
 .then(data => {
                    console.log(data);
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: 'Sản phẩm đã được thêm thành công!',
                        confirmButtonText: 'OK'
                    });
                    document.getElementById('addProductForm').reset(); // Reset form sau khi thêm sản phẩm
                })
                .catch(error => {
                    console.error('Có lỗi xảy ra:', error);
                });
            });
        });

function loadCategories() {
    fetch('http://localhost/CuaHangDT/api/danhmucsp/read.php')
    .then(response => response.json())
    .then(data => {
        let categorySelect = document.getElementById('category_id');
        data.data.forEach(category => {
            let option = document.createElement('option');
            option.value = category.category_id;
            option.text = category.category_name;
            categorySelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading categories:', error));
}

function loadSuppliers() {
    fetch('http://localhost/CuaHangDT/api/nhacungcap/read.php')
    .then(response => response.json())
    .then(data => {
        let supplierSelect = document.getElementById('supplier_id');
        data.data.forEach(supplier => {
            let option = document.createElement('option');
            option.value = supplier.supplier_id;
            option.text = supplier.supplier_name;
            supplierSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading suppliers:', error));
}
