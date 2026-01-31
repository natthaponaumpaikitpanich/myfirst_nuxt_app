<template>
    <div class="admin-page-wrapper">
        <div class="container py-5">
            <div class="d-flex align-items-center gap-3 mb-5 px-3">
                <button @click="$router.push('/admin')" class="btn-home-glass">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 class="fw-bold m-0">ตั้งค่าช่องทางรับเงิน</h2>
            </div>

            <div class="row g-4 px-3">
                <div class="col-lg-6">
                    <div class="ultra-card p-4 p-md-5">
                        <h4 class="fw-bold mb-4 text-primary"><i class="fas fa-qrcode me-2"></i>QR Code ร้าน</h4>

                        <div class="form-group-custom mb-4">
                            <label>เลขพร้อมเพย์ / เลขบัญชี</label>
                            <input v-model="config.account_no" type="text" placeholder="08x-xxx-xxxx" class="form-control shadow-none">
                        </div>

                        <div class="qr-upload-box mb-4" @click="$refs.fileInput.click()">
                            <img v-if="preview" :src="preview" class="qr-preview">
                            <div v-else class="upload-placeholder text-center text-muted">
                                <i class="fas fa-file-upload fa-2x mb-2"></i>
                                <p>อัปโหลดรูป QR Code</p>
                            </div>
                            <input type="file" ref="fileInput" @change="onFileChange" hidden accept="image/*">
                        </div>

                        <button @click="saveSettings" class="btn-submit w-100 py-3" :disabled="loading">
                            <i v-if="!loading" class="fas fa-save me-2"></i>
                            <span v-else class="spinner-border spinner-border-sm me-2"></span>
                            {{ loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลร้าน' }}
                        </button>
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
            loading: false,
            preview: null,
            file: null,
            config: {
                account_no: ''
            }
        }
    },
    async mounted() {
        // เมื่อหน้าเว็บโหลด ให้ดึงข้อมูลเก่ามาโชว์ก่อน
        await this.fetchSettings();
    },
    methods: {
        async fetchSettings() {
            try {
                // เรียกใช้ชื่อไฟล์ให้ตรงกับที่อยู่ในเครื่องคุณ
                const res = await this.$axios.get('http://localhost/api/admin/get_settings.php');
                if (res.data.success && res.data.data) {
                    this.config.account_no = res.data.data.account_no;
                    if (res.data.data.qr_image) {
                        // ต่อ Path ไปยังโฟลเดอร์เก็บรูปที่ PHP บันทึกไว้
                        this.preview = `http://localhost/api/uploads/settings/${res.data.data.qr_image}`;
                    }
                }
            } catch (e) {
                console.log("ยังไม่มีข้อมูลเดิมหรือเชื่อมต่อ API ไม่ได้");
            }
        },
        onFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                this.file = file;
                // สร้าง URL ชั่วคราวเพื่อแสดงรูปที่กำลังจะอัปโหลด
                this.preview = URL.createObjectURL(file);
            }
        },
        async saveSettings() {
            if (this.loading) return;
            this.loading = true;

            const fd = new FormData();
            fd.append('account_no', this.config.account_no);
            
            // สำคัญ: ชื่อ field ต้องตรงกับ $_FILES['qr_img'] ใน PHP
            if (this.file) {
                fd.append('qr_img', this.file);
            }

            try {
                // ยิงไปที่ไฟล์ PHP ตัวที่เราทำไว้ล่าสุด
                const res = await this.$axios.post('http://localhost/api/admin/save_shop_settings.php', fd);
                
                if (res.data.success) {
                    alert('✅ บันทึกการตั้งค่าเรียบร้อยแล้ว');
                    // ไม่ต้อง Refresh หน้าใหม่ แต่ให้ดึงข้อมูลอัปเดตจาก API มาโชว์แทน
                    await this.fetchSettings(); 
                    this.file = null; // เคลียร์ไฟล์ที่ค้างในตัวแปร
                } else {
                    alert('❌ ' + (res.data.error || 'บันทึกไม่สำเร็จ'));
                }
            } catch (e) {
                console.error(e);
                alert('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
/* CSS ของคุณดีมากอยู่แล้ว รักษาไว้ตามเดิมได้เลย */
.ultra-card {
    background: white;
    border-radius: 35px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.qr-upload-box {
    border: 2px dashed #e2e8f0;
    border-radius: 20px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    background: #f8fafc;
    transition: 0.3s;
}

.qr-upload-box:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.qr-preview {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.btn-submit {
    background: #1e293b;
    color: white;
    border: none;
    border-radius: 15px;
    font-weight: bold;
    transition: 0.3s;
}

.btn-submit:hover:not(:disabled) {
    background: #000;
    transform: translateY(-2px);
}

.btn-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.form-group-custom input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
}
</style>