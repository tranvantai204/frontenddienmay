// Trong hàm saveProduct
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
                <button class="add-to-cart-btn" onclick="addToCart({name: '${name}', price: '${price}'})">Thêm vào giỏ hàng</button>
            </td>
        `;
    }
    closeModal();
}