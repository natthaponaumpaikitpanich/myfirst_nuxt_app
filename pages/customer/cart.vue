<template>
  <div class="cart-page py-5 px-3">
    <div class="container shadow-container">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="main-card shadow-sm border-0 mb-4">
            <div class="card-header-custom d-flex justify-content-between align-items-center p-4">
              <h4 class="fw-bold mb-0 text-dark">
                <i class="fas fa-shopping-cart me-2 text-primary"></i>ตะกร้าของคุณ
              </h4>
              <span class="badge bg-primary-soft text-primary px-3 py-2 rounded-pill">
                {{ cartItems.length }} รายการ
              </span>
            </div>

            <div class="card-body p-4 p-md-5">
              <div v-if="!cartItems || cartItems.length === 0" class="empty-cart text-center py-5">
                <div class="icon-circle mb-4">
                  <i class="fas fa-shopping-basket fa-3x text-muted"></i>
                </div>
                <h5 class="fw-bold text-dark">โอ๊ะ! ตะกร้าของคุณยังว่างอยู่</h5>
                <p class="text-muted">ไปเลือกดูบริการและสินค้าที่น่าสนใจกันเถอะ</p>
                <button @click="$router.push('/customer')"
                  class="btn btn-primary btn-lg rounded-pill px-5 mt-3 shadow-sm">
                  เริ่มช้อปเลย
                </button>
              </div>

              <div v-else class="cart-list">
                <div v-for="item in cartItems" :key="item.id" class="item-card d-flex align-items-center p-4 mb-4">
                  <div class="item-img-wrapper">
                    <img :src="`http://localhost/api/uploads/products/${item.image}`"
                      @error="e => e.target.src = 'https://via.placeholder.com/150?text=No+Image'"
                      class="rounded-4 shadow-sm object-fit-cover">
                  </div>

                  <div class="item-info flex-grow-1 ms-4">
                    <h5 class="fw-bold text-dark mb-1">{{ item.name || 'สินค้าไม่มีชื่อ' }}</h5>
                    <p class="text-primary fw-bold mb-0 fs-5">{{ formatNumber(item.price) }} ฿</p>
                  </div>

                  <div class="item-controls d-flex align-items-center bg-light rounded-pill p-1 shadow-inner">
                    <button @click="changeQty(item.id, item.qty - 1)" class="btn btn-qty border-0 shadow-sm">-</button>
                    <span class="fw-bold px-3 fs-5">{{ item.qty }}</span>
                    <button @click="changeQty(item.id, item.qty + 1)" class="btn btn-qty border-0 shadow-sm">+</button>
                  </div>

                  <button @click="removeItem(item.id)" class="btn btn-remove ms-4">
                    <i class="fas fa-trash-alt fa-lg"></i>
                  </button>
                </div>

                <div class="appointment-section mt-5 p-4 p-md-5 rounded-4 border-0 shadow-inner">
                  <h6 class="fw-bold text-dark mb-4">
                    <i class="fas fa-calendar-check me-2 text-primary"></i>รายละเอียดการเข้ารับผ้า
                  </h6>
                  <div class="row g-4">
                    <div class="col-md-6">
                      <div class="input-group-custom">
                        <label class="small text-muted mb-2 fw-bold text-uppercase">วันและเวลาที่นัดหมาย</label>
                        <input type="datetime-local" v-model="pickup_date" class="form-control-custom">
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="input-group-custom">
                        <label
                          class="small text-muted mb-2 fw-bold text-uppercase">ที่อยู่ที่ต้องการให้ไปรับ-ส่ง</label>
                        <textarea v-model="address" class="form-control-custom" rows="3"
                          placeholder="บ้านเลขที่, ซอย, ถนน..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="summary-card sticky-top shadow-lg border-0 p-4 p-md-5 mt-lg-0 mt-4">
            <h4 class="fw-bold mb-4">สรุปการสั่งซื้อ</h4>

            <div class="price-summary mb-4">
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">รวมค่าสินค้า</span>
                <span class="fw-bold text-dark fs-5">{{ formatNumber(totalPrice) }} ฿</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">ค่าบริการเข้ารับ</span>
                <span class="text-success fw-bold">ฟรี</span>
              </div>
              <hr class="my-4 opacity-10">
              <div class="d-flex justify-content-between align-items-center">
                <span class="h5 fw-bold mb-0">ยอดชำระสุทธิ</span>
                <span class="h2 fw-bold text-primary mb-0">{{ formatNumber(totalPrice) }} ฿</span>
              </div>
            </div>

            <div class="payment-method mb-4">
              <label class="small text-muted mb-3 fw-bold text-uppercase">ช่องทางชำระเงิน</label>
              <div class="payment-options d-flex gap-3">
                <div class="payment-item flex-fill p-3" :class="{ active: payment_method === 'cod' }"
                  @click="payment_method = 'cod'">
                  <i class="fas fa-money-bill-wave fa-lg mb-2 d-block"></i>
                  <span>เงินสด</span>
                </div>
                <div class="payment-item flex-fill p-3" :class="{ active: payment_method === 'transfer' }"
                  @click="payment_method = 'transfer'">
                  <i class="fas fa-university fa-lg mb-2 d-block"></i>
                  <span>โอนเงิน</span>
                </div>
              </div>
            </div>

            <transition name="fade">
              <div v-if="payment_method === 'transfer'"
                class="transfer-detail p-4 rounded-4 mb-4 text-center bg-light border">
                <p class="small text-muted mb-1">เลขที่บัญชีร้าน</p>
                <h4 class="fw-bold text-dark mb-3">144-111-8690</h4>
                <div class="qr-wrapper mb-3">
                  <img v-if="shop.qr_image" :src="`http://localhost/api/uploads/settings/${shop.qr_image}`"
                    class="img-fluid rounded-3 shadow-sm">
                  <div v-else class="qr-placeholder py-4 bg-white border rounded-3">QR Code</div>
                </div>
                <div class="upload-btn-wrapper">
                  <button class="btn btn-outline-primary rounded-pill w-100 py-2">
                    <i class="fas fa-upload me-2"></i>แนบสลิป
                  </button>
                  <input type="file" @change="onSlipChange" accept="image/*" />
                </div>
                <p v-if="slip" class="text-success small mt-2 fw-bold">{{ slip.name }}</p>
              </div>
            </transition>

            <button @click="checkout" class="btn btn-checkout w-100 py-3 rounded-pill fw-bold shadow-primary mt-2"
              :disabled="loading || totalPrice <= 0">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'กำลังทำรายการ...' : 'ยืนยันสั่งซื้อสินค้า' }}
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
      payment_method: 'cod',
      address: '',
      pickup_date: '',
      slip: null,
      loading: false,
      shop: { account_no: '', qr_image: '' }
    }
  },
  computed: {
    cartItems() {
      return this.$store.state.cart ? this.$store.state.cart.items : []
    },
    totalPrice() {
      return this.cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * parseInt(item.qty));
      }, 0);
    }
  },
  async mounted() {
    try {
      const res = await this.$axios.get('http://localhost/api/admin/get_settings.php');
      if (res.data.success) this.shop = res.data.data;
    } catch (e) { console.error("Load settings failed"); }
  },
  methods: {
    formatNumber(val) {
      return Number(val).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    },
    changeQty(id, qty) {
      if (qty > 0) {
        this.$store.commit('cart/updateQty', { productId: id, qty });
      }
    },
    removeItem(id) {
      if (confirm('ต้องการลบรายการนี้ออกใช่หรือไม่?')) this.$store.commit('cart/remove', id);
    },
    onSlipChange(e) { this.slip = e.target.files[0]; },
    async checkout() {
      if (this.totalPrice <= 0) return alert("❌ ตะกร้าว่างเปล่า");
      if (!this.address.trim()) return alert("❌ กรุณากรอกที่อยู่");
      if (!this.pickup_date) return alert("❌ กรุณาเลือกวันนัดหมาย");
      if (this.payment_method === 'transfer' && !this.slip) return alert("❌ กรุณาแนบสลิป");

      this.loading = true;
      const fd = new FormData();
      fd.append('total_price', this.totalPrice);
      fd.append('payment_method', this.payment_method);
      fd.append('address', this.address);
      fd.append('pickup_date', this.pickup_date);
      fd.append('items', JSON.stringify(this.cartItems));
      if (this.slip) fd.append('slip_img', this.slip);

      try {
        const res = await this.$axios.post('http://localhost/api/customer/orders_create.php', fd);
        if (res.data.success) {
          alert("🎉 สั่งซื้อสำเร็จ!");
          this.$store.commit('cart/clear');
          this.$router.push('/customer/orders');
        } else { alert("❌ " + res.data.error); }
      } catch (e) { alert("❌ ผิดพลาดทางเทคนิค"); }
      finally { this.loading = false; }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap');

.cart-page {
  background-color: #f8fafc;
  font-family: 'Kanit', sans-serif;
  min-height: 100vh;
}

.main-card,
.summary-card {
  background: #ffffff;
  border-radius: 30px;
  /* มนมากขึ้น */
}

.item-card {
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: #fff;
}

.item-img-wrapper img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.btn-qty {
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.btn-qty:hover {
  background: #3b82f6;
  color: #fff;
}

.form-control-custom {
  width: 100%;
  padding: 15px 20px;
  border-radius: 18px;
  border: 1.5px solid #edf2f7;
  background: #fff;
}

.payment-item {
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
  text-align: center;
}

.payment-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.btn-checkout {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.shadow-inner {
  background: #fcfdfe;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: block;
}

.upload-btn-wrapper input[type=file] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  height: 100%;
  width: 100%;
}
</style>