import router from './app.js'

export default {

  login(context, creds, redirect) { // Send a request to the login URL and save the returned JWT
    context.$http.post(window.host + '/api/authenticate', creds)
    .then((data) => {

      localStorage.setItem('token', data.body.token)
      context.$parent.user.authenticated = true
      if (redirect) // Redirect to a specified route
        context.$router.go(redirect)

    },(err) => {

      context.error = err

    })
  },

  signup(context, creds, redirect) {
    context.$http.post(SIGNUP_URL, creds)
    .then((data) => {
      localStorage.setItem('token', data.body.token)

      if (redirect)
        context.$router.go(redirect)

    },(err) => {
      context.error = err
    })
  },

  logout(context) { // To log out, we just need to remove the token

    localStorage.removeItem('token')
    context.user.authenticated = false
    context.$router.go('/')

  },

  checkAuth() {
    if (DecodeToken(localStorage.getItem('token')).exp > parseInt(Date.now())/1000)
      return true
    return false
  }

}
