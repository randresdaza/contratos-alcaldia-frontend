<template>
  <q-item clickable tag="a" @click="navigateTo" :active="isSelected">
    <q-item-section v-if="icon" avatar>
      <q-icon size="30px" :name="icon" :color="color" />
    </q-item-section>

    <q-item-section>
      <q-item-label :class="{ 'selected-title': isSelected }">{{ title }}</q-item-label>
      <q-item-label :class="{ 'selected-caption': isSelected }" caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'primary'
    }
  },

  setup(props) {
    const router = useRouter()
    const store = useStore();

    const navigateTo = () => {
      store.commit('ui/setSelectedMenuItem', props.title);
      props.link.startsWith('http')
        ? window.open(props.link, '_blank')
        : router.push({ name: props.link })
    }

    const isSelected = computed(() => {
      return store.getters['ui/selectedMenuItem'] === props.title;
    })

    return {
      navigateTo,
      isSelected
    }
  }
})
</script>

<style scoped>
.q-item--active {
  background-color: #e0e0e0;
}

.selected-title {
  color: black;
  font-size: 16px;
}

.selected-caption {
  font-size: 13px;
}
</style>
