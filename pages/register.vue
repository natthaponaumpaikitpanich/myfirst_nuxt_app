<template>
  <div class="register-container">
    <div class="register-card">
      <div class="brand-section">
        <div class="logo-circle">
          <i class="fas fa-tshirt"></i>
        </div>
        <h2>สมัครสมาชิก</h2>
        <p>เริ่มต้นดูแลเสื้อผ้าตัวโปรดกับเรา</p>
      </div>

      <div class="form-body">
        <div class="image-upload-wrapper">
          <div class="preview-circle" :style="previewStyle">
            <span v-if="!previewUrl">เลือกรูป</span>
          </div>
          <input type="file" id="profile" @change="onFileChange" hidden accept="image/*" />
          <label for="profile" class="upload-btn">
            <i class="fas fa-camera"></i> อัปโหลดรูปโปรไฟล์
          </label>
        </div>

        <div class="input-group">
          <label><i class="fas fa-user"></i> ชื่อ-นามสกุล</label>
          <input v-model="form.name" type="text" placeholder="สมชาย สะอาดดี" />
        </div>

        <div class="input-group">
          <label><i class="fas fa-envelope"></i> อีเมล</label>
          <input v-model="form.email" type="email" placeholder="example@laundry.com" />
        </div>

        <div class="input-row">
          <div class="input-group">
            <label><i class="fas fa-lock"></i> รหัสผ่าน</label>
            <input v-model="form.password" type="password" placeholder="••••••••" />
          </div>
         
        </div>

        <button @click="register" :disabled="isLoading" class="btn-register">
          <span v-if="!isLoading">สร้างบัญชีผู้ใช้</span>
          <span v-else class="loader"></span>
        </button>

        <p v-if="message" :class="['status-msg', isError ? 'error' : 'success']">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
        role: "customer",
        profile_image: null
      },
      previewUrl: null,
      message: "",
      isError: false,
      isLoading: false
    };
  },
  computed: {
    previewStyle() {
      return this.previewUrl 
        ? { backgroundImage: `url(${this.previewUrl})`, border: 'none' } 
        : {};
    }
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.profile_image = file;
        this.previewUrl = URL.createObjectURL(file); // แสดงรูปทันทีที่เลือก
      }
    },
    async register() {
      // Basic Validation
      if (!this.form.name || !this.form.email || !this.form.password) {
        this.isError = true;
        this.message = "กรุณากรอกข้อมูลให้ครบถ้วน";
        return;
      }

      this.isLoading = true;
      this.message = "";

      const fd = new FormData();
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) fd.append(key, this.form[key]);
      });

      try {
       const res = await this.$axios.post("/auth/register.php", fd);

this.isError = !res.data.status;
this.message = res.data.message;

if (res.data.status) {
  setTimeout(() => {
    this.$router.push("/login");
  }, 1500);
}
      } catch (err) {
        this.isError = true;
        this.message = "การเชื่อมต่อล้มเหลว กรุณาลองใหม่";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Laundry Theme Colors: White (#FFFFFF), Soft Blue (#E3F2FD), Deep Blue (#1976D2) */
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 20px;
  font-family: 'Kanit', sans-serif;
}

.register-card {
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
}

.brand-section {
  background-color: #1976d2;
  color: white;
  padding: 30px;
  text-align: center;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: white;
  color: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 24px;
}

.form-body {
  padding: 30px;
}

/* Image Upload Styling */
.image-upload-wrapper {
  text-align: center;
  margin-bottom: 25px;
}

.preview-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px dashed #bbdefb;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  color: #90caf9;
}

.upload-btn {
  font-size: 0.85rem;
  color: #1976d2;
  cursor: pointer;
  font-weight: 500;
}

/* Form Controls */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #555;
}

.input-group input, .input-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: 0.3s;
}

.input-group input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.btn-register {
  width: 100%;
  padding: 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 10px;
}

.btn-register:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-2px);
}

.btn-register:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

/* Loading Spinner */
.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #FFF;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

.status-msg {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
}

.status-msg.error { color: #d32f2f; }
.status-msg.success { color: #2e7d32; }

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>