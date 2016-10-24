<template>
  <main class="content">
    <div>
      <h2>Log In</h2>
      <div class="form-group">
        <input type="text" placeholder="Usuario o email" v-model="user.username" v-on:keyup.enter="submit()">
      </div>
      <div class="form-group">
        <input type="password" v-model="user.password" v-on:keyup.enter="submit()">
      </div>
      <button class="btn btn-primary" @click="submit()">Access</button>
    </div>
  </main>
</template>

<script>
import Auth from '../auth.js'
export default {
  data() {
    return {
      // We need to initialize the component with any
      // properties that will be used in it
      user: {
        username: '',
        password: ''
      },
      error: ''
    }
  },
  methods: {
    submit() {
      let credentials = {
        username: this.user.username,
        email: this.user.username,
        password: this.user.password
      }
      // We need to pass the component's this context to properly make use of http in the auth service
      Auth.login(this, credentials, '/')
    }
  }

}
</script>
