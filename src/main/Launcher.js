import { EventEmitter } from 'node:events'
import { app } from 'electron'
import is from 'electron-is'

import ExceptionHandler from './core/ExceptionHandler'
import logger from './core/Logger'
import Application from './Application'
import {
  splitArgv,
  parseArgvAsUrl,
  parseArgvAsFile
} from './utils'
import { EMPTY_STRING } from '@shared/constants'

const PROTOCOL = 'eva'

export default class Launcher extends EventEmitter {
  constructor () {
    super()

    this.url = EMPTY_STRING
    this.file = EMPTY_STRING

    // ✅ 防丢队列（关键）
    this.pendingUrls = []
    this.pendingFiles = []

    this.makeSingleInstance(() => {
      this.init()
    })
  }

  // =========================
  // 单实例
  // =========================
  makeSingleInstance (callback) {
    if (is.mas()) {
      callback && callback()
      return
    }

    const gotSingleLock = app.requestSingleInstanceLock()

    if (!gotSingleLock) {
      app.quit()
      return
    }

    app.on('second-instance', (event, argv) => {
      if (global.application) {
        global.application.showPage('index')
      }

      // ✅ 统一处理 argv（避免重复调用）
      this.handleAppLaunchArgv(argv)
    })

    callback && callback()
  }

  // =========================
  // 协议注册
  // =========================
  registerProtocol () {
    try {
      if (is.macOS()) {
        const ok = app.setAsDefaultProtocolClient(PROTOCOL)
        logger.info(`[EVA] macOS protocol register: ${ok}`)
      }

      if (is.windows()) {
        const ok = app.setAsDefaultProtocolClient(PROTOCOL, process.execPath)
        logger.info(`[EVA] Windows protocol register: ${ok}`)
      }

      if (is.linux()) {
        logger.info('[EVA] Linux protocol needs manual registration')
      }
    } catch (e) {
      logger.warn('[EVA] protocol register failed:', e)
    }
  }

  // =========================
  // 初始化
  // =========================
  init () {
    this.registerProtocol()

    this.exceptionHandler = new ExceptionHandler()

    this.openedAtLogin = is.macOS()
      ? app.getLoginItemSettings().wasOpenedAtLogin
      : false

    if (process.argv.length > 1) {
      this.handleAppLaunchArgv(process.argv)
    }

    logger.info('[EVA] openedAtLogin:', this.openedAtLogin)

    this.handleAppEvents()
  }

  // =========================
  // App Events
  // =========================
  handleAppEvents () {
    this.handleRendererRemote()
    this.handleOpenUrl()
    this.handleOpenFile()

    this.handelAppReady()
    this.handleAppWillQuit()
  }

  handleRendererRemote () {
    app.on('browser-window-created', (_, window) => {
      require('@electron/remote/main').enable(window.webContents)
    })
  }

  // =========================
  // macOS protocol (eva://)
  // =========================
  handleOpenUrl () {
    if (is.mas() || !is.macOS()) return

    app.on('open-url', (event, url) => {
      event.preventDefault()

      logger.info(`[EVA] open-url: ${url}`)

      this.url = url
      this.sendUrlToApplication()
    })
  }

  handleOpenFile () {
    if (!is.macOS()) return

    app.on('open-file', (event, path) => {
      event.preventDefault()

      logger.info(`[EVA] open-file: ${path}`)

      this.file = path
      this.sendFileToApplication()
    })
  }

  // =========================
  // Windows / Linux argv
  // =========================
  handleAppLaunchArgv (argv) {
    logger.info('[EVA] handleAppLaunchArgv:', argv)

    const { args, extra } = splitArgv(argv)

    if (extra['--opened-at-login'] === '1') {
      this.openedAtLogin = true
    }

    const file = parseArgvAsFile(args)
    if (file) {
      this.file = file
      this.sendFileToApplication()
    }

    const url = parseArgvAsUrl(args)
    if (url) {
      this.url = url
      this.sendUrlToApplication()
    }
  }

  // =========================
  // URL dispatch
  // =========================
  sendUrlToApplication () {
    if (!this.url) return

    if (global.application && global.application.isReady) {
      global.application.handleProtocol(this.url)
    } else {
      this.pendingUrls.push(this.url)
    }

    this.url = EMPTY_STRING
  }

  // =========================
  // File dispatch
  // =========================
  sendFileToApplication () {
    if (!this.file) return

    if (global.application && global.application.isReady) {
      global.application.handleFile(this.file)
    } else {
      this.pendingFiles.push(this.file)
    }

    this.file = EMPTY_STRING
  }

  // =========================
  // App Ready
  // =========================
  handelAppReady () {
    app.on('ready', () => {
      global.application = new Application()

      global.application.start('index', {
        openedAtLogin: this.openedAtLogin
      })

      global.application.on('ready', () => {
        // flush URL
        this.pendingUrls.forEach(url => {
          global.application.handleProtocol(url)
          logger.info('[EVA] protocol received:', url)
        })
        this.pendingUrls = []

        // flush file
        this.pendingFiles.forEach(file => {
          global.application.handleFile(file)
        })
        this.pendingFiles = []
      })
    })

    app.on('activate', () => {
      if (global.application) {
        logger.info('[EVA] activate')
        global.application.showPage('index')
      }
    })
  }

  // =========================
  // Quit
  // =========================
  handleAppWillQuit () {
    app.on('will-quit', () => {
      logger.info('[EVA] will-quit')

      if (global.application) {
        global.application.stop()
      }
    })
  }
}
