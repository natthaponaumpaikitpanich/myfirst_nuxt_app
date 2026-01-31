<template>
    <div class="customer-dashboard">
        <header class="top-nav">
            <div class="container d-flex justify-content-between align-items-center">
                <div class="brand" @click="$router.push('/customer')">
                    <span class="logo-icon">🧺</span>
                    <span class="logo-text">LAUNDRY<strong>HUB</strong></span>
                </div>

                <div class="action-icons">
                    <div class="icon-item cart" @click="$router.push('/customer/cart')">
                        <i class="fas fa-shopping-cart"></i>
                        <span v-if="cartCount > 0" class="dot">{{ cartCount }}</span>
                    </div>
                    <div class="icon-item" @click="$router.push('/customer/orders')">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="icon-item profile" @click="$router.push('/customer/profile')">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <button class="btn-logout" @click="logout">
                        <i class="fas fa-power-off"></i>
                    </button>
                </div>
            </div>
        </header>

        <main class="container mt-4">
            <section class="quick-service-section mb-5">
                <div class="service-banner shadow-sm">
                    <div class="banner-content">
                        <h2 class="fw-bold">ส่งซักด่วนวันนี้?</h2>
                        <p>เรามีพนักงานไปรับผ้าถึงบ้านคุณภายใน 30 นาที</p>
                        <button class="btn-primary-custom" @click="$router.push('/customer/cart')">
                            <i class="fas fa-truck me-2"></i> เรียกรถรับผ้าตอนนี้
                        </button>
                    </div>
                    <div class="banner-illustration d-none d-md-block">
                        <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" alt="pickup service">
                    </div>
                </div>
            </section>

            <div class="section-title-area mb-4">
                <h4 class="fw-bold m-0 text-dark">บริการและสินค้า</h4>
                <p class="text-muted small">เลือกบริการที่เหมาะกับผ้าของคุณ</p>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div v-else class="row g-3 g-md-4">
                <div v-for="p in products" :key="p.id" class="col-6 col-md-4 col-lg-3">
                    <div class="modern-card">
                        <div class="card-img-container">
                            <img :src="`http://localhost/api/uploads/products/${p.image}`"
                                @error="e => e.target.src = 'https://via.placeholder.com/300x300?text=Service'" />
                            <div v-if="p.stock <= 0" class="out-of-stock-overlay">
                                <span>ขออภัย สินค้าหมด</span>
                            </div>
                        </div>

                        <div class="card-details">
                            <h6 class="product-name">{{ p.name }}</h6>
                            <div class="price-stock-row">
                                <span class="price-tag">{{ formatPrice(p.price) }} ฿</span>
                                <span class="stock-tag" :class="{ 'text-danger': p.stock < 5 }">คงเหลือ {{ p.stock
                                    }}</span>
                            </div>
                            <button class="btn-add-action" :disabled="p.stock <= 0" @click="addToCart(p)">
                                <i class="fas fa-plus-circle me-1"></i> เพิ่มลงตะกร้า
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div class="py-5"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            products: [],
            loading: false
        }
    },
    computed: {
        cartCount() {
            const cart = this.$store.state.cart;
            return cart?.items?.reduce((total, item) => total + (parseInt(item.qty) || 0), 0) || 0;
        }
    },
    async mounted() {
        this.fetchProducts();
    },
    methods: {
        formatPrice(val) {
            return Number(val).toLocaleString();
        },
        async fetchProducts() {
            this.loading = true;
            try {
                const res = await this.$axios.get('http://localhost/api/customer/products_list.php');
                if (res.data.success) {
                    this.products = res.data.data.filter(p => p.type === 'product');
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                this.loading = false;
            }
        },
        addToCart(product) {
            if (product.stock <= 0) return;
            const payload = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price) || 0,
                image: product.image,
                stock: parseInt(product.stock) || 0,
                qty: 1
            };
            this.$store.commit('cart/add', payload);
        },
        logout() {
            if (confirm('ยืนยันออกจากระบบ?')) {
                this.$store.commit('SET_USER', null);
                localStorage.removeItem('user');
                this.$router.push('/login');
            }
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap');

.customer-dashboard {
    background: #fdfdfd;
    min-height: 100vh;
    font-family: 'Kanit', sans-serif;
}

/* Navigation Bar */
.top-nav {
    background: #ffffff;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.brand {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.logo-icon {
    font-size: 1.5rem;
}

.logo-text {
    font-size: 1.1rem;
    color: #333;
    letter-spacing: 0.5px;
}

.logo-text strong {
    color: #0066ff;
}

.action-icons {
    display: flex;
    align-items: center;
    gap: 20px;
}

.icon-item {
    font-size: 1.2rem;
    color: #666;
    cursor: pointer;
    position: relative;
    transition: 0.2s;
}

.icon-item:hover {
    color: #0066ff;
}

.dot {
    position: absolute;
    top: -5px;
    right: -8px;
    background: #ff3b30;
    color: white;
    font-size: 0.65rem;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    font-weight: bold;
}

.btn-logout {
    background: none;
    border: none;
    color: #ccc;
    font-size: 1.1rem;
    padding: 0;
}

.btn-logout:hover {
    color: #ff3b30;
}

/* Service Banner */
.service-banner {
    background: #0066ff;
    border-radius: 24px;
    padding: 40px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
}

.banner-content h2 {
    font-size: 2rem;
    margin-bottom: 10px;
}

.banner-content p {
    opacity: 0.9;
    margin-bottom: 25px;
    font-weight: 300;
}

.banner-illustration img {
    width: 140px;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
}

.btn-primary-custom {
    background: white;
    color: #0066ff;
    border: none;
    padding: 12px 28px;
    border-radius: 12px;
    font-weight: 600;
    transition: 0.3s;
}

.btn-primary-custom:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Modern Product Card */
.modern-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #f0f0f0;
    overflow: hidden;
    transition: 0.3s;
    height: 100%;
}

.modern-card:hover {
    border-color: #0066ff;
    transform: translateY(-5px);
}

.card-img-container {
    position: relative;
    aspect-ratio: 1/1;
    background: #fafafa;
}

.card-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.out-of-stock-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #ff3b30;
    text-align: center;
}

.card-details {
    padding: 15px;
}

.product-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: #333;
    margin-bottom: 8px;
    height: 1.2rem;
    overflow: hidden;
}

.price-stock-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.price-tag {
    font-weight: 700;
    color: #0066ff;
    font-size: 1.1rem;
}

.stock-tag {
    font-size: 0.75rem;
    color: #999;
}

.btn-add-action {
    width: 100%;
    background: #f8f9fa;
    border: none;
    padding: 10px;
    border-radius: 10px;
    color: #0066ff;
    font-weight: 600;
    font-size: 0.85rem;
    transition: 0.2s;
}

.btn-add-action:hover:not(:disabled) {
    background: #0066ff;
    color: #fff;
}

.btn-add-action:disabled {
    color: #ccc;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .service-banner {
        padding: 30px;
    }

    .banner-content h2 {
        font-size: 1.5rem;
    }

    .banner-content p {
        font-size: 0.9rem;
    }
}
</style>