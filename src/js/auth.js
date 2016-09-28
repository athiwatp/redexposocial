import router from './app.js'

const API_URL = 'http://localhost:8080/api', // URL and endpoint constants
      SIGNUP_URL = API_URL + 'users'

export default {

  login(context, creds, redirect) { // Send a request to the login URL and save the returned JWT
    context.$http.post(API_URL + '/authenticate', creds)
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
    if (localStorage.getItem('token'))
      return true
    return false
  },

  // getAuthHeader() { // The object to be passed as a header for authenticated requests
  //   return
  // }
}
