<template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand-header">
        <div class="bubble-wrapper">
          <div class="bubble b1"></div>
          <div class="bubble b2"></div>
          <div class="bubble b3"></div>
        </div>
        <i class="fas fa-soap soap-icon"></i>
        <h2>ยินดีต้อนรับกลับมา</h2>
        <p>เข้าสู่ระบบเพื่อจัดการงานซักรีดของคุณ</p>
      </div>

      <div class="form-body">
        <div class="input-group" :class="{ 'focused': focusedField === 'email' }">
          <label><i class="fas fa-envelope"></i> อีเมล</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="example@laundry.com"
            @focus="focusedField = 'email'"
            @blur="focusedField = ''"
          />
        </div>

        <div class="input-group" :class="{ 'focused': focusedField === 'password' }">
          <label><i class="fas fa-lock"></i> รหัสผ่าน</label>
          <div class="password-wrapper">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••"
              @focus="focusedField = 'password'"
              @blur="focusedField = ''"
            />
            <i 
              class="fas eye-icon" 
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showPassword = !showPassword"
            ></i>
          </div>
        </div>

        <button @click="login" :disabled="isLoading" class="btn-login">
          <span v-if="!isLoading">เข้าสู่ระบบ</span>
          <span v-else class="loader"></span>
        </button>

        <transition name="fade">
          <p v-if="message" :class="['status-msg', isError ? 'error' : 'success']">
            <i :class="isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
            {{ message }}
          </p>
        </transition>
<div id="googleBtn" style="display:flex; justify-content:center; margin-top:15px;"></div>

        <div class="footer-links">
          <span>ยังไม่มีบัญชีใช่ไหม?</span>
          <router-link to="/register">สมัครสมาชิกเลย</router-link>
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
        email: "",
        password: ""
      },
      message: "",
      isError: false,
      isLoading: false,
      showPassword: false,
      focusedField: ""
    };
  },

  mounted() {
    // 🔥 Init Google Login (วิธีที่ถูกต้อง)
    if (!window.google) {
      console.error("Google SDK not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: "900434476272-b80cvdfjod5i3m068k6o3pv9d04fioib.apps.googleusercontent.com",
      callback: this.handleGoogle
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        width: 280,
        text: "signin_with"
      }
    );
  },

  methods: {
    /* ===== LOGIN ปกติ ===== */
    async login() {
      if (!this.form.email || !this.form.password) {
        this.isError = true;
        this.message = "กรุณากรอกข้อมูลให้ครบถ้วน";
        return;
      }

      this.isLoading = true;
      this.message = "";

      try {
        const res = await this.$axios.post("/auth/login.php", this.form);

        this.isError = !res.data.status;
        this.message = res.data.message;

        if (res.data.status) {
          localStorage.setItem("user", JSON.stringify(res.data.user));

          setTimeout(() => {
            const role = res.data.user.role;
            const routes = {
              admin: "/admin/",
              staff: "/staff/",
              customer: "/customer/"
            };
            this.$router.push(routes[role] || "/customer/");
          }, 800);
        }
      } catch (err) {
        this.isError = true;
        this.message = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์";
      } finally {
        this.isLoading = false;
      }
    },

    /* ===== CALLBACK จาก GOOGLE ===== */
    async handleGoogle(response) {
      try {
        const res = await this.$axios.post("/auth/login_google.php", {
          token: response.credential
        });

        if (res.data.status) {
          localStorage.setItem("user", JSON.stringify(res.data.user));

          const role = res.data.user.role;
          const routes = {
            admin: "/admin/",
            staff: "/staff/",
            customer: "/customer/"
          };
          this.$router.push(routes[role] || "/customer/");
        } else {
          alert(res.data.message);
        }
      } catch (err) {
        alert("Google login ล้มเหลว");
      }
    }
  }
};
</script>


<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #ffffff, #e3f2fd);
  padding: 20px;
  font-family: 'Kanit', sans-serif;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(25, 118, 210, 0.1);
  overflow: hidden;
  position: relative;
}

.brand-header {
  background: #1976d2;
  color: white;
  padding: 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.soap-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: float 3s ease-in-out infinite;
}

/* Bubble Effect */
.bubble {
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: rise 5s infinite ease-in;
}
.b1 { width: 40px; height: 40px; left: 10%; bottom: -50px; }
.b2 { width: 20px; height: 20px; left: 50%; bottom: -30px; animation-delay: 2s; }
.b3 { width: 30px; height: 30px; right: 15%; bottom: -40px; animation-delay: 1s; }

.form-body {
  padding: 30px;
}

.input-group {
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  transition: 0.3s;
}

.input-group.focused {
  border-bottom-color: #1976d2;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: #777;
}

.input-group input {
  width: 100%;
  padding: 10px 0;
  border: none;
  outline: none;
  font-size: 1rem;
}

.password-wrapper {
  display: flex;
  align-items: center;
}

.eye-icon {
  cursor: pointer;
  color: #ccc;
  transition: 0.3s;
}

.eye-icon:hover { color: #1976d2; }

.btn-login {
  width: 100%;
  padding: 15px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(25, 118, 210, 0.2);
  transition: 0.3s;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px rgba(25, 118, 210, 0.3);
}

.footer-links {
  text-align: center;
  margin-top: 25px;
  font-size: 0.9rem;
}

.footer-links a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes rise {
  0% { transform: translateY(0) scale(1); opacity: 0.5; }
  100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #FFF;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>