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
        <input type="text" v-model="event.title" id="title">
      </div>
      <div class="element">
        <label for="body">Descripción</label>
        <textarea id="body" v-model="event.body"></textarea>
      </div>
      <div class="element">
        <label for="date">Fecha y hora</label>
        <input type="date" v-model="event.date" id="date">
        <div class="location-wrapper">
          <input type="text" v-model="event.location.city" placeholder="00">
          <input type="text" v-model="event.location.state" placeholder="00">
        </div>
      </div>
      <div class="element">
        <label for="location">Lugar</label>
        VM:PLACE{{vm.place}}
        <input v-model=vm.searchPlace v-gmaps-searchbox=vm>
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
        <input type="file" v-model="event.images[0]" @change="fileChange" name="headerImage">
      </div>
      <button type="button" @click="addNew()" class="add" :disabled="uploadingImage">Añadir noticia</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addModelShow: false
    }
  },
  created() {
    this.$parent.active = 2
  }
}
</script>
