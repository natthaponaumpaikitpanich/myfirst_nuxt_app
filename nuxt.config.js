import colors from 'vuetify/es5/util/colors'

export default {
  
  // SPA
  ssr: false,
  target: 'static',

  async logout () {
    await this.$axios.post('http://localhost/api/auth/logout.php')
    this.$store.commit('SET_USER', null)
    this.$router.push('/')
  },
  head: {
    script: [
      {
        src: "https://accounts.google.com/gsi/client",
        async: true,
        defer: true
      }
    ],
    titleTemplate: '%s - Laundry App',
    title: 'Laundry App',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      /* --- 🟢 เพิ่ม Font Awesome ตรงนี้ครับ --- */
      { 
        rel: 'stylesheet', 
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css' 
      }
      /* ---------------------------------- */
    ],
  },
  

  css: [],

  plugins: [],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify',
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
  ],

  /* ======================
      AXIOS → PHP API
      ====================== */
// nuxt.config.js
axios: {
  baseURL: 'http://localhost/api',
  headers: {
    common: {
      'Content-Type': 'application/json'
    }
  }
},

  pwa: {
    manifest: {
      lang: 'th',
    },
  },

  /* ======================
      ENV (เหลือเฉพาะที่ใช้)
      ====================== */
  env: {
    API_URL: process.env.API_URL,
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  build: {},
}