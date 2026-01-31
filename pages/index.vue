<template>
  <div class="home">
    <h1>🧺 Laundry Service</h1>
    <p>บริการรับซักถึงหน้าบ้าน</p>

    <nuxt-link to="/login">เข้าสู่ระบบ</nuxt-link>
    <nuxt-link to="/register">สมัครสมาชิก</nuxt-link>
  </div>
</template>

<script>
export default {
  middleware: "guest"
};
</script>
