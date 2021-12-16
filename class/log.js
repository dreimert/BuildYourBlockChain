class Log {
  constructor () {
    this.verbose = false
    this.debuging = false
  }

  debug (...params) {
    if (this.debuging) {
      console.log(...params)
    }
  }

  // s'affiche toujouts dans la sortie classique
  log (...params) {
    console.log(...params)
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

  // s'affiche toujouts dans la sortie d'erreur
  error (...params) {
    console.error('## ERREUR ##', ...params)
  }
}

export default new Log()
