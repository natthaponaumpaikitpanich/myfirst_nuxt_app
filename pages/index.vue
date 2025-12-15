<template>
  <div>
    <v-row>
      <!-- 12 ช่อง -->
      <v-col
        md="6"
        cols="12"
        class="text-center"
        v-for="item in product"
        :key="item.id"
      >
        <v-card>
          <div class="font-weight-bold">ชื่อสินค้า : {{ item.name }}</div>
          <div class="font-weight-bold">ราคา : {{ item.price }}</div>
          <div class="font-weight-bold">รายละเอียด : {{ item.detail }}</div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  layout: 'default',
  name: 'App',
  data() {
    return {
      product: [
        { name: 'มาม่า', price: 10, detail: 'บะหมี่กึ่งสำเร็จรูป' },
        { name: 'ปลากระป๋อง', price: 15, detail: 'อาหารขึ้นห้าง' },
        { name: 'ข้าว', price: 15, detail: 'ข้าวเหนียว' },
        { name: 'น้ำเปล่า', price: 15, detail: 'น้ำเปล่า ตราสิงห์' },
      ],
    }
  },
}
</script>

<style scoped></style>
