<script setup>
import { onMounted, ref } from 'vue'
import PublicIp from './PublicIp/index.vue'

// 单功能插件：默认直接渲染，保证首次启动时即使错过进入事件也能正常查询
const route = ref('public-ip')

onMounted(() => {
  window.utools.onPluginEnter(() => {
    route.value = 'public-ip'
  })
  // 退出时卸载页面，下次进入会重新挂载并查询一次
  window.utools.onPluginOut(() => {
    route.value = ''
  })
})
</script>

<template>
  <PublicIp v-if="route === 'public-ip'" />
</template>
