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
        <div class="table-elem" v-for="newObject in news | filterBy searchQuery" v-link="'/news/' + newObject._id">
          <div><p v-if="newObject.title">{{newObject.title}}</p></div>
          <div><p v-if="newObject.date">{{newObject.date}}</p></div>
          <div><p v-if="newObject.org">{{newObject.org.name.short}}</p></div>
          <div><p v-if="newObject.tags">{{newObject.tags}}</p></div>
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
      <div class="element">
        <label for="date">Fecha</label>
        <input type="date" v-model="newObject.date" id="date">
      </div>
      <div class="element">
        <label for="location">Lugar</label>
        <div class="location-wrapper">
          <input type="text" v-model="newObject.location.city" placeholder="Ciudad">
          <input type="text" v-model="newObject.location.state" placeholder="Estado">
          <input type="text" v-model="newObject.location.country" placeholder="País">
        </div>
      </div>
      <div class="element">
        <label for="org">Organización</label>
        <div class="selector">
          <p>{{displayOrg}}</p>
          <input type="text" id="org" class="filter" @focus="selectorShow=true" v-model="orgQuery">
          <div class="selections" v-show="selectorShow">
            <p v-for="org in filteredOrgs" @click="setOrg(this.org)">{{org.name.short}}</p>
          </div>
        </div>
      </div>
      <!-- <div class="element">
        <label for="">Imagen</label>
        <input type="file" v-model="newObject.images[0]" placeholder="">
      </div> -->
      <button type="button" v-on:click="addNew()" class="add">Añadir noticia</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        news: [],
        newObject: {
          org: null,
          images: [],
          location: {}
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
      setOrg(org) {
        this.newObject.org = org._id
        this.displayOrg = org.name.short
        this.selectorShow = false
      },
      addNew() {
        this.$http.post('/api/news', {'newObject': this.newObject}).then((res) => {
          this.addModelShow = false
          this.newObject = {}
          this.news.push(res.body.newObject)
        }, (err) => {
          this.error = err
        })
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
