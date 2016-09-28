<template>
  <main class="content"  v-if="!$parent.user.authenticated">
    Not authenticated
  </main>
  <main class="content"  v-if="$parent.user.authenticated">
    Authenticated
  </main>
</template>

<script>
export default {
  created() {
    if (this.$parent.user.authenticated) {
        this.$parent.active = 0
        this.$http.get('http://localhost:8080/api/users')
        .then((data) => {
          this.users = data.body.users
        },(err) => {
          context.error = err
        })
    }
  },
  data() {
    return {
      active: 0,
      users: []
    }
  }
}

</script>
