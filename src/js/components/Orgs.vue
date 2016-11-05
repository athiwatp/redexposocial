<template>
  <div class="">
    <div class="content" id="addOrg">
      <div class="mini-header">
        <input type="text" v-model="searchQuery" placeholder="Buscar...">
        <button type="text" @click="addModelShow = true">Nueva org</button>
      </div>
      <div class="table">
        <div class="table-head">
          <div class="table-elem">
            <div>Nombre</div>
            <div>Nombre de usuario</div>
            <div>Noticias</div>
            <div>Eventos</div>
            <div>Miembros</div>
          </div>
        </div>
        <div class="table-body">
          <div class="table-elem" v-link="'/orgs/' + org._id">
            <div>{{org.name.legal}}</div>
            <div>@{{org.username}}</div>
            <div>{{org.news.length}}</div>
            <div>{{org.events.length}}</div>
            <div>{{org.members.length}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="hover" v-if="addModelShow" transition="fade">
      <div class="add-model">
        <div class="header">
          <h1>Organización</h1>
          <button type="button" class="cancel" @click="addModelShow = false">Cancelar</button>
        </div>
        <div class="element">
          <label for="">Nombre corto</label>
          <input type="text" v-model="org.name.short" placeholder="">
        </div>
        <div class="element">
          <label for="">Nombre legal</label>
          <input type="text" v-model="org.name.legal" placeholder="">
        </div>
        <div class="element">
          <label for="">Nombre de usuario</label>
          <input type="text" v-model="org.username" placeholder="">
        </div>
        <label for="">Temas</label>
        {{org.topics}}
        <input type="text" v-model="topic" placeholder="">
        <h3>Contacto</h3>
        <div class="element">
          <label for="">Facebook</label>
          <input type="text" v-model="org.contact.social.facebook" placeholder="">
        </div>
        <div class="element">
          <label for="">Twitter</label>
          <input type="text" v-model="org.contact.social.twitter" placeholder="">
        </div>
        <div class="element">
          <label for="">Sitio web</label>
          <input type="text" v-model="org.contact.url" placeholder="">
        </div>
        {{org.contact.numbers}}
        <div class="element">
          <label for="phone">Teléfonos</label>
          <input type="text" v-model="number" placeholder="" id="phone">
        </div>
        {{org.contact.emails}}
        <div class="element">
          <label for="email">Correos</label>
          <input type="text" v-model="email" placeholder="" id="email">
        </div>
        <h3>Localización</h3>
        <div class="element">
          <label for="street">Calle</label>
          <input type="text" v-model="org.location.street" placeholder="" id="street">
        </div>
        <div class="element">
          <label for="number">Número</label>
          <input type="text" v-model="org.location.number" placeholder="" id="number">
        </div>
        <div class="element">
          <label for="locality">Localidad</label>
          <input type="text" v-model="org.location.locality" placeholder="" id="locality">
        </div>
        <div class="element">
          <label for="pc">Código postal</label>
          <input type="text" v-model="org.location.pc" placeholder="" id="pc">
        </div>
        <div class="element">
          <label for="state">Estado</label>
          <input type="text" v-model="org.location.state" placeholder="" id="state">
        </div>
        <div class="element">
          <label for="country">País</label>
          <input type="text" v-model="org.location.country" placeholder="" id="country">
        </div>
        <div class="element">
          <label for="position">Mapa</label>
          <input type="text" v-model="org.location.position" placeholder="" id="position">
        </div>
        <button type="button" v-on:click="addOrg()" class="add">Añadir OSC</button>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from '../auth.js'

export default {
  data() {
    return {
      searchQuery: '',
      error: '',
      addModelShow: false,
      topic: '',
      number: '',
      email: '',
      orgs: [],
      org: {
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
  created() {
    this.$parent.active = 1,
    this.$http.get(window.host + '/api/orgs')
    .then((data) => {
      this.orgs = data.body.orgs
    },(err) => {
      this.error = err
    })
    this.active = 0
  },
  methods: {
    addOrg() {
      this.$http.post('/api/orgs', {'org': this.org}).then((res) => {
        this.addModelShow = false
        this.org = {}
        this.orgs.push(res.body.org)
      }, (err) => {
        this.error = err
      })
    }
  }
}
</script>
