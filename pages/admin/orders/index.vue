<template>
    <div class="orders-page-wrapper">
        <div class="bg-blob primary"></div>
        <div class="bg-blob secondary"></div>

        <div class="container py-5 position-relative">

            <header class="mb-5 px-2">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5">
                    <div class="d-flex align-items-center gap-3">
                        <button @click="$router.push('/admin')" class="btn-home-glass" title="กลับหน้าหลัก">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div>
                            <h1 class="display-6 fw-extrabold text-dark mb-1">Laundry Hub</h1>
                            <p class="text-muted fw-medium m-0">
                                <i class="fas fa-calendar-day me-2 text-primary"></i>Dashboard ประจำวัน
                            </p>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <button @click="loadOrders" class="btn-refresh-neo" :class="{ 'spinning': loading }">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-6 col-lg-3" v-for="stat in stats" :key="stat.label">
                        <div class="glass-stat-card shadow-sm">
                            <div class="stat-icon" :class="stat.color">
                                <i :class="stat.icon"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-label">{{ stat.label }}</span>
                                <h3 class="stat-value">{{ stat.count }}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <transition-group name="list" tag="div" class="row g-4 px-2">
                <div v-for="o in orders" :key="o.id" class="col-12 col-xl-6">
                    <div class="order-ultra-card shadow-sm" :class="o.status">

                        <div class="card-main-info p-4 p-md-5">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <div class="d-flex align-items-center">
                                    <div class="avatar-circle">
                                        {{ o.customer_name.charAt(0).toUpperCase() }}
                                        <div class="status-dot"></div>
                                    </div>
                                    <div class="ms-4">
                                        <h4 class="customer-title mb-1">{{ o.customer_name }}</h4>
                                        <span class="order-tag">#ORD-{{ String(o.id).padStart(4, '0') }}</span>
                                    </div>
                                </div>
                                <div class="price-pill shadow-sm">฿{{ Number(o.total_price).toLocaleString() }}</div>
                            </div>

                            <div class="d-flex flex-wrap gap-4 info-badges mt-2">
                                <div class="info-item"><i class="far fa-clock me-2 text-primary"></i> {{ o.pickup_date
                                    }}</div>
                                <div class="info-item"><i class="fas fa-tshirt me-2 text-primary"></i>
                                    รายการซักผ้าทั่วไป</div>
                            </div>
                        </div>

                        <div class="card-timeline px-4 px-md-5 py-4 bg-light-soft">
                            <div class="timeline-container">
                                <div class="timeline-line">
                                    <div class="line-fill" :style="{ width: getProgressWidth(o.status) + '%' }"></div>
                                </div>
                                <div v-for="(step, index) in steps" :key="index" class="timeline-step"
                                    :class="{ 'completed': isAtLeast(o.status, step.key), 'current': o.status === step.key }">
                                    <div class="step-circle" v-b-tooltip.hover :title="step.label">
                                        <i :class="step.icon"></i>
                                    </div>
                                    <span class="step-label-mobile d-none d-md-block">{{ step.shortLabel }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="card-actions-area p-4 p-md-5">
                            <div class="status-summary">
                                <span class="text-uppercase small fw-bold text-muted ls-1">สถานะปัจจุบัน</span>
                                <p :class="['status-text', o.status]">{{ translateStatus(o.status) }}</p>
                            </div>

                            <div class="action-buttons">
                                <button v-if="o.status !== 'delivered'" @click="updateStatus(o.id)"
                                    class="btn-gradient-action" :disabled="loadingId === o.id">
                                    <span v-if="loadingId === o.id"
                                        class="spinner-border spinner-border-sm me-2"></span>
                                    <template v-else>
                                        {{ getNextActionText(o.status) }}
                                        <i class="fas fa-chevron-right ms-2"></i>
                                    </template>
                                </button>
                                <div v-else class="success-stamp anim-pop">
                                    <i class="fas fa-check-circle me-2"></i> งานเรียบร้อย
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition-group>

            <div v-if="orders.length === 0 && !loading" class="empty-state text-center py-5">
                <div class="empty-icon-wrapper mb-4">
                    <i class="fas fa-wind text-muted opacity-25"></i>
                </div>
                <h3 class="fw-bold text-dark">ยังไม่มีงานเข้ามา</h3>
                <p class="text-muted">เมื่อมีออเดอร์ใหม่ รายการจะมาปรากฏที่นี่</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            orders: [],
            loading: false,
            loadingId: null,
            steps: [
                { key: 'pending', label: 'รอรับงาน', shortLabel: 'งานใหม่', icon: 'fas fa-inbox' },
                { key: 'accepted', label: 'รับงาน', shortLabel: 'ยืนยัน', icon: 'fas fa-hand-holding-heart' },
                { key: 'picked_up', label: 'รับผ้า', shortLabel: 'รับผ้า', icon: 'fas fa-truck' },
                { key: 'washing', label: 'ซัก/อบ', shortLabel: 'ซักผ้า', icon: 'fas fa-soap' },
                { key: 'ready', label: 'พร้อมส่ง', shortLabel: 'พร้อมส่ง', icon: 'fas fa-box' },
                { key: 'delivered', label: 'สำเร็จ', shortLabel: 'สำเร็จ', icon: 'fas fa-check-double' }
            ]
        }
    },
    computed: {
        stats() {
            return [
                { label: 'งานใหม่', count: this.orders.filter(o => o.status === 'pending').length, color: 'warn', icon: 'fas fa-bell' },
                { label: 'กำลังซัก', count: this.orders.filter(o => o.status === 'washing').length, color: 'info', icon: 'fas fa-spinner' },
                { label: 'ทั้งหมดวันนี้', count: this.orders.length, color: 'primary', icon: 'fas fa-list-ul' },
                { label: 'ส่งงานแล้ว', count: this.orders.filter(o => o.status === 'delivered').length, color: 'success', icon: 'fas fa-check-circle' },
            ]
        }
    },
    methods: {
        async loadOrders() {
            this.loading = true;
            try {
                const res = await this.$axios.get('/admin/orders_today.php');
                if (res.data.success) this.orders = res.data.data;
            } finally { this.loading = false; }
        },
        async updateStatus(id) {
            this.loadingId = id;
            try {
                const res = await this.$axios.post('/admin/orders_update_status.php', { order_id: id });
                if (res.data.success) await this.loadOrders();
            } finally { this.loadingId = null; }
        },
        translateStatus(s) {
            const map = { pending: 'รอการยืนยัน', accepted: 'รับออเดอร์แล้ว', picked_up: 'รับผ้ามาแล้ว', washing: 'กำลังซัก/อบผ้า', ready: 'ซักเสร็จ/รอส่ง', delivered: 'ส่งงานสำเร็จ' };
            return map[s] || s;
        },
        getNextActionText(s) {
            const map = { pending: 'ยืนยันออเดอร์', accepted: 'บันทึกว่ารับผ้าแล้ว', picked_up: 'เริ่มขั้นตอนซักผ้า', washing: 'ซัก/อบเสร็จสิ้น', ready: 'ส่งมอบผ้าคืน' };
            return map[s] || 'ดำเนินการต่อ';
        },
        isAtLeast(current, target) {
            const lv = ['pending', 'accepted', 'picked_up', 'washing', 'ready', 'delivered'];
            return lv.indexOf(current) >= lv.indexOf(target);
        },
        getProgressWidth(s) {
            const lv = ['pending', 'accepted', 'picked_up', 'washing', 'ready', 'delivered'];
            return (lv.indexOf(s) / (lv.length - 1)) * 100;
        }
    },
    mounted() { this.loadOrders(); }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.orders-page-wrapper {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #f8fbff;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
}

