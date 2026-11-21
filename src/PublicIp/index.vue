<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const loading = ref(true)
const ip = ref('')
const location = ref([])
const error = ref('')
const copyTip = ref('')
const copyFailed = ref(false)
const fetchedAt = ref('')

function formatTime(date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

// 离开插件后请求可能才返回，此时不再更新界面，也避免意外覆盖剪贴板
let disposed = false

async function load() {
  loading.value = true
  ip.value = ''
  location.value = []
  error.value = ''
  copyTip.value = ''
  copyFailed.value = false
  fetchedAt.value = ''

  try {
    const data = await window.services.getPublicIp()
    if (disposed) return

    ip.value = data.ip
    location.value = data.location
    fetchedAt.value = formatTime(new Date())

    // 按需求：每次查询成功后自动复制 IP
    try {
      window.utools.copyText(data.ip)
      copyTip.value = '已自动复制到剪贴板'
    } catch {
      copyFailed.value = true
      copyTip.value = '自动复制失败，可点击复制按钮手动复制'
    }
  } catch (err) {
    if (disposed) return
    error.value = err && err.message ? err.message : '获取公网 IP 失败'
  } finally {
    if (!disposed) loading.value = false
  }
}

function copyIp() {
  if (!ip.value) return

  try {
    window.utools.copyText(ip.value)
    copyFailed.value = false
    copyTip.value = '已复制到剪贴板'
  } catch {
    copyFailed.value = true
    copyTip.value = '复制失败，请重试'
  }
}

onMounted(load)
onBeforeUnmount(() => {
  disposed = true
})
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="header">
        <span class="title">当前公网 IP</span>
        <span v-if="loading" class="status">查询中…</span>
      </div>

      <div v-if="loading" class="loading">
        <span class="spinner"></span>
        <span>正在获取当前公网 IP</span>
      </div>

      <template v-else-if="error">
        <p class="error">{{ error }}</p>
        <button class="primary" type="button" @click="load">重试</button>
      </template>

      <template v-else>
        <div class="ip-row">
          <button class="ip" type="button" :title="`点击复制 ${ip}`" @click="copyIp">
            {{ ip }}
          </button>
          <button class="copy-button" type="button" title="复制 IP" @click="copyIp">
            <svg class="copy-icon" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
              <path d="M10.5 5.5V4.5A2 2 0 0 0 8.5 2.5H4.5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1" />
            </svg>
            复制
          </button>
        </div>

        <div v-if="location.length" class="location">
          <span v-for="item in location" :key="item" class="tag">{{ item }}</span>
        </div>

        <div class="tip" :class="{ 'tip-error': copyFailed }" aria-live="polite">{{ copyTip }}</div>

        <div v-if="fetchedAt" class="meta">
          <span>查询时间 {{ fetchedAt }}</span>
          <span class="meta-dot">·</span>
          <span>数据来源 myip.ipip.net</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
  color: #1f2329;
}

.card {
  box-sizing: border-box;
  width: 100%;
  max-width: 620px;
  padding: 28px 30px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
}

.status {
  font-size: 13px;
  color: #9ca3af;
}

.loading {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 86px;
  font-size: 14px;
  color: #6b7280;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #dbeafe;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ip-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.ip {
  display: block;
  min-width: 0;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: clamp(26px, 6vw, 44px);
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
  word-break: break-all;
  cursor: pointer;
}

.ip:hover {
  color: #2563eb;
}

.copy-button {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  background: #ffffff;
  color: #4b5563;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.copy-button:hover {
  border-color: #93c5fd;
  background: #f8fafc;
  color: #2563eb;
}

.copy-button:active {
  opacity: 0.7;
}

.copy-icon {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.location {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.tag {
  padding: 4px 12px;
  border-radius: 999px;
  background: #eef2f7;
  font-size: 13px;
  color: #4b5563;
}

.tip {
  margin-top: 18px;
  font-size: 13px;
  color: #059669;
}

.tip-error {
  color: #ef4444;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eef1f5;
  font-size: 12px;
  color: #9ca3af;
}

.meta-dot {
  color: #d1d5db;
}

.error {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.6;
  color: #ef4444;
  word-break: break-all;
}

.primary {
  padding: 9px 20px;
  border: 0;
  border-radius: 6px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.2s;
}

.primary:active {
  opacity: 0.7;
}

@media (prefers-color-scheme: dark) {
  .page {
    background: #17181a;
    color: #f3f4f6;
  }

  .card {
    background: #242528;
    box-shadow: none;
  }

  .title {
    color: #a1a1aa;
  }

  .status,
  .loading {
    color: #8b8b92;
  }

  .spinner {
    border-color: #3f3f46;
    border-top-color: #60a5fa;
  }

  .ip:hover {
    color: #60a5fa;
  }

  .copy-button {
    border-color: #3f3f46;
    background: #2c2d31;
    color: #d4d4d8;
  }

  .copy-button:hover {
    border-color: #3b82f6;
    background: #323338;
    color: #93c5fd;
  }

  .tag {
    background: #323338;
    color: #d4d4d8;
  }

  .tip {
    color: #34d399;
  }

  .meta {
    border-top-color: #323338;
    color: #8b8b92;
  }

  .meta-dot {
    color: #52525b;
  }

  .tip-error,
  .error {
    color: #f87171;
  }
}
</style>
