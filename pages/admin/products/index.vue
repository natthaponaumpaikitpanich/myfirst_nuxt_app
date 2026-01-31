<template>
    <div class="products-index">
        <header class="page-header">
            <div class="title-group">
                <h1><i class="fas fa-box-open"></i> สินค้าและบริการ</h1>
                <p>จัดการรายการสินค้า น้ำยา และบริการภายในร้านทั้งหมด</p>
            </div>

            <button class="btn-add-main" @click="$router.push('/admin/products/add')">
                <div class="icon-plus"><i class="fas fa-plus"></i></div>
                <span>เพิ่มรายการใหม่</span>
            </button>
        </header>

        <section class="control-bar">
            <div class="search-wrapper">
                <i class="fas fa-search"></i>
                <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อสินค้า หรือประเภท..." />
            </div>

            <div class="filter-group">
                <button v-for="t in ['all', 'product', 'service']" :key="t"
                    :class="['filter-btn', { active: filterType === t }]" @click="filterType = t">
                    {{ t === 'all' ? 'ทั้งหมด' : t === 'product' ? 'สินค้า' : 'บริการ' }}
                </button>
            </div>
        </section>

        <transition-group name="list" tag="div" class="products-grid">
            <div v-for="p in filteredProducts" :key="p.id" class="product-item">
                <div class="card-image">
                    <img v-if="p.image" :src="`http://localhost/api/uploads/products/${p.image}`" alt="product" />
                    <div v-else class="no-image"><i class="fas fa-image"></i></div>

                    <div class="type-tag" :class="p.type">
                        {{ p.type === 'service' ? 'Service' : 'Product' }}
                    </div>

                    <div class="card-overlay">
                        <button class="btn-icon edit" @click="editItem(p.id)"><i class="fas fa-pen"></i></button>
                        <button class="btn-icon delete" @click="deleteItem(p.id)"><i class="fas fa-trash"></i></button>
                    </div>
                </div>

                <div class="card-info">
                    <h3 class="name">{{ p.name }}</h3>
                    <div class="stock-status" :class="{ 'out-of-stock': p.stock <= 0 }">
                        <i class="fas fa-warehouse"></i>
                        คงเหลือ: <b>{{ p.stock }}</b> ชิ้น
                    </div>
                    <div class="footer">
                        <span class="price">฿{{ parseFloat(p.price).toLocaleString() }}</span>
                        <div class="status-indicator">
                            <span class="dot" :class="{ 'off': p.stock <= 0 }"></span>
                            {{ p.stock > 0 ? 'Active' : 'Out of Stock' }}
                        </div>
                    </div>
                </div>
            </div>
        </transition-group>

        <div v-if="filteredProducts.length === 0" class="empty-box">
            <i class="fas fa-search-minus"></i>
            <p>ไม่พบรายการที่ค้นหา</p>
        </div>

        <button class="fab-back" @click="$router.push('/admin')" title="กลับหน้าหลัก Admin">
            <i class="fas fa-home"></i>
            <span class="fab-text">หน้าหลัก Admin</span>
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            products: [],
            searchQuery: "",
            filterType: "all",
        };
    },
    computed: {
        filteredProducts() {
            return this.products.filter(p => {
                const matchSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                const matchType = this.filterType === 'all' || p.type === this.filterType;
                return matchSearch && matchType;
            });
        }
    },
    mounted() {
        this.loadProducts();
    },
    methods: {
  async loadProducts() {
    try {
      // เรียก Get ไปที่ไฟล์ products.php (ตัวหลักที่ใช้แสดงผล)
      const res = await this.$axios.get('/admin/products.php');
      this.products = Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error("Load failed", err);
    }
  },

 async deleteItem(id) {
  if (!confirm('ยืนยันการลบรายการนี้?')) return;
  
  try {
    // ส่งแบบระบุชื่อไฟล์ตรงๆ พร้อมแนบ ID ชัวร์ที่สุด
    const res = await this.$axios.post(`http://localhost/api/admin/products_delete.php?id=${id}`);

    // LOG ดูว่า PHP ตอบอะไรกลับมากันแน่
    console.log("PHP Response:", res.data);

    if (res && res.data && res.data.success) {
      alert(res.data.message || 'ลบสำเร็จ');
      await this.loadProducts(); 
    } else {
      // ถ้า PHP ส่ง success: false จะมาติดตรงนี้
      const errorMsg = res.data?.error || 'เซิร์ฟเวอร์ปฏิเสธการลบ (แต่ไม่ระบุเหตุผล)';
      alert('ลบไม่สำเร็จ: ' + errorMsg);
    }

  } catch (err) {
    console.error("Axios Error:", err);
    // ถ้าฝั่ง PHP Error จนพ่น JSON ไม่ได้เลย จะมาติดตรงนี้
    const serverMsg = err.response?.data?.error || err.message;
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + serverMsg);
  }
},
editItem(id) {
  // ส่งแบบ Query String แทน
  this.$router.push({ path: '/admin/products/edit', query: { id: id } });
}
}
};
</script>

