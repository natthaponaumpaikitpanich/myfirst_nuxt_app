<template>
    <div class="admin-page-wrapper">
        <div class="bg-blob primary"></div>

        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6">

                    <div class="d-flex align-items-center gap-3 mb-4">
                        <button @click="$router.push('/admin')" class="btn-back-glass">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h2 class="fw-bold m-0 text-dark">เพิ่มพนักงานใหม่</h2>
                    </div>

                    <div class="staff-card shadow-lg">
                        <div class="card-header-art">
                            <div class="icon-box">
                                <i class="fas fa-user-plus"></i>
                            </div>
                        </div>

                        <div class="card-content p-4 p-md-5">
                            <div class="form-section">
                                <div class="form-group-custom mb-4">
                                    <label><i class="fas fa-user me-2"></i>ชื่อ-นามสกุล</label>
                                    <input v-model="form.name" type="text" placeholder="ระบุชื่อพนักงาน" />
                                </div>

                                <div class="form-group-custom mb-4">
                                    <label><i class="fas fa-envelope me-2"></i>อีเมลสำหรับล็อกอิน</label>
                                    <input v-model="form.email" type="email" placeholder="example@laundry.com" />
                                </div>

                                <div class="form-group-custom mb-5">
                                    <label><i class="fas fa-lock me-2"></i>รหัสผ่านเข้าระบบ</label>
                                    <div class="password-wrapper">
                                        <input :type="showPass ? 'text' : 'password'" v-model="form.password"
                                            placeholder="อย่างน้อย 6 ตัวอักษร" />
                                        <i @click="showPass = !showPass"
                                            :class="['fas', showPass ? 'fa-eye-slash' : 'fa-eye', 'toggle-pass']"></i>
                                    </div>
                                </div>

                                <button @click="submit" class="btn-submit-staff" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-save me-2"></i>
                                    {{ loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันเพิ่มพนักงาน' }}
                                </button>
                            </div>

                            <transition name="fade">
                                <div v-if="message" :class="['alert-custom mt-4', success ? 'success' : 'error']">
                                    <i
                                        :class="['fas', success ? 'fa-check-circle' : 'fa-exclamation-circle', 'me-2']"></i>
                                    {{ message }}
                                </div>
                            </transition>
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
            loading: false,
            success: false,
            message: '',
            showPass: false,
            form: {
                name: '',
                email: '',
                password: ''
            }
        }
    },
    methods: {
        // ส่วนของ Method ใน create.vue
async submit() {
  // เช็คแค่ว่า "ห้ามว่าง" ก็พอ
  if (!this.form.name || !this.form.email || !this.form.password) {
    this.showMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง', false);
    return;
  }

  // ปลดล็อกเงื่อนไข 6 ตัวอักษรออกเรียบร้อย! ✅

  this.loading = true;
  this.message = '';

  try {
    const res = await this.$axios.post('admin/staff_create.php', this.form);

    if (res.data.success) {
      this.success = true;
      this.showMessage('เพิ่มพนักงานเข้าสู่ระบบเรียบร้อยแล้ว!', true);
      this.form = { name: '', email: '', password: '' };
    } else {
      this.showMessage(res.data.error || 'ไม่สามารถเพิ่มพนักงานได้', false);
    }
  } catch (e) {
    this.showMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', false);
  } finally {
    this.loading = false;
  }
},
showMessage(msg, isSuccess) {
    this.message = msg;
    this.success = isSuccess;
    // ถ้าสำเร็จ ให้ข้อความหายไปเองใน 5 วินาที
    if (isSuccess) {
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }
}
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

.admin-page-wrapper {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #f8fbff;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
}

.bg-blob {
    position: absolute;
    width: 500px;
    height: 500px;
    filter: blur(100px);
    opacity: 0.1;
    z-index: 0;
}

.bg-blob.primary {
    background: #6366f1;
    top: -10%;
    right: -5%;
}

.btn-back-glass {
    width: 45px;
    height: 45px;
    border-radius: 14px;
    border: none;
    background: white;
    color: #1e293b;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
}

.btn-back-glass:hover {
    transform: translateX(-5px);
    color: #6366f1;
}

.staff-card {
    background: white;
    border-radius: 35px;
    overflow: hidden;
    border: 1px solid #f1f5f9;
    z-index: 1;
    position: relative;
}

.card-header-art {
    height: 100px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    display: flex;
    justify-content: center;
    align-items: flex-end;
}

.icon-box {
    width: 70px;
    height: 70px;
    background: white;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #6366f1;
    transform: translateY(35px);
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

.form-group-custom label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group-custom input {
    width: 100%;
    padding: 16px 20px;
    background: #f8fafc;
    border: 2px solid #f1f5f9;
    border-radius: 18px;
    outline: none;
    transition: 0.3s;
    font-weight: 600;
}

.form-group-custom input:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.password-wrapper {
    position: relative;
}

.toggle-pass {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    cursor: pointer;
    transition: 0.2s;
}

.toggle-pass:hover {
    color: #6366f1;
}

.btn-submit-staff {
    width: 100%;
    padding: 18px;
    border-radius: 20px;
    border: none;
    background: #1e293b;
    color: white;
    font-weight: 800;
    font-size: 1.1rem;
    transition: 0.3s;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.btn-submit-staff:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    background: #000;
}

.btn-submit-staff:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.alert-custom {
    padding: 16px;
    border-radius: 16px;
    font-weight: 600;
    text-align: center;
}

.alert-custom.success {
    background: #f0fdf4;
    color: #166534;
}

.alert-custom.error {
    background: #fef2f2;
    color: #991b1b;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>