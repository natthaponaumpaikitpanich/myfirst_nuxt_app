<template>
    <div class="add-product-page">
        <div class="main-container">
            <div class="form-section">
                <div class="header">
                    <div>
                        <button class="back-btn" @click="$router.push('/admin/products')" title="กลับไปหน้าสินค้า">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h2>เพิ่มสินค้าวางขาย</h2>
                        <small>สำหรับวางขายหน้าร้าน</small>
                    </div>
                </div>

                <div class="upload-zone" :class="{ dragging: isDragging, 'has-image': imagePreview }"
                    @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop">
                    <div v-if="!imagePreview" class="upload-placeholder">
                        <div class="icon-circle">
                            <i class="fas fa-box-open"></i>
                        </div>
                        <p>ลากรูปสินค้ามาวางตรงนี้</p>
                        <button class="btn-browse" @click="$refs.fileInput.click()">เลือกรูปภาพ</button>
                        <input type="file" ref="fileInput" @change="onFileChange" hidden accept="image/*" />
                    </div>

                    <div v-else class="image-preview-wrapper">
                        <img :src="imagePreview" alt="Preview" />
                        <button class="btn-remove-img" @click="removeImage" title="ลบรูป">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="input-group">
                    <label>ชื่อสินค้า</label>
                    <input v-model="form.name" type="text" placeholder="เช่น น้ำยาปรับผ้านุ่ม สูตรเข้มข้น" autofocus />
                </div>

                <div class="price-calculator-box">
                    <div class="row-inputs">
                        <div class="input-group">
                            <label>ต้นทุน (ไม่บังคับ)</label>
                            <input v-model.number="tempCost" type="number" placeholder="0" class="input-cost" />
                        </div>
                        <div class="input-group">
                            <label>ราคาขายจริง</label>
                            <input v-model.number="form.price" type="number" placeholder="0" class="input-price" />
                        </div>
                    </div>

                    <div class="input-group" style="margin-top: 15px;">
                        <label><i class="fas fa-layer-group"></i> จำนวนสต็อกเริ่มต้น</label>
                        <input v-model.number="form.stock" type="number" placeholder="0" />
                    </div>

                    <div class="profit-badge" v-if="form.price > 0 && tempCost > 0">
                        <span><i class="fas fa-coins"></i> กำไรต่อชิ้น: </span>
                        <b :class="profitClass">{{ profit }} บาท</b>
                        <small>({{ profitPercent }}%)</small>
                    </div>
                </div>

                <div class="input-group">
                    <label>รายละเอียดสินค้า</label>
                    <textarea v-model="form.description" rows="3" placeholder="สรรพคุณ, ขนาดบรรจุ, กลิ่น..."></textarea>
                </div>

                <div class="actions">
                    <button class="btn-save" @click="submit" :disabled="isLoading">
                        <span v-if="!isLoading">วางขายทันที <i class="fas fa-arrow-right"></i></span>
                        <span v-else class="loader"></span>
                    </button>
                </div>
            </div>

            <div class="preview-section">
                <div class="phone-mockup">
                    <div class="notch"></div>
                    <div class="screen">
                        <div class="app-top-bar">
                            <i class="fas fa-bars"></i>
                            <span>ร้านค้า</span>
                            <div class="cart-icon"><i class="fas fa-shopping-basket"></i></div>
                        </div>

                        <div class="shelf-label">สินค้าแนะนำ</div>
                        <div class="shelf-grid">
                            <div class="shelf-item active-preview">
                                <div class="item-img" :style="previewStyle">
                                    <span v-if="!imagePreview" class="placeholder-text">รูปสินค้า</span>
                                    <span class="new-badge">NEW</span>
                                </div>
                                <div class="item-info">
                                    <h4>{{ form.name || 'ชื่อสินค้า...' }}</h4>
                                    <p class="item-price">฿{{ (form.price || 0).toLocaleString() }}</p>
                                    <button class="btn-buy-mini"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                            <div class="shelf-item blur-item"></div>
                        </div>

                        <div class="payment-preview" v-if="form.price > 0">
                            <p class="pay-title">สแกนชำระเงิน</p>
                            <div class="qr-container">
                                <img v-if="settingQr" :src="settingQr" alt="Payment QR" class="qr-img" />
                                <div v-else class="qr-placeholder">
                                    <i class="fas fa-qrcode"></i>
                                    <span>รอโหลด QR...</span>
                                </div>
                            </div>
                            <p class="pay-amount">ยอดชำระ: <b>฿{{ form.price.toLocaleString() }}</b></p>
                        </div>

                        <div class="preview-note">
                            <i class="fas fa-eye"></i> มุมมองลูกค้าหน้าร้าน
                        </div>
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
            form: {
                name: '',
                price: '',
                stock: 0,
                type: 'product',
                description: ''
            },
            tempCost: '',
            image: null,
            imagePreview: null,
            isDragging: false,
            isLoading: false,
            settingQr: null // เก็บ URL รูป QR จากหน้า Setting
        };
    },
    mounted() {
        this.fetchSettingQr();
    },
    computed: {
        previewStyle() {
            return this.imagePreview
                ? { backgroundImage: `url(${this.imagePreview})` }
                : { backgroundColor: '#f0f0f0' };
        },
        profit() {
            return (this.form.price - this.tempCost).toLocaleString();
        },
        profitPercent() {
            if (!this.tempCost) return 0;
            return Math.round(((this.form.price - this.tempCost) / this.tempCost) * 100);
        },
        profitClass() {
            return (this.form.price - this.tempCost) >= 0 ? 'text-green' : 'text-red';
        }
    },
    methods: {
        async fetchSettingQr() {
            try {
                // ดึงรูป QR ที่แอดมินเคยอัปโหลดไว้ในหน้า Setting
                const res = await this.$axios.get('/admin/get_setting.php');
                if (res.data && res.data.qr_path) {
                    this.settingQr = res.data.qr_path;
                }
            } catch (err) {
                console.error("โหลด QR ล้มเหลว", err);
            }
        },
        onFileChange(e) {
            const file = e.target.files[0];
            if (file) this.processFile(file);
        },
        handleDrop(e) {
            this.isDragging = false;
            const file = e.dataTransfer.files[0];
            if (file) this.processFile(file);
        },
        processFile(file) {
            if (file.type.startsWith('image/')) {
                this.image = file;
                this.imagePreview = URL.createObjectURL(file);
            }
        },
        removeImage() {
            this.image = null;
            this.imagePreview = null;
            if (this.$refs.fileInput) this.$refs.fileInput.value = '';
        },
        async submit() {
            if (!this.form.name || !this.form.price) return alert('กรุณาระบุชื่อและราคา');

            this.isLoading = true;
            const fd = new FormData();
            Object.keys(this.form).forEach(k => fd.append(k, this.form[k]));
            if (this.image) fd.append('image', this.image);

            try {
                const res = await this.$axios.post('/admin/add_product.php', fd);
                if (res.data.status) {
                    alert('เพิ่มสินค้าเรียบร้อย!');
                    this.$router.push('/admin/products');
                } else {
                    alert(res.data.message || 'เพิ่มไม่สำเร็จ');
                }
            } catch (err) {
                alert('เกิดข้อผิดพลาด');
            } finally {
                this.isLoading = false;
            }
        }
    }
};
</script>

