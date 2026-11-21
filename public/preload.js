const https = require('node:https')

const API_URL = 'https://myip.ipip.net/json'
const TIMEOUT = 8000

// 通过 Node 发起请求，绕开插件页面的浏览器跨域限制
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'uTools-PublicIP/1.0'
        },
        timeout: TIMEOUT
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error(`接口返回状态码 ${res.statusCode}`))
          return
        }

        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
          } catch {
            reject(new Error('接口返回内容不是合法 JSON'))
          }
        })
        res.on('error', (err) => reject(new Error(`读取接口响应失败：${err.message}`)))
      }
    )

    req.on('timeout', () => req.destroy(new Error('请求超时')))
    req.on('error', (err) => reject(new Error(`网络请求失败：${err.message}`)))
  })
}

window.services = {
  getPublicIp: async () => {
    // 附加时间戳，避免接口或中间代理返回缓存结果
    const result = await fetchJson(`${API_URL}?t=${Date.now()}`)

    if (!result || result.ret !== 'ok' || !result.data || !result.data.ip) {
      throw new Error('接口未返回有效的公网 IP')
    }

    const location = Array.isArray(result.data.location)
      ? result.data.location
          .filter((item) => typeof item === 'string' && item.trim())
          .map((item) => item.trim())
      : []

    return {
      ip: result.data.ip,
      location
    }
  }
}
