<template>
  <main class="content" v-if="!$parent.user.authenticated">
    Not authenticated
  </main>
  <main class="content" v-if="$parent.user.authenticated">
    <h1>Bienvenido a RedExpoSocial</h1>
    <p>Aquí podrás administrar la información de las organizaciones de las que eres miembro, podrás añadir eventos y noticias que serán aprobadas por la RedExpoSocial para su publicación.</p>
    <p>¿Te gustaría mejorar este sitio? Envíame un <a href="mailto:cesargdm@icloud.com">correo</a> o puedes encontrar <a href="https://github.com/cesargdm/red-expo-social" target="_blank">aquí</a> el repositorio.</p>
  </main>
</template>

<script>
export default {
  created() {
    if (this.$parent.user.authenticated) {
        this.$parent.active = 0
        this.$http.get(window.host + '/api/users')
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
