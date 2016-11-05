'use strict'

import Vue from 'vue/dist/vue.js';
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import DecodeToken from 'jwt-decode'
// import VueGoogleMap from 'vue-google-maps'

import Orgs from "./components/Orgs.vue"
import Org from "./components/Org.vue"
import Index from "./components/Index.vue"
import Events from "./components/Events.vue"
import News from "./components/News.vue"
import New from "./components/New.vue"
import Auth from "./auth.js"
import Login from "./components/Login.vue"
import MyInfo from "./components/MyInfo.vue"

// VueGoogleMap.load({
//     'key': 'AIzaSyCm_FGlbhv4Tp8pCWMCrPmVghWw7rgvifE',
// })
// Vue.component('google-map', VueGoogleMap.Map)

Vue.use(VueResource)
Vue.use(VueRouter)

Vue.options.replace = false
window.host = 'http://localhost:8080'

Vue.http.interceptors.push((request, next) => {

  let token = localStorage.getItem('token')

  if (!token && request.url.split('/').pop() != "authenticate") {
    window.location.href = "/"
  } else if (request.url.split('/').pop() != "authenticate") {
    if (DecodeToken(token).exp < parseInt(Date.now())/1000) {
      window.location.href = "/login"
    }
    Vue.http.headers.common['x-access-token'] = token
  }

  next()
})

export var router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Index },
    { path: '/orgs', component: Orgs },
    { path: '/orgs/:id', component: Org },
    { path: '/events', component: Events },
    { path: '/news', component: News },
    { path: '/news/:id', component: New },
    { path: '/my-info', component: MyInfo },
    { path: '/login', component: Login },
    { path: '*', redirect: '/' }
  ]
})

new Vue({
  el: '#app',
  router: router,
  template: `
    <template>
      <body>
        <header>
          <nav>
            <div class="content">
              <ul class="nav-menu">
                <li v-bind:class="{'active': active == 0}" id="resa-logo"><router-link to="'/'"><img src="/static/img/logos/resa.svg" alt="RESA"/></router-link></li>
                <li v-bind:class="{'active': active == 1}" v-if="user.authenticated"><router-link to="'/orgs'">Organizaciones</router-link></li>
                <li v-bind:class="{'active': active == 2}" v-if="user.authenticated"><router-link to="'/events'">Eventos</router-link></li>
                <li :class="{'active': active == 3}" v-if="user.authenticated"><router-link to="'/news'">Noticias</router-link></li>
                <li :class="{'active': active == 4}" v-if="!user.authenticated"><router-link to="'/login'">Login</router-link></li>
                <li :class="{'active': active == 5}" v-if="user.authenticated" class="show-more"><a @click="showMore = !showMore">Mas</a>
                  <div class="more-options" v-show="showMore">
                    <p><router-link="'/my-info'">Mi información</router-link></p>
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
    `,
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
}) // Start the app on the #app div