.fw-extrabold {
    font-weight: 800;
}

.ls-1 {
    letter-spacing: 1px;
}

/* 🧬 Background Decorations */
.bg-blob {
    position: absolute;
    width: 600px;
    height: 600px;
    filter: blur(100px);
    opacity: 0.12;
    z-index: 0;
    pointer-events: none;
}

.bg-blob.primary {
    background: #4e73df;
    top: -10%;
    right: -5%;
}

.bg-blob.secondary {
    background: #22c55e;
    bottom: -10%;
    left: -5%;
}

/* 🏠 Home Button */
.btn-home-glass {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.btn-home-glass:hover {
    transform: translateX(-5px);
    background: white;
    color: #4e73df;
}

/* 💎 Glass Stat Cards */
.glass-stat-card {
    background: white;
    border: 1px solid #f1f5f9;
    padding: 1.75rem;
    border-radius: 28px;
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
}

.stat-icon.warn {
    background: #fffbeb;
    color: #f59e0b;
}

.stat-icon.info {
    background: #f0f9ff;
    color: #0ea5e9;
}

.stat-icon.primary {
    background: #eef2ff;
    color: #6366f1;
}

.stat-icon.success {
    background: #f0fdf4;
    color: #22c55e;
}

.stat-label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-weight: 800;
    margin: 0;
    color: #1e293b;
}

