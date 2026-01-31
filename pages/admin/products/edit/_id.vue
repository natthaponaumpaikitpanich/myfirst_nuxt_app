<template>
    <div class="edit-page-container">
        <transition name="fade">
            <div v-if="loading" class="saving-overlay">
                <div class="loader-box text-center">
                    <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                    <p class="fw-bold text-dark h5">กำลังดำเนินการ...</p>
                </div>
            </div>
        </transition>

        <div class="container py-5">
            <header class="mb-5 d-flex justify-content-between align-items-center anim-slide-down">
                <div>
                    <h1 class="display-6 fw-bold text-dark m-0">
                        <i class="fas fa-edit me-2 text-primary"></i>แก้ไขสินค้า
                    </h1>
                    <p class="text-muted mb-0">ปรับปรุงข้อมูลผลิตภัณฑ์ของคุณ (ID: {{ product.id }})</p>
                </div>
                <div :class="['status-badge shadow-sm', product.stock > 0 ? 'active' : 'inactive']">
                    <span class="dot"></span>
                    {{ product.stock > 0 ? 'พร้อมจำหน่าย' : 'สินค้าหมด' }}
                </div>
            </header>

            <div class="row g-5">
                <div class="col-xl-4 col-lg-5 anim-fade-in">
                    <div class="product-image-card">
                        <div class="image-preview-area shadow-lg border">
                            <img :src="previewUrl || `http://localhost/api/uploads/products/${product.image}`"
                                class="main-img-display"
                                @error="e => e.target.src = 'https://placehold.co/800x800/f8f9fa/adb5bd?text=No+Image'" />
                            <div class="img-overlay">
                                <label for="file-upload" class="upload-btn-circle">
                                    <i class="fas fa-camera"></i>
                                </label>
                            </div>
                        </div>
                        <input id="file-upload" type="file" @change="handleFileChange" accept="image/*" class="d-none" />
                    </div>

                    <div class="payment-card-preview mt-4 shadow-sm border p-3 rounded-4 bg-white">
                        <h6 class="fw-bold mb-3"><i class="fas fa-qrcode me-2 text-primary"></i>QR รับชำระเงิน</h6>
                        <div class="qr-box text-center p-3 bg-light rounded-3 mb-3">
                            <img v-if="settingQr" :src="settingQr" class="img-fluid rounded shadow-sm" style="max-width: 150px;" />
                            <div v-else class="text-muted py-4">
                                <i class="fas fa-image fa-2x mb-2"></i><br>
                                <small>ไม่ได้ตั้งค่า QR ใน Setting</small>
                            </div>
                        </div>
                        <div class="price-display text-center">
                            <span class="text-muted small">ยอดชำระที่ลูกค้าเห็น:</span>
                            <h4 class="text-primary fw-bold mb-0">฿{{ (product.price || 0).toLocaleString() }}</h4>
                        </div>
                    </div>
                </div>

                <div class="col-xl-8 col-lg-7 anim-slide-up">
                    <div class="glass-form-card shadow-sm border">
                        <form @submit.prevent="submitForm">
                            <div class="form-group-section mb-4">
                                <div class="section-indicator mb-4">
                                    <span class="num">01</span>
                                    <span class="text">ข้อมูลสินค้า</span>
                                </div>
                                <div class="row g-4">
                                    <div class="col-12">
                                        <div class="modern-input-group">
                                            <input v-model="product.name" type="text" placeholder=" " required />
                                            <label>ชื่อผลิตภัณฑ์</label>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="modern-input-group">
                                            <select v-model="product.type" required>
                                                <option value="product">📦 สินค้าทั่วไป</option>
                                                <option value="service">🛠️ งานบริการ</option>
                                                <option value="digital">🌐 ดิจิทัล</option>
                                            </select>
                                            <label>หมวดหมู่</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group-section mb-4">
                                <div class="section-indicator mb-4">
                                    <span class="num">02</span>
                                    <span class="text">ราคาและสต็อก</span>
                                </div>
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <div class="modern-input-group has-icon">
                                            <span class="icon">฿</span>
                                            <input v-model.number="product.price" type="number" step="0.01" placeholder=" " required />
                                            <label>ราคาขายจริง</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="modern-input-group">
                                            <input v-model.number="product.stock" type="number" placeholder=" " required />
                                            <label>จำนวนในสต็อก</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions d-flex align-items-center justify-content-between pt-4 border-top mt-5">
                                <button type="button" class="btn btn-outline-secondary px-4 rounded-pill" @click="$router.back()">
                                    <i class="fas fa-arrow-left me-2"></i>ย้อนกลับ
                                </button>
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-light px-4 rounded-pill" @click="fetchData">
                                        <i class="fas fa-sync-alt me-2"></i>คืนค่าเดิม
                                    </button>
                                    <button type="submit" class="btn btn-primary-gradient px-5 rounded-pill shadow" :disabled="loading">
                                        บันทึกการเปลี่ยนแปลง
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            product: { id: '', name: '', price: 0, type: 'product', stock: 0, image: '' },
            newImage: null,
            previewUrl: null,
            loading: false,
            settingQr: null // เก็บรูป QR จากหน้า Setting
        }
    },
    async mounted() {
        await this.fetchData();
        await this.fetchSettingQr(); // โหลด QR ทันทีที่หน้าโหลด
    },
    methods: {
        async fetchSettingQr() {
            try {
                // ดึงค่า Setting อัตโนมัติมาเก็บไว้
                const res = await this.$axios.get('http://localhost/api/admin/get_setting.php');
                if (res.data && res.data.qr_path) {
                    this.settingQr = res.data.qr_path;
                }
            } catch (err) {
                console.error("Failed to load setting QR", err);
            }
        },
        async fetchData() {
            const id = this.$route.params.id || this.$route.query.id;
            if (!id) return this.$router.push('/admin/products');

            this.loading = true;
            try {
                const res = await this.$axios.get(`http://localhost/api/admin/products_get_one.php?id=${id}`);
                if (res.data && res.data.success) {
                    this.product = res.data.data;
                    this.newImage = null;
                    this.previewUrl = null;
                } else {
                    alert('ไม่พบข้อมูลสินค้านี้');
                    this.$router.push('/admin/products');
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                this.loading = false;
            }
        },
        handleFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                this.newImage = file;
                this.previewUrl = URL.createObjectURL(file);
            }
        },
        async submitForm() {
            if (this.loading) return;
            this.loading = true;

            const form = new FormData();
            form.append('id', this.product.id);
            form.append('name', this.product.name);
            form.append('price', this.product.price);
            form.append('type', this.product.type);
            form.append('stock', this.product.stock);
            if (this.newImage) form.append('image', this.newImage);

            try {
                const res = await this.$axios.post('http://localhost/api/admin/products_update.php', form);
                if (res.data && res.data.success) {
                    alert('✅ บันทึกข้อมูลสำเร็จแล้ว');
                    this.$router.push('/admin/products');
                } else {
                    alert('❌ ผิดพลาด: ' + (res.data.error || 'บันทึกไม่สำเร็จ'));
                }
            } catch (err) {
                alert('⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&family=Kanit:wght@300;400;600&display=swap');
/* CSS เดิมของคุณรักษาไว้ทั้งหมด และเพิ่มส่วน QR Preview ด้านล่าง */
.payment-card-preview {
    background: white;
    border-radius: 20px;
    transition: 0.3s;
}
.qr-box {
    border: 2px dashed #dee2e6;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}


.edit-page-container {
    font-family: 'Plus Jakarta Sans', 'Kanit', sans-serif;
    background: #fcfcfd;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
}

/* Saving Overlay */
.saving-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Custom Breadcrumb */
.custom-breadcrumb {
    background: transparent;
    padding: 0;
    font-size: 0.9rem;
}

.breadcrumb-item {
    cursor: pointer;
    color: #667085;
}

.breadcrumb-item.active {
    color: #004EEB;
    font-weight: 600;
}

/* Status Badge */
.status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.85rem;
}

.status-badge.active {
    background: #ECFDF3;
    color: #027A48;
}

.status-badge.inactive {
    background: #FEF3F2;
    color: #B42318;
}

.status-badge .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
}

/* Image Management */
.image-preview-area {
    position: relative;
    width: 100%;
    padding-top: 100%;
    /* Square ratio */
    border-radius: 32px;
    overflow: hidden;
    background: #fff;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.image-preview-area:hover {
    transform: scale(1.02);
}

.main-img-display {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-preview-area:hover .img-overlay {
    opacity: 1;
}

.upload-btn-circle {
    width: 60px;
    height: 60px;
    background: #fff;
    color: #101828;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: 0.3s;
}

.upload-btn-circle:hover {
    transform: rotate(15deg) scale(1.1);
    background: #004EEB;
    color: #fff;
}

/* Modern Glass Form */
.glass-form-card {
    background: #fff;
    border: 1px solid #EAECF0;
    border-radius: 32px;
    padding: 40px;
}

/* Section Indicators */
.section-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
}

.section-indicator .num {
    font-size: 1.5rem;
    font-weight: 800;
    color: #E4E7EC;
}

.section-indicator .text {
    font-size: 1.1rem;
    font-weight: 700;
    color: #101828;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Modern Input Groups */
.modern-input-group {
    position: relative;
    width: 100%;
}

.modern-input-group input,
.modern-input-group select {
    width: 100%;
    padding: 28px 16px 10px;
    border: 1px solid #D0D5DD;
    border-radius: 16px;
    background: #fff;
    outline: none;
    transition: 0.3s;
    font-weight: 500;
    color: #101828;
}

.modern-input-group label {
    position: absolute;
    left: 16px;
    top: 18px;
    color: #667085;
    pointer-events: none;
    transition: 0.2s;
}

.modern-input-group input:focus,
.modern-input-group input:not(:placeholder-shown) {
    border-color: #004EEB;
    box-shadow: 0 0 0 4px rgba(0, 78, 235, 0.1);
}

.modern-input-group input:focus~label,
.modern-input-group input:not(:placeholder-shown)~label,
.modern-input-group select~label {
    top: 8px;
    font-size: 0.75rem;
    color: #004EEB;
    font-weight: 700;
}

/* Icon Prefix Input */
.has-icon .icon {
    position: absolute;
    left: 16px;
    bottom: 12px;
    font-weight: 700;
    color: #101828;
}

.has-icon input {
    padding-left: 35px;
}

.has-icon label {
    left: 35px;
}

/* Action Buttons */
.btn-primary-gradient {
    background: linear-gradient(180deg, #444CE7 0%, #004EEB 100%);
    color: #fff;
    border: none;
    padding: 12px 32px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0, 78, 235, 0.2);
    transition: 0.3s;
}

.btn-primary-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 78, 235, 0.3);
}

.btn-reset {
    background: #F2F4F7;
    color: #344054;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    transition: 0.2s;
}

.btn-reset:hover {
    background: #E4E7EC;
}

.btn-link-custom {
    color: #667085;
    text-decoration: none;
    font-weight: 600;
    background: none;
    border: none;
}

.btn-link-custom:hover {
    color: #101828;
}

/* Animations */
.anim-slide-down {
    animation: slideDown 0.6s ease-out;
}

.anim-slide-up {
    animation: slideUp 0.6s ease-out;
}

.anim-fade-in {
    animation: fadeIn 0.8s ease-in;
}

@keyframes slideDown {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(40px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.x-small {
    font-size: 0.7rem;
}
</style>