<style scoped>
/* --- CSS เดิมของคุณคงไว้ทั้งหมด --- */
.header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
}

.back-btn {
    background: white;
    border: 1px solid #e2e8f0;
    width: 45px;
    height: 45px;
    border-radius: 14px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.back-btn:hover {
    background: #f1f5f9;
    color: #1976d2;
    border-color: #1976d2;
    transform: translateX(-3px);
}

.add-product-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: 'Kanit', sans-serif;
}

.main-container {
    background: white;
    width: 100%;
    max-width: 900px;
    display: flex;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    min-height: 600px;
}

.form-section {
    flex: 1.4;
    padding: 40px;
    display: flex;
    flex-direction: column;
}

.upload-zone {
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 25px;
    background: #f8fafc;
    transition: 0.3s;
    position: relative;
    overflow: hidden;
}

.upload-zone.dragging {
    border-color: #1976d2;
    background: #e0f2fe;
}

.upload-zone.has-image {
    padding: 0;
    border: none;
}

.image-preview-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.btn-remove-img {
    position: absolute;
    top: 10px;
    right: 10px;
    background: white;
    color: #ef4444;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #334155;
}

.input-group input,
.input-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Kanit';
}

.price-calculator-box {
    background: #f0f9ff;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #bae6fd;
    margin-bottom: 20px;
}

.row-inputs {
    display: flex;
    gap: 15px;
}

.row-inputs .input-group {
    flex: 1;
    margin-bottom: 0;
}

.input-price {
    border-color: #38bdf8;
    font-weight: bold;
    color: #0369a1;
}

.btn-save {
    width: 100%;
    padding: 14px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(25, 118, 210, 0.2);
    margin-top: auto;
}

.preview-section {
    flex: 1;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #dbeafe;
}

.phone-mockup {
    width: 280px;
    height: 520px;
    background: white;
    border-radius: 30px;
    border: 6px solid #fff;
    box-shadow: 0 20px 40px rgba(25, 118, 210, 0.1);
    position: relative;
    overflow: hidden;
}

.screen {
    padding: 15px;
    background: #fafafa;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.shelf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.active-preview {
    border: 2px solid #1976d2;
    transform: scale(1.05);
}

.item-img {
    height: 100px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.item-info h4 {
    margin: 0;
    font-size: 0.8rem;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-price {
    color: #1976d2;
    font-weight: bold;
    font-size: 0.9rem;
    margin: 0;
}

/* --- ส่วน QR Code ชำระเงินที่เพิ่มใหม่ --- */
.payment-preview {
    margin-top: 20px;
    background: #fff;
    border-radius: 15px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
}

.pay-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 10px;
}

.qr-container {
    width: 100px;
    height: 100px;
    margin: 0 auto 10px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
}

.qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.qr-placeholder {
    display: flex;
    flex-direction: column;
    font-size: 0.6rem;
    color: #94a3b8;
}

.qr-placeholder i {
    font-size: 1.5rem;
    margin-bottom: 5px;
}

.pay-amount {
    font-size: 0.7rem;
    color: #64748b;
}

.pay-amount b {
    color: #1976d2;
}

.loader {
    width: 20px;
    height: 20px;
    border: 3px solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 800px) {
    .preview-section {
        display: none;
    }
}
</style>