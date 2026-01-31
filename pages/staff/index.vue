<template>
  <div>
    <h1>🧑‍🔧 งานรับผ้า / ส่งผ้า</h1>
    <button @click="logout">ออกจากระบบ</button>
  </div>
</template>
<script>
export default {
  methods: {
    logout () {
      this.$store.commit('SET_USER', null)
      this.$router.push('/login')
    }
  }
}
</script>
