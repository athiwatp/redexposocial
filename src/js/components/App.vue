<template>
  <header>
    <nav>
      <div class="content">
        <ul class="nav-menu">
          <li v-bind:class="{ 'active': active == 0}" id="resa-logo"><a v-link="'index'"><img src="/static/img/logos/resa.svg" alt="RESA"/></a></li>
          <li v-bind:class="{ 'active': active == 1}" v-if="user.authenticated"><a v-link="'orgs'">Organizaciones</a></li>
          <li v-bind:class="{ 'active': active == 2}" v-if="user.authenticated"><a v-link="'events'">Eventos</a></li>
          <li v-bind:class="{ 'active': active == 3}" v-if="user.authenticated"><a v-link="'news'">Noticias</a></li>
          <li v-bind:class="{ 'active': active == 4}" v-if="!user.authenticated"><a v-link="'login'">Login</a></li>
          <li v-bind:class="{ 'active': active == 5}" v-if="user.authenticated" class="show-more"><a @click="showMore = !showMore">More</a>
            <div class="more-options" v-show="showMore">
              <p><a @click="logout()">Logout</a></p>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  <router-view></router-view>
</template>
<script>
import Auth from '../auth.js'
export default {
    data() {
      return {
        showMore: false,
        user: { authenticated: false },
        active: 0
      }
    },
    created() {
      if (localStorage.getItem('token'))
        this.user.authenticated = true
      else
        this.user.authenticated = false
    },
    methods: {
      logout() {
        Auth.logout(this)
      }
    }
  }
</script>
