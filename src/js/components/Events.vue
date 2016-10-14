<template>
  <main class="content">
    <div class="mini-header">
      <input type="text" v-model="searchQuery" placeholder="Buscar...">
      <!-- <button type="text" @click="addModelShow = true">Nuevo evento</button> -->
    </div>
  </main>
</template>

<script>
  export default {
    created() {
      this.$parent.active = 2
    }
  }
</script>
