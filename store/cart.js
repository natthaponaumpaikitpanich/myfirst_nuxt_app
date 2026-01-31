// store/cart.js
export const state = () => ({
  items: []
})

export const mutations = {
  // เพิ่มสินค้าเข้าตะกร้า
  add(state, product) {
    const found = state.items.find(i => i.id === product.id)
    if (found) {
      found.qty++ // ใช้ qty ให้ตรงกับหน้า UI
    } else {
      state.items.push({
        ...product,
        qty: 1
      })
    }
  },

  // อัปเดตจำนวนสินค้า (ปุ่ม + และ -)
  updateQty(state, { productId, qty }) {
    const item = state.items.find(i => i.id === productId)
    if (item && qty > 0) {
      item.qty = qty
    }
  },

  // ลบสินค้า
  remove(state, productId) {
    state.items = state.items.filter(i => i.id !== productId)
  },

  // ล้างตะกร้า
  clear(state) {
    state.items = []
  }
}