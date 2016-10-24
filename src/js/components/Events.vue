<template>
  <main class="content">
    <div class="mini-header">
      <input type="text" v-model="searchQuery" placeholder="Buscar...">
      <button type="text" @click="addModelShow = true">Nuevo evento</button>
    </div>
  </main>
  <div class="hover" v-if="addModelShow" transition="fade">
    <div class="add-model">
      <div class="header">
        <h1>Evento</h1>
        <button type="button" class="cancel" @click="addModelShow=false">Cancelar</button>
      </div>
      <div class="element">
        <label for="title">Título</label>
        <input type="text" v-model="eventObject.title" id="title">
      </div>
      <div class="element">
        <label for="body">Descripción</label>
        <textarea id="body" v-model="eventObject.body"></textarea>
      </div>
      <div class="element">
        <label for="date">Fecha y hora</label>
        <input type="date" v-model="eventObject.date" id="date" placeholder="DD/MM/AAAA">
        <div class="location-wrapper">
          <input type="text" v-model="eventObject.location.city" placeholder="00">:
          <input type="text" v-model="eventObject.location.state" placeholder="00">
        </div>
      </div>
      <div class="element">
        <label for="location">Lugar</label>
        VM:PLACE{{eventObject.location.position.lat}}
        <google-map style="width: 100%;height: 150px;position: relative;display: block;left: 0;top: 0" :center="gmap.center" :zoom="gmap.zoom" @g-rightclick="saveMarker" @g-click="saveMarker">
        </google-map>
      </div>
      <div class="element">
        <label for="org">Organización organizadora</label>
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
        <input type="file" v-model="eventObject.images[0]" @change="fileChange" name="headerImage">
      </div>
      <button type="button" @click="addNew()" class="add" :disabled="uploadingImage">Añadir noticia</button>
    </div>
  </div>
</template>

<script>

export default {

  data() {
    return {
      gmap: {
        zoom: 12,
        center: {lat: 19.2949091, lng:-99.6396294},
      },
      markers: [],
      addModelShow: false,
      eventObject: {
        location: {
          position: {}
        },
        images: []
      }
    }
  },
  methods: {
    saveMarker: function(mouseArgs) {
      this.eventObject.location.position.lat = mouseArgs.latLng.lat()
      this.eventObject.location.position.lng = mouseArgs.latLng.lng()
      console.log(this.eventObject.location.position);
      const createdMarker = this.addMarker(mouseArgs.latLng.lat(), mouseArgs.latLng.lng());
    },
    fileChange: function() {

    },
    addMarker: function addMarker(lat, lng) {
      this.markers.push({
        position: { lat: lat, lng: lng },
        opacity: 1,
        draggable: true,
        enabled: true,
        clicked: 0,
        rightClicked: 0,
        dragended: 0,
        ifw: true,
        ifw2text: "Evento"
      });
      return this.markers[this.markers.length - 1];
    }
  },
  created() {
    this.$parent.active = 2
  }
}
</script>
