<template>
  <div>
    <v-data-table :items="product" :headers="headers">
      <template v-slot:item.actions="{ item }">
        <v-btn small color="primary" @click="addToCart(item)">
          Add to Cart
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      headers: [
        { text: 'Product ID', value: 'productID' },
        { text: 'Name', value: 'name' },
        { text: 'Price', value: 'price' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      product: [
        { productID: '1001', name: 'IPhone 14', price: 30000 },
        { productID: '1002', name: 'IPhone 15', price: 40000 },
        { productID: '1003', name: 'IPhone 16', price: 50000 },
      ],
    }
  },
  methods: {
    ...mapActions({
      setName: 'cart/setName',
    }),
    addToCart(item) {
      this.setName({ productID: item.productID })
    },
  },
}
</script>
