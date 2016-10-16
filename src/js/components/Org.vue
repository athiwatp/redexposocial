<template>
  <main class="content">
    <button type="button" @click="editModel()" v-show="!editing">Edit</button>
    <button type="button" @click="cancel()" v-show="editing" class="cancel filled">Cancel</button>
    <button type="button" @click="save()" v-show="editing" class="save">Save</button>
    <div class="model editable">
      <div class="org-image">
        <img :src="org.image" alt="" />
        <input type="file" @change="fileChange" accept="image/*">
      </div>
      <div class="element">
        <input type="text" v-model="org.name.short" :readonly="!editing" class="title">
      </div>
      <div class="section">
        <div class="element">
          <label for="">Nombre legal</label>
          <input type="text" v-model="org.name.legal" :readonly="!editing">
        </div>
        <div class="element">
          <label for="">Nombre de usuario</label>
          <input type="text" v-model="org.username" :readonly="!editing">
        </div>
      </div>
      <h3>Contact</h3>
      <div class="section">
        <div class="element">
          <label for="twitter">Twitter</label>
          <input type="text" v-model="org.contact.social.twitter" :readonly="!editing">
        </div>
        <div class="element">
          <label for="">Sitio web</label>
          <input type="text" v-model="org.contact.url" :readonly="!editing">
        </div>
        <div class="element">
          <label for="Facebook">Facebook</label>
          <input type="text" v-model="org.contact.social.facebook" :readonly="!editing">
        </div>
        <div class="element">
          <label for="numbers">Números de teléfono</label>
          <input type="text" v-model="org.contact.numbers" :readonly="!editing">
        </div>
        <div class="element">
          <label for="emails">Correos electrónicos</label>
          <input type="text" v-model="org.contact.emails" :readonly="!editing">
        </div>
      </div>
      <h3>Location</h3>
      <div class="section">
        <div class="element">
          <label for="twitter">Calle</label>
          <input type="text" v-model="org.location.street" :readonly="!editing">
        </div>
        <div class="element">
          <label for="">Número</label>
          <input type="text" v-model="org.location.number" :readonly="!editing">
        </div>
        <div class="element">
          <label for="Facebook">Ciudad/Localidad</label>
          <input type="text" v-model="org.location.locality" :readonly="!editing">
        </div>
        <div class="element">
          <label for="numbers">Código postal</label>
          <input type="text" v-model="org.location.pc" :readonly="!editing">
        </div>
        <div class="element">
          <label for="emails">Estado</label>
          <input type="text" v-model="org.location.state" :readonly="!editing">
        </div>
        <div class="element">
          <label for="contry">País</label>
          <input type="text" v-model="org.location.country" :readonly="!editing" id="country">
        </div>
      </div>
      <h3>Fundation</h3>
      <h3>Events</h3>
      <h3>Members</h3>
    </div>
    <!-- {{org | json}} -->
  </main>
</template>

<script>
export default {
  data() {
    return {
      editing: false,
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
    this.editing = false
    this.getOrg(this.$route.params.id)
  },
  methods: {
    editModel() {
      this.editing = !this.editing
    },
    cancel() {
      this.getOrg(this.$route.params.id)
      this.editing = false
    },
    save() {
      this.$http.put('/api/orgs/' + this.$route.params.id,
      {'org': this.org})
      .then((res) => {

        this.getOrg(this.$route.params.id)
        this.editing = false

      }, (err) => {
        this.error = err
      })
    },
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
