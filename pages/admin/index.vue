<template>
  <div class="admin-layout">
    <nav class="top-nav">
      <div class="nav-brand">
        <i class="fas fa-washing-machine"></i>
        <span>ระบบของร้านซักอบ<span>รีด</span></span>
      </div>
      <div class="nav-actions">
        <span class="admin-name">สวัสดี, คุณเจ้าของร้าน</span>
        <button class="btn-logout-mini" @click="logout" title="ออกจากระบบ">
          <i class="fas fa-sign-out-alt">ออกจากระบบ</i>
        </button>
      </div>
    </nav>

    <main class="content-body">
      <section class="summary-grid">
        <div class="stat-card revenue">
          <div class="icon-box"><i class="fas fa-wallet"></i></div>
          <div class="stat-info">
            <p>รายได้วันนี้</p>
            <h3>฿{{ dashboard.revenue_today.toLocaleString() }}</h3>
          </div>
        </div>
        <div class="stat-card orders">
          <div class="icon-box"><i class="fas fa-shopping-basket"></i></div>
          <div class="stat-info">
            <p>ออเดอร์วันนี้</p>
            <h3>{{ dashboard.orders_today }} <small>งาน</small></h3>
          </div>
        </div>
        <div class="stat-card active-wash">
          <div class="icon-box"><i class="fas fa-sync fa-spin"></i></div>
          <div class="stat-info">
            <p>กำลังซัก/อบ</p>
            <h3>{{ dashboard.washing }} <small>เครื่อง</small></h3>
          </div>
        </div>
        <div class="stat-card staff">
          <div class="icon-box"><i class="fas fa-user-clock"></i></div>
          <div class="stat-info">
            <p>พนักงานเข้างาน</p>
            <h3>{{ dashboard.staff }} <small>คน</small></h3>
          </div>
        </div>
      </section>

      <div class="main-grid">
        <section class="charts-container">
          <div class="chart-box main-chart">
            <div class="chart-header">
              <h4><i class="fas fa-chart-line"></i> วิเคราะห์ยอดขายและออเดอร์</h4>
            </div>
            <div class="canvas-wrapper">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
          
          <div class="chart-sub-grid">
            <div class="chart-box">
               <p>ปริมาณออเดอร์</p>
               <canvas id="orderChart"></canvas>
            </div>
            <div class="chart-box">
               <p>สถานะการดำเนินงาน</p>
               <canvas id="statusChart"></canvas>
            </div>
          </div>
        </section>

        <aside class="actions-sidebar">
          <div class="action-card">
            <h4><i class="fas fa-th-large"></i> จัดการร้าน</h4>
            <div class="compact-menu">
              <button @click="$router.push('/admin/orders')"><i class="fas fa-file-invoice"></i> ออเดอร์</button>
              <button @click="$router.push('/admin/products/')"><i class="fas fa-box"></i> สินค้า/บริการ</button>
              <button @click="$router.push('/admin/staff/create')"><i class="fas fa-id-badge"></i> พนักงาน</button>
              <button @click="$router.push('/admin/settings')" class="btn-settings"><i class="fas fa-cog"></i> ตั้งค่า</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
export default {
  data () {
    return {
      dashboard: { revenue_today: 0, orders_today: 0, washing: 0, staff: 0 },
      charts: { revenue: null, orders: null, status: null }
    }
  },
  async mounted () {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
      this.$router.push('/login')
      return
    }
    await this.loadDashboard()
    await this.$nextTick()
    await this.loadCharts()
  },
  methods: {
    async loadDashboard () {
      try {
        const res = await this.$axios.get('/admin/dashboard.php')
        if (res.data.status) this.dashboard = res.data.data
      } catch (e) { console.error(e) }
    },
    async loadCharts () {
      try {
        const res = await this.$axios.get('/admin/stats.php')
        if (!res.data.status) return

        const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }

        // Revenue Chart (Line)
        this.charts.revenue = new Chart(document.getElementById('revenueChart'), {
          type: 'line',
          data: {
            labels: res.data.revenue.map(i => i.d),
            datasets: [{
              label: 'รายได้',
              data: res.data.revenue.map(i => i.total),
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25,118,210,0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: commonOptions
        })

        // Order Chart (Bar)
        this.charts.orders = new Chart(document.getElementById('orderChart'), {
          type: 'bar',
          data: {
            labels: res.data.orders.map(i => i.d),
            datasets: [{ data: res.data.orders.map(i => i.total), backgroundColor: '#42a5f5', borderRadius: 5 }]
          },
          options: commonOptions
        })

        // Status Chart (Doughnut)
        this.charts.status = new Chart(document.getElementById('statusChart'), {
          type: 'doughnut',
          data: {
            labels: res.data.statusChart.map(i => i.status),
            datasets: [{
              data: res.data.statusChart.map(i => i.total),
              backgroundColor: ['#66bb6a', '#ffa726', '#ef5350'],
              borderWidth: 0
            }]
          },
          options: { ...commonOptions, cutout: '70%', plugins: { legend: { display: true, position: 'bottom' } } }
        })
      } catch (e) { console.error(e) }
    },
    logout () {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f4f7f9;
  font-family: 'Kanit', sans-serif;
}

/* Top Navigation */
.top-nav {
  background: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.nav-brand {
  font-weight: 800;
  color: #1976d2;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-brand span span { color: #90caf9; font-size: 0.8rem; }

.btn-logout-mini {
  background: #ffebee;
  color: #d32f2f;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 15px;
  transition: 0.3s;
}

.btn-logout-mini:hover { background: #d32f2f; color: white; }

/* Main Content Area */
.content-body {
  max-width: 1400px;
  margin: 0 auto;
  padding: 25px;
}

/* Summary Cards */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: transform 0.3s;
}

.stat-card:hover { transform: translateY(-5px); }

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.revenue .icon-box { background: #e3f2fd; color: #1976d2; }
.orders .icon-box { background: #e8f5e9; color: #2e7d32; }
.active-wash .icon-box { background: #fff3e0; color: #ef6c00; }
.staff .icon-box { background: #f3e5f5; color: #7b1fa2; }

.stat-info p { font-size: 0.85rem; color: #777; margin: 0; }
.stat-info h3 { font-size: 1.4rem; margin: 5px 0 0; color: #333; }

/* Main Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 25px;
}

/* Charts */
.chart-box {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.main-chart { margin-bottom: 25px; }

.canvas-wrapper { height: 300px; position: relative; }

.chart-sub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-sub-grid .chart-box { height: 250px; }

/* Sidebar Actions */
.actions-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.action-card h4 { margin-top: 0; color: #555; font-size: 1rem; }

.compact-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compact-menu button {
  padding: 12px 15px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fff;
  color: #444;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.compact-menu button i { color: #1976d2; width: 20px; }

.compact-menu button:hover {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.compact-menu button:hover i { color: white; }

.btn-settings { margin-top: 10px; opacity: 0.7; }

.info-card {
  background: #eceff1;
  padding: 15px;
  border-radius: 12px;
  color: #607d8b;
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr; }
  .chart-sub-grid { grid-template-columns: 1fr; }
}
</style>