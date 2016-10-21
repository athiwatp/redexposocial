<template>
  <body>
  <header>
    <nav>
      <div class="content">
        <ul class="nav-menu">
          <li v-bind:class="{'active': active == 0}" id="resa-logo"><a v-link="'/'"><img src="/static/img/logos/resa.svg" alt="RESA"/></a></li>
          <li v-bind:class="{'active': active == 1}" v-if="user.authenticated"><a v-link="'/orgs'">Organizaciones</a></li>
          <!-- <li v-bind:class="{'active': active == 2}" v-if="user.authenticated"><a v-link="'/events'">Eventos</a></li> -->
          <li :class="{'active': active == 3}" v-if="user.authenticated"><a v-link="'/news'">Noticias</a></li>
          <li :class="{'active': active == 4}" v-if="!user.authenticated"><a v-link="'/login'">Login</a></li>
          <li :class="{'active': active == 5}" v-if="user.authenticated" class="show-more"><a @click="showMore = !showMore">Mas</a>
            <div class="more-options" v-show="showMore">
              <p><a v-link="'/my-info'">Mi información</a></p>
              <p><a @click="logout()">Logout</a></p>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  <router-view></router-view>
  <footer>
    <img class="powered" src="/static/img/logos/powered.svg" alt="" />
    <p>Compartido bajo la licencia <a href="https://opensource.org/licenses/MIT" target="_blank">MIT</a>. Copyright &copy; 2016 RedExpoSocial.</p>
    <p>Desarrollado por <a href="http://www.cesargdm.com" target="_blank">cesargdm</a></p>
  </footer>
  </body>
</template>

<script>
import Auth from '../auth.js'
import DecodeToken from 'jwt-decode'

export default {
    data() {
      return {
        showMore: false,
        user: { authenticated: false },
        active: 0
      }
    },
    created() {

      if (localStorage.getItem('token')) {
        if (DecodeToken(localStorage.getItem('token')).exp > parseInt(Date.now())/1000)
          this.user.authenticated = true
        else this.user.authenticated = false
      } else this.user.authenticated = false

    },
    methods: {
      logout() {
        Auth.logout(this)
      }
    }
  }
</script>
