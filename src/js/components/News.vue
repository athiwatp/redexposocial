<template>
  <main class="content">
    <div class="mini-header">
      <input type="text" v-model="searchQuery" placeholder="Buscar...">
      <button type="text" @click="addModelShow = true">Nueva noticia</button>
    </div>
    <div class="table">
      <div class="table-head">
        <div class="table-elem">
          <div>Title</div>
          <div>Date</div>
          <div>Org</div>
          <div>Tags</div>
          <div>Author</div>
        </div>
      </div>
      <div class="table-body">
        <div class="table-elem" v-for="new in news | filterBy searchQuery" v-link="'/news/' + newObject._id">
          <div><p v-if="new.title">{{new.title}}</p></div>
          <div><p v-if="new.date">{{new.date}}</p></div>
          <div><p v-if="new.org">{{new.org.name.short}}</p></div>
          <div><p v-if="new.tags">{{new.tags}}</p></div>
          <div><p v-if="newObject.author">{{newObject.author.username}}</p></div>
        </div>
      </div>
    </div>
  </main>
  <div class="hover" v-if="addModelShow" transition="fade">
    <div class="add-model">
      <div class="header">
        <h1>Noticia</h1>
        <button type="button" class="cancel" @click="addModelShow=false">Cancelar</button>
      </div>
      <div class="element">
        <label for="title">Título</label>
        <input type="text" v-model="newObject.title" id="title">
      </div>
      <div class="element">
        <label for="body">Cuerpo</label>
        <textarea id="body" v-model="newObject.body"></textarea>
      </div>
      <!-- <div class="element">
        <label for="date">Fecha</label>
        <input type="date" v-model="newObject.date" id="date">
      </div> -->
      <!-- <div class="element">
        <label for="location">Lugar</label>
        <div class="location-wrapper">
          <input type="text" v-model="newObject.location.city" placeholder="Ciudad">
          <input type="text" v-model="newObject.location.state" placeholder="Estado">
          <input type="text" v-model="newObject.location.country" placeholder="País">
        </div>
      </div> -->
      <div class="element">
        <label for="org">Organización</label>
        <div class="selector">
          <p>{{displayOrg}}</p>
          <input type="text" id="org" class="filter" @focus="selectorShow=true" v-model="orgQuery">
          <div class="selections" v-show="selectorShow">
            <p v-for="org in orgs | filterBy orgQuery" @click="setOrg(this.org)">{{org.name.short}}</p>
          </div>
        </div>
      </div>
      <div class="element progress">
        <img src="/static/img/icons/spin.gif" class="spinner" v-show="uploadingImage"/>
        <label for="">Imagen</label>
        <input type="file" v-model="newObject.images[0]" @change="fileChange" name="headerImage">
      </div>
      <button type="button" @click="addNew()" class="add" :disabled="uploadingImage">Añadir noticia</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        uploadingImage: false,
        news: [],
        newObject: {
          org: null,
          images: [],
          location: {},
          title: ''
        },
        orgQuery: null,
        displayOrg: null,
        orgs: [],
        users: [],
        addModelShow: false,
        selectorShow: false,
      }
    },
    methods: {
      fileChange(e) {
        this.uploadingImage = true
        var files = e.target.files
        if (!files.length)
          return
        this.upload(files[0])
      },
      setOrg(org) {
        this.newObject.org = org._id
        this.displayOrg = org.name.short
        this.selectorShow = false
      },
      addNew() {
        this.$http.post('/api/news', {'newObject': this.newObject}).then((res) => {
          this.addModelShow = false
          this.news.push(res.body.newObject)
          this.newObject = {}
        }, (err) => {
          this.error = err
        })
      },
      upload(file) {
        var reader = new FileReader(),
            image = new Image(),
            self = this
        reader.onload = (e) => {
          self.$http.post('/api/upload',
          {'img': e.target.result})
          .then((res) => {
            self.newObject.images[0] = res.body.path
            self.uploadingImage = false
          }, (errRes) => {
            this.error = err
            self.uploadingImage = false
          })
        }
        reader.readAsDataURL(file)
      }
    },
    created() {
      this.$parent.active = 3

      this.$http.get(window.host + '/api/news')
      .then((data) => {
        this.news = data.body.news
      },(err) => {
        this.error = err
      })

      this.$http.get(window.host + '/api/orgs')
      .then((data) => {
        this.orgs = data.body.orgs
      },(err) => {
        this.error = err
      })

    }
  }
</script>
