<template>
  <q-layout view="hHh lpR fFf">
    <div class="container">
      <img src="src/assets/login.jpg" alt="Plaza Alfonso Lopez">
    </div>
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<style scoped>
.container {
  position: fixed;
  width: 100%;
  height: 100%;
}

img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>