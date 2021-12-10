#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Server } from 'socket.io'
import { io as ioClient } from 'socket.io-client'

// Analyse des paramètres
const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    default: '3000',
    description: 'port à utiliser'
  })
  .version('1.0.0')
  .help()
  .argv

// Création de la DB
const db = Object.create(null)
const neighbors = []
const sockets = []

function sync (socket) {
  socket.emit('keys', (error, keys) => {
    if (error) {
      console.error('sync::keys', error)
      return
    }
    console.info('addPeer::keys to', socket.id, '->', keys)
    keys.forEach((key, i) => {
      if (!db[key]) {
        socket.emit('get', key, (error, value) => {
          if (error) {
            console.error('sync::get', error)
            return
          }
          console.info('addPeer::get', key, ' to', socket.id, '->', value)
          db[key] = value
        })
      }
    })
  })
}

// Initialisation d'une socket
function initSocket (socket) {
  socket.on('get', function (field, callback) {
    if (field in db) {
      console.info(`get ${field}: ${db[field]?.value}`)
      callback(undefined, db[field]) // lit et renvoie la valeur associée à la clef.
    } else {
      const error = new Error(`Field ${field} not exists`)
      console.error(error)
      callback(error.message)
    }
  })

  socket.on('set', function (field, value, callback) {
    if (field in db) { // Si la clef est dans la base de donnée
      if (db[field].value === value) {
        callback()
      } else {
        const error = new Error(`set error : Field ${field} exists.`)
        console.info(error)
        callback(error.message)
      }
    } else {
      console.info(`set ${field} : ${value}`)
      db[field] = {
        value,
        date: Date.now() // on sauvegarde la date de création
      }

      sockets.forEach((socket, index) => {
        socket.emit('set', field, value, (ok) => {
          console.info('set to', socket.id, '->', ok)
        })
      })

      callback()
    }
  })

  socket.on('keys', function (callback) {
    console.info('keys')
    callback(undefined, Object.keys(db)) // Object.keys() extrait la liste des clefs d'un object et les renvoie sous forme d'un tableau.
  })

  socket.on('addPeer', function (port, callback) {
    console.info('addPeer', port)
    if (neighbors.includes(port)) {
      const error = new Error('neighbor exists')
      console.warn(error)
      callback(error.message)
    } else {
      neighbors.push(port)

      const neighborSocket = ioClient(`http://localhost:${port}`, {
        path: '/byc'
      })

      neighborSocket.on('connect', () => {
        console.info('addPeer::connect to', port, neighborSocket.id)

        initSocket(neighborSocket)
        sockets.push(neighborSocket)

        neighborSocket.emit('auth', argv.port, () => {
          console.info('addPeer::auth to', port, neighborSocket.id)
          callback()
        })

        sync(socket)
      })
    }
  })

  socket.on('peers', function (callback) {
    console.info('peers')
    callback(undefined, neighbors)
  })

  socket.on('auth', function (port, callback) {
    console.info('auth', port, socket.id)
    if (neighbors.includes(port)) {
      const error = new Error('neighbor exists')
      console.warn(error)
      callback(error.message)
    } else {
      neighbors.push(port)
      sockets.push(socket)

      sync(socket)

      callback()
    }
  })
}

// Création du serveur
const io = new Server(argv.port, {
  path: '/byc',
  serveClient: false
})

console.info(`Serveur lancé sur le port ${argv.port}.`)

// À chaque nouvelle connexion
io.on('connect', (socket) => {
  console.info('Nouvelle connexion')
  initSocket(socket)
})
