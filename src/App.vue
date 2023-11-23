<template>
  <div v-if="authStatus === 'authenticating'" class="row justify-center">
    <q-circular-progress indeterminate size="65px" :thickness="0.6" color="primary" center-color="grey-8"
      class="q-ma-md q-pt-md" />
    <h4>{{ authStatus }}</h4>
  </div>

  <router-view v-else />
</template>

<script>
import { defineComponent } from 'vue'
import useAuth from './modules/auth/composables/useAuth';

export default defineComponent({
  name: 'App',
  setup() {
    const { authStatus, checkAuthStatus } = useAuth()
    checkAuthStatus()
    return {
      authStatus
    }
  }
})
</script>