/* 🧺 Order Ultra Card */
.order-ultra-card {
    background: white;
    border-radius: 35px;
    border: 1px solid #f1f5f9;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.order-ultra-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.07) !important;
}

.avatar-circle {
    width: 65px;
    height: 65px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.75rem;
    position: relative;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}

.customer-title {
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
}

.order-tag {
    background: #f1f5f9;
    color: #64748b;
    padding: 4px 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.8rem;
}

.price-pill {
    background: #1e293b;
    color: white;
    padding: 10px 20px;
    border-radius: 100px;
    font-weight: 800;
    font-size: 1.1rem;
}

/* 🚀 Timeline Styles */
.bg-light-soft {
    background-color: #fcfdfe;
    border-top: 1px solid #f8fafc;
    border-bottom: 1px solid #f8fafc;
}

.timeline-container {
    display: flex;
    justify-content: space-between;
    position: relative;
    padding: 35px 0;
}

.timeline-line {
    position: absolute;
    top: 52px;
    left: 5%;
    right: 5%;
    height: 6px;
    background: #f1f5f9;
    border-radius: 10px;
}

.line-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #a855f7);
    border-radius: 10px;
    transition: 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-circle {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: white;
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    z-index: 2;
    position: relative;
    transition: 0.4s;
}

.step-label-mobile {
    position: absolute;
    bottom: -25px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    white-space: nowrap;
}

.timeline-step.completed .step-circle {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
    transform: scale(1.1);
}

.timeline-step.completed .step-label-mobile {
    color: #6366f1;
}

.timeline-step.current .step-circle {
    background: white;
    color: #a855f7;
    border-color: #a855f7;
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

/* 🔘 Action Area */
.card-actions-area {
    background: white;
    display: flex;
    flex-direction: column;
    flex-md-row: row;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.status-text {
    font-weight: 800;
    margin: 0;
    font-size: 1.3rem;
    letter-spacing: -0.5px;
}

.status-text.pending {
    color: #f59e0b;
}

.status-text.washing {
    color: #3b82f6;
}

.status-text.delivered {
    color: #10b981;
}

.btn-gradient-action {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 20px;
    font-weight: 700;
    transition: 0.3s;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.btn-gradient-action:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.success-stamp {
    color: #10b981;
    font-weight: 800;
    font-size: 1.1rem;
    padding: 10px 20px;
    border: 2px solid #10b981;
    border-radius: 15px;
}

.btn-refresh-neo {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    border: none;
    background: white;
    color: #6366f1;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    transition: 0.3s;
}

.spinning i {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

/* 🌟 Animations */
.list-enter-active,
.list-leave-active {
    transition: all 0.6s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateY(40px);
}

.list-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>