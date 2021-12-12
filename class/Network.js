#!/usr/bin/env node

import { Server } from 'socket.io'
import { io as ioClient } from 'socket.io-client'
import EventEmitter from 'events'

import log from './log.js'

export class Network extends EventEmitter {
  constructor (port = 3000, url = 'http://localhost' + port) {
    super()
    this.port = port
    this.url = url
    this.neighbors = []
    this.sockets = []
  }

  run () {
    this.io = new Server(this.port, {
      path: '/byc',
      serveClient: false
    })

    log.info(`Serveur lancé sur le port ${this.port}.`)

    // À chaque nouvelle connexion
    this.io.on('connect', (socket) => {
      log.info('Nouvelle connexion from', socket.request.connection.remoteAddress, '=>', socket.id)

      // Authentification générée par socket.io. Équivalent du auth
      if (socket.handshake.auth.isServer && socket.handshake.auth.url) {
        log.info('Add in neighbors', socket.id)

        if (!this.neighbors.includes(socket.handshake.auth.url)) {
          this.neighbors.push(socket.handshake.auth.url)
        }

        socket.data = {
          url: socket.handshake.auth.url
        }

        this.sockets.push(socket)

        // gestion de la déconnexion
        socket.on('disconnect', () => {
          this.disconnect(socket)
        })
      }

      this.initSocket(socket)
    })
  }

  initSocket (socket) {
    socket.on('peers', (callback) => {
      log.info('peers')
      callback(undefined, this.neighbors)
    })

    socket.onAny((eventName, ...args) => {
      if (['peers'].includes(eventName)) {
        return
      }

      this.emit(eventName, socket, ...args)
    })
  }

  addPeer (url, force, callback) {
    log.info('addPeer', url)
    if (this.neighbors.includes(url) && !force) {
      const error = new Error('neighbor exists')
      log.warn(error)
      callback(error.message)
    } else {
      if (!this.neighbors.includes(url)) {
        this.neighbors.push(url)
      }

      const neighborSocket = ioClient(url, {
        path: '/byc',
        auth: {
          url: this.url, // socket.handshake.auth
          isServer: true
        }
      })

      neighborSocket.on('connect', () => {
        log.info('addPeer::connect to', url, '=>', neighborSocket.id)

        neighborSocket.data = { url }
        this.sockets.push(neighborSocket)

        neighborSocket.on('disconnect', () => {
          this.disconnect(neighborSocket)
        })

        this.initSocket(neighborSocket)

        callback()
      })
    }
  }

  notifyNeighbors (eventName, ...params) {
    this.sockets.forEach((socket) => {
      socket.emit(eventName, ...params, (error) => {
        if (error) {
          log.error(eventName, 'to', socket.id, '->', error)
        } else {
          log.info(eventName, 'to', socket.id, '-> ok')
        }
      })
    })
  }

  disconnect (socket) {
    log.info('disconnect to', socket.id)

    const indexInNeighbors = this.sockets.indexOf(socket.data.url)

    if (indexInNeighbors >= 0) {
      this.sockets.splice(indexInNeighbors, 1)
    }

    const indexInSocket = this.sockets.indexOf(socket)

    if (indexInSocket >= 0) {
      this.sockets.splice(indexInSocket, 1)
    }
  }
}

export default Network
