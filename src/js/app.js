'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import DecodeToken from 'jwt-decode'

import App from "./components/App.vue"
import Orgs from "./components/Orgs.vue"
import Org from "./components/Org.vue"
import Index from "./components/Index.vue"
import Events from "./components/Events.vue"
import News from "./components/News.vue"
import Auth from "./auth.js"
import Login from "./components/Login.vue"

Vue.use(VueResource)
Vue.use(VueRouter)

Vue.options.replace = false

window.host = 'http://localhost:8080'

//604800

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
  history: true
})

router.map({
  '/': {
    component: Index
  },
  '/orgs': {
    component: Orgs
  },
  '/orgs/:id': {
    component: Org
  },
  '/events': {
    component: Events
  },
  '/news': {
    component: News
  },
  '/login': {
    component: Login
  },
})

router.redirect({ // Redirect to the home route if any routes are unmatched
  '*': '/'
})

router.start(App, '#app') // Start the app on the #app div
