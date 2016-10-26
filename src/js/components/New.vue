<template>
  <main class="content">
    <h1>Noticia</h1>
    <button type="button" @click="editModel()" v-show="!editing">Edit</button>
    <button type="button" @click="cancel()" v-show="editing" class="cancel filled">Cancel</button>
    <button type="button" @click="save()" v-show="editing" class="save">Save</button>
    <div class="model editable">
      <div class="newObject-image">
        <img v-for="image in newObject.images" :src="image" alt="" class="image"/>
        <!-- <input type="file" @change="fileChange" accept="image/*"> -->
      </div>
      <div class="element">
        <input type="text" v-model="newObject.title" :readonly="!editing" class="title">
      </div>
      <div class="section">
        <div class="element body">
          <label for="body">Cuerpo</label>
          <textarea v-model="newObject.body" :readonly="!editing" id="body"></textarea>
        </div>
      </div>
      <div class="element" v-on-clickaway="selectorShow=false">
        <label for="tags">Tags</label>
        <div class="selector tags">
          <p v-for="tag in newObject.tags" :style="{background: tag.color}" class="tag">{{tag.title}}</p>
          <!-- <input type="text" id="org" class="filter" @focus="selectorShow=true" v-model="tagQuery" id="tags">
          <div class="selections" v-show="selectorShow">
            <p v-for="tag in tags | filterBy tagQuery"
              @click="setTag(this.tag, $index)"
              :style="{background: tag.color}"
              class="tag"
              track-by="$index">{{tag.title}}</p>
          </div> -->
        </div>
      </div>
      <h3>Información</h3>
      <div class="section">
        <div class="element">
          <label for="author">Autor</label>
          <input type="text" v-model="newObject.author.username" :readonly="true" id="author">
        </div>
        <div class="element">
          <label for="org">Organización</label>
          <input type="text" v-model="newObject.org.name.short" :readonly="true" id="org">
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [ clickaway ],
  data() {
    return {
      tags: [],
      selectorShow: false,
      editing: false,
      file: {},
      tagQuery: null,
      newObject: {
        org: {
          name: {}
        },
        author: {}
      }
    }
  },
  created(){
    this.editing = false
    this.getNew(this.$route.params.id)

    this.$http.get(window.host + '/api/tags')
    .then((res) => {
      this.tags = res.body.tags
    }, (errRes) => {
      this.error = errRes
    })

  },
  methods: {
    editModel() {
      this.editing = !this.editing
    },
    cancel() {
      this.getNew(this.$route.params.id)
      this.editing = false
    },
    save() {
      this.$http.put('/api/news/' + this.$route.params.id,
      {'new': this.newObject})
      .then((res) => {
        this.getNew(this.$route.params.id)
        this.editing = false
      }, (errRes) => {
        this.error = errRes
      })
    },
    getNew(id){
      this.$http.get('/api/news/' + id).then((res) => {
        this.newObject = res.body.new
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
        self.$http.post('/api/news/' + this.$route.params.id + '/photo',
        {'img': e.target.result})
        .then((res) => {
          this.newObject.image = res.body.path
        }, (err) => {
          this.error = err
        })

      }
      reader.readAsDataURL(file)
    }
  }
}
</script>
