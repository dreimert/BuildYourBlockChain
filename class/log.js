class Log {
  constructor () {
    this.verbose = false
  }

  log (...params) {
    if (this.verbose) {
      console.log(...params)
    }
  }

  info (...params) {
    if (this.verbose) {
      console.info(...params)
    }
  }

  warn (...params) {
    if (this.verbose) {
      console.warn(...params)
    }
  }

  error (...params) {
    console.error(...params)
  }
}

export default new Log()