<style scoped>
/* CSS ทุกอย่างที่คุณเขียนมา รักษาไว้ครบถ้วน */
.stock-status {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 10px;
}

.stock-status b {
    color: #1976d2;
}

.stock-status.out-of-stock {
    color: #ef4444;
}

.stock-status.out-of-stock b {
    color: #ef4444;
}

.dot.off {
    background: #cbd5e1;
    box-shadow: 0 0 0 4px rgba(203, 213, 225, 0.2);
}

.fab-back {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: #1e293b;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Kanit', sans-serif;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 100;
}

.fab-back i {
    font-size: 1.2rem;
}

.fab-back:hover {
    background: #0f172a;
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
    .fab-back {
        padding: 15px;
        bottom: 20px;
        right: 20px;
    }

    .fab-text {
        display: none;
    }
}

.products-index {
    padding: 40px;
    background-color: #f8fafc;
    min-height: 100vh;
    font-family: 'Kanit', sans-serif;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}

.title-group h1 {
    font-size: 2rem;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.title-group h1 i {
    color: #1976d2;
}

.title-group p {
    color: #64748b;
    margin: 5px 0 0;
}

.btn-add-main {
    background: #1976d2;
    color: white;
    border: none;
    padding: 10px 25px 10px 10px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 10px 20px rgba(25, 118, 210, 0.2);
}

.btn-add-main:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(25, 118, 210, 0.3);
}

.icon-plus {
    background: rgba(255, 255, 255, 0.2);
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    gap: 20px;
}

.search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-wrapper i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
}

.search-wrapper input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border-radius: 15px;
    border: 1px solid #e2e8f0;
    outline: none;
    transition: 0.3s;
}

.search-wrapper input:focus {
    border-color: #1976d2;
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
}

.filter-group {
    display: flex;
    background: #eee;
    padding: 5px;
    border-radius: 12px;
}

.filter-btn {
    padding: 8px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
    color: #64748b;
    font-weight: 500;
}

.filter-btn.active {
    background: white;
    color: #1976d2;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 25px;
}

.product-item {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    transition: 0.4s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    border: 1px solid #f1f5f9;
}

.product-item:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.card-image {
    height: 200px;
    position: relative;
    background: #f1f5f9;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #cbd5e1;
}

.type-tag {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 5px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    backdrop-filter: blur(4px);
}

.type-tag.service {
    background: rgba(25, 118, 210, 0.8);
}

.type-tag.product {
    background: rgba(102, 187, 106, 0.8);
}

.card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    opacity: 0;
    transition: 0.3s;
}

.product-item:hover .card-overlay {
    opacity: 1;
}

.btn-icon {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: 0.3s;
    font-size: 1.1rem;
}

.btn-icon.edit {
    background: white;
    color: #1976d2;
}

.btn-icon.delete {
    background: #ef4444;
    color: white;
}

.btn-icon:hover {
    transform: scale(1.1);
}

.card-info {
    padding: 20px;
}

.card-info .name {
    margin: 0 0 15px;
    font-size: 1.1rem;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-info .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-info .price {
    font-size: 1.3rem;
    font-weight: 800;
    color: #1976d2;
}

.status-indicator {
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 5px;
}

.dot {
    width: 8px;
    height: 8px;
    background: #66bb6a;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(102, 187, 106, 0.2);
}

.empty-box {
    text-align: center;
    padding: 100px 0;
    color: #cbd5e1;
}

.empty-box i {
    font-size: 4rem;
    margin-bottom: 20px;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter,
.list-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>