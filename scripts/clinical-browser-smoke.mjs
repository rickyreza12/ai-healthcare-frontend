import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const output = resolve('..', '..', 'workspaces', 'result')
const hostname = 'http://127.0.0.1:5173'
const basePatient = 'SYN-BUNDA-P0002'
const observed = { errors: [], casBrowserRequests: [], checkpoints: [] }

class ChromePage {
  constructor(socket) {
    this.socket = socket
    this.next = 1
    this.pending = new Map()
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (message.method === 'Runtime.exceptionThrown') {
        observed.errors.push(message.params.exceptionDetails.text)
      }
      if (message.method === 'Network.requestWillBeSent' && /127\.0\.0\.1:8100/.test(message.params.request.url)) {
        observed.casBrowserRequests.push(message.params.request.url)
      }
      if (!message.id) return
      const callback = this.pending.get(message.id)
      if (callback) {
        this.pending.delete(message.id)
        message.error ? callback.reject(new Error(message.error.message)) : callback.resolve(message.result)
      }
    })
  }

  async command(method, params = {}) {
    const id = this.next++
    const response = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
    this.socket.send(JSON.stringify({ id, method, params }))
    return response
  }

  async evaluate(expression) {
    const payload = await this.command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (payload.exceptionDetails) throw new Error(payload.exceptionDetails.text)
    return payload.result.value
  }

  async until(expression, label) {
    for (let attempt = 0; attempt < 45; attempt++) {
      if (await this.evaluate(expression)) { observed.checkpoints.push(label); return }
      await new Promise(r => setTimeout(r, 250))
    }
    throw new Error(`Timeout at ${label}: ${String(await this.evaluate('document.body.innerText.slice(0,420)'))}`)
  }

  async navigate(path) {
    await this.command('Page.navigate', { url: `${hostname}${path}` })
    await this.until('document.readyState === "complete"', `navigation:${path}`)
  }

  async insert(selector, text) {
    await this.evaluate(`document.querySelector(${JSON.stringify(selector)})?.focus()`)
    await this.command('Input.insertText', { text })
  }

  async fill(selector, value) {
    await this.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.focus(); element.select?.(); })()`)
    await this.command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 2 })
    await this.command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 2 })
    await this.insert(selector, value)
  }

  async clickByText(selector, text) {
    const expression = `(() => {const el=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.textContent.trim().includes(${JSON.stringify(text)}));if(!el)return false;el.click();return true})()`
    assert.equal(await this.evaluate(expression), true, `Button missing: ${text}`)
  }

  async screenshot(name) {
    const { data } = await this.command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(resolve(output, name), Buffer.from(data, 'base64'))
  }

  async viewport(width, height, mobile = false) {
    await this.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
    await new Promise(r => setTimeout(r, 250))
    const measurement = await this.evaluate('({inner:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth})')
    assert.ok(measurement.documentWidth <= measurement.inner + 1, `Horizontal overflow: ${JSON.stringify(measurement)}`)
    observed.checkpoints.push(`${width}x${height}:no-overflow`)
  }
}

async function run() {
  await mkdir(output, { recursive: true })
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json()
  const target = tabs.find(tab => tab.type === 'page' && tab.url.includes('127.0.0.1:5173'))
  assert.ok(target, 'Chrome login tab unavailable')
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  const page = new ChromePage(socket)
  try {
    await page.command('Page.enable')
    await page.command('Runtime.enable')
    await page.command('Network.enable')
    await page.navigate('/login')
    await page.until('Boolean(document.querySelector("#email")) || location.pathname.startsWith("/dashboard")', 'login-or-existing-session')
    if (await page.evaluate('Boolean(document.querySelector("#email"))')) {
      await page.insert('#email', 'qa-clinical@bunda.invalid')
      await page.insert('#password', 'SyntheticBundaQA2026')
      await page.evaluate('document.querySelector("form").requestSubmit()')
    }
    await page.until('location.pathname.startsWith("/dashboard")', 'authenticated-navigation')

    await page.navigate(`/dashboard/patients/${basePatient}?tab=ai-summary`)
    await page.until('document.body.innerText.includes("Ingest this CAS patient") || document.body.innerText.includes("Clinical history summary")', 'summary-loaded')
    if (await page.evaluate('document.body.innerText.includes("Ingest this CAS patient")')) {
      await page.clickByText('button', 'Ingest this CAS patient')
    }
    await page.until('document.body.innerText.includes("Clinical history summary")', 'summary-ready')
    await page.until('document.body.innerText.includes("cited source")', 'summary-source-count')
    await page.screenshot('bunda-clinical-summary-desktop.png')

    await page.clickByText('button', 'View source')
    await page.until('Boolean(document.querySelector("dialog[open]"))', 'summary-source-dialog')
    await page.command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await page.command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await page.until('!document.querySelector("dialog[open]")', 'source-dialog-escape')

    await page.clickByText('a.clinical-tab', 'Sources & Evidence')
    await page.until('document.body.innerText.includes("Read source")', 'evidence-tab')
    await page.clickByText('a.clinical-tab', 'Data Quality')
    await page.until('document.body.innerText.includes("Missing and conflicting data")', 'quality-tab')
    await page.clickByText('a.clinical-tab', 'Summary')
    await page.clickByText('button', 'Mark reviewed')
    await page.until('document.body.innerText.includes("Summary marked reviewed")', 'summary-review')
    await page.clickByText('button', 'Refresh summary')
    await page.until('document.body.innerText.includes("Summary refreshed")', 'summary-refresh')

    await page.clickByText('a', 'Ask about this patient')
    await page.until('document.body.innerText.includes("Verified CAS patient")', 'patient-context-verified')
    await page.clickByText('button', 'What diagnoses are recorded?')
    await page.clickByText('button', 'Ask assistant')
    await page.until('document.body.innerText.includes("Answer ready with citations")', 'patient-assistant-response')
    await page.clickByText('button', 'Details')
    await page.until('Boolean(document.querySelector("dialog[open]"))', 'assistant-source-dialog')
    await page.clickByText('button', 'Close')
    await page.clickByText('button', 'General Assistant')
    await page.fill('#clinical-prompt', 'What is the SOAP documentation format?')
    await page.clickByText('button', 'Ask assistant')
    await page.until('document.body.innerText.includes("SOAP stands for Subjective")', 'general-assistant-response')
    await page.fill('#clinical-prompt', 'Show me an unsupported fictitious diagnosis?')
    await page.clickByText('button', 'Ask assistant')
    await page.until('document.body.innerText.includes("Unsupported question")', 'unsupported-prompt')
    await page.screenshot('bunda-healthcare-assistant-desktop.png')

    await page.viewport(390, 844, true)
    await page.screenshot('bunda-healthcare-assistant-mobile.png')
    await page.viewport(720, 900)
    await page.viewport(1440, 900)

    assert.deepEqual(observed.casBrowserRequests, [], 'Browser must not contact CAS on 8100')
    assert.deepEqual(observed.errors, [], 'Uncaught browser errors')
    console.log(JSON.stringify(observed, null, 2))
  } finally {
    socket.close()
  }
}

await run()
