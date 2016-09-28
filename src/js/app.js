'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

import App from './components/App.vue'
import Orgs from './components/Orgs.vue'
import Index from './components/Index.vue'
import Events from './components/Events.vue'
import News from './components/News.vue'
import Auth from './auth.js'
import Login from './components/Login.vue'

Vue.use(VueResource)
Vue.use(VueRouter)

Vue.options.replace = false


Vue.http.interceptors.push((request, next) => {

  if (localStorage.getItem('token'))
    Vue.http.headers.common['x-access-token'] = localStorage.getItem('token')
  else
    console.log('No token')

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
