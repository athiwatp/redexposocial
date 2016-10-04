<template>
  <main class="content">
    <div class="mini-header">
      <input type="text" v-model="searchQuery" placeholder="Buscar...">
      <button type="text" @click="addModelShow = true">Add new</button>
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
          <div>{{new.name.legal}}</div>
          <div>@{{new.username}}</div>
          <div>{{new.news.length}}</div>
          <div>{{new.events.length}}</div>
          <div>{{new.members.length}}</div>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
  export default {
    data() {
      return {
        news: [],
        addModelShow: false
      }
    },
    created() {
      this.$parent.active = 3
    }
  }
</script>
