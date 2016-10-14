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
        <div class="table-elem" v-for="new in news | filterBy searchQuery" v-link="'/news/' + new._id">
          <div>{{new.title}}</div>
          <div>{{new.date}}</div>
          <div>{{new.org.name.short}}</div>
          <div>{{new.tags}}</div>
          <div>{{new.author.username}}</div>
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
        <input type="text" v-model="new.title" id="title">
      </div>
      <div class="element">
        <label for="body">Cuerpo</label>
        <textarea id="body" v-model="new.body"></textarea>
      </div>
      <div class="element">
        <label for="date">Fecha</label>
        <input type="date" v-model="new.date" id="date">
      </div>
      <div class="element">
        <label for="location">Lugar</label>
        <div class="location-wrapper">
          <input type="text" v-model="new.location.city" placeholder="Ciudad">
          <input type="text" v-model="new.location.state" placeholder="Estado">
          <input type="text" v-model="new.location.country" placeholder="País">
        </div>
      </div>
      <div class="element">
        <label for="org">Organización</label>
        <div class="selector">
          <p>{{displayOrg}}</p>
          <input type="text" id="org" class="filter" @focus="selectorShow=true">
          <div class="selections" v-show="selectorShow">
            <p v-for="org in orgs | filterBy orgQuery" @click="setOrg(this.org)">{{org.name.short}}</p>
          </div>
        </div>
      </div>
      <!-- <div class="element">
        <label for="">Imagen</label>
        <input type="file" v-model="new.images[0]" placeholder="">
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
        new: {
          org: null,
          images: [],
          location: {}
        },
        displayOrg: null,
        orgs: [],
        users: [],
        addModelShow: false,
        selectorShow: false,
      }
    },
    methods: {
      setOrg(org) {
        this.new.org = org._id
        this.displayOrg = org.name.short
        this.selectorShow = false
      },
      addNew() {
        this.$http.post('/api/news', {'new': this.new}).then((res) => {
          this.addModelShow = false
          this.new = {}
          this.news.push(res.body.new)
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
