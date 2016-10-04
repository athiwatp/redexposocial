<template>
  <main class="content">
    <div class="org-image">
      <img src="{{org.image}}" alt="" />
      <input type="file" @change="fileChange" accept="image/*">
    </div>
    <h3>{{org.name.short}}</h3>
    <label for="">Legal name</label>
    <input type="text" value="{{org.name.legal}}" readonly="true">
    <label for="">Username</label>
    <input type="text" value="{{org.username}}" readonly="true">
    <h3>Contact</h3>
    <label for="twitter">Twitter</label>
    <input type="text" value="{{org.contact.social.twitter}}" readonly="true">
    <label for="Facebook">Facebook</label>
    <input type="text" value="{{org.contact.social.facebook}}" readonly="true">
    <label for="">Emails</label>
    <label for="">Numbers</label>
  </main>
</template>

<script>
export default {
  data() {
    return {
      file: {},
      org: {
        image: '',
        name: {
          short: '',
          legal: ''
        },
        topics: [],
        contact: {
          social: {
            facebook: '',
            twitter: '',
          },
          emails: [],
          numbers: []
        },
        location: {}
      }
    }
  },
  created(){
    this.getOrg(this.$route.params.id)
  },
  methods: {
    getOrg(id){
      this.$http.get('/api/orgs/' + id).then((res) => {
        this.org = res.body.org
      }, (err) => {
        this.error = err
      })
    },
    fileChange(e) {
      var files = e.target.files
      if (!files.length)
        return
      this.createImage(files[0])
    },
    createImage(file){
      var reader = new FileReader();
      var image = new Image()
      var self = this

      reader.onload = (e) => {
        self.$http.post('/api/orgs/' + this.$route.params.id + '/photo',
        {'img': e.target.result})
        .then((res) => {
          this.org.image = res.body.path
        }, (err) => {
          this.error = err
        })

      }
      reader.readAsDataURL(file)

      console.log('Upload image')
    }
  }
}
</script>
