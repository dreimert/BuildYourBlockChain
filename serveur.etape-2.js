#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Server } from 'socket.io'
import { io as ioClient } from 'socket.io-client'
import crypto from 'crypto'

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

function getHash (data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function setInDb (field, value) {
  console.info('set', field, ':', value.value)
  db[field] = value

  sockets.forEach((socket, index) => {
    socket.emit('set', field, value, (ok) => {
      console.info('set to', socket.id, '->', ok)
    })
  })
}

function set (field, value, callback) {
  if (value === null || typeof value !== 'object') {
    // on modifie la valeur pour en faire un objet
    value = {
      value: value,
      date: Date.now(),
      hash: getHash(value)
    }
  } else if (!value.hash) {
    value.hash = getHash(value.value)
  } else if (value.hash !== getHash(value.value)) {
    const error = new Error('set error : invalid hash.')
    console.error(error)
    callback?.(error.message)
    return
  }

  if (field in db) { // Si la clef est dans la base de donnée
    if (db[field].date > value.date) {
      console.info(`set ${field} : ${value.value} date too old`)
      setInDb(field, value)
      callback?.() // Appel callback uniquement si il existe
    } else if (db[field].date < value.date) {
      const error = new Error(`set error : Field ${field} too recent.`)
      console.error(error)
      callback?.(error.message)
    } else if (db[field].hash > value.hash) {
      console.info(`set ${field} : ${value.value} hash smaller`)
      setInDb(field, value)
      callback?.() // Appel callback uniquement si il existe
    } else if (db[field].hash < value.hash) {
      const error = new Error(`set error : Field ${field} hash too big.`)
      console.error(error)
      callback?.(error.message)
    } else if (db[field].value === value.value) {
      console.info(`ignore set ${field} : ${value.value}`)
      callback?.()
    } else {
      const error = new Error(`set error : Field ${field} exists and value differs.`)
      console.error(error)
      callback?.(error.message)
    }
  } else {
    console.info(`set ${field} : ${value.value}`)
    setInDb(field, value)

    callback?.()
  }
}

function extractHorodatage (db) {
  return Object.keys(db).reduce(function (result, key) {
    result[key] = {
      date: db[key].date,
      hash: db[key].hash
    }
    return result
  }, {})
};

function sync (socket) {
  socket.emit('keysAndTime', (error, keys) => {
    if (error) {
      console.error('sync::keys', error)
      return
    }
    console.info('addPeer::keys to', socket.id, '->', keys)
    for (const key in keys) {
      if (!db[key] || db[key].date > keys[key].date || (db[key].date === keys[key].date && db[key].hash > keys[key].hash)) {
        socket.emit('get', key, (error, value) => {
          if (error) {
            console.error('sync::get', error)
            return
          }
          console.info('addPeer::get', key, ' to', socket.id, '->', value)
          set(key, value)
        })
      }
    }
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

  socket.on('set', set)

  socket.on('keys', function (callback) {
    console.info('keys')
    callback(undefined, Object.keys(db)) // Object.keys() extrait la liste des clefs d'un object et les renvoie sous forme d'un tableau.
  })

  socket.on('keysAndTime', function (callback) {
    console.info('keysAndTime')
    callback(undefined, extractHorodatage(db)) // Object.keys() extrait la liste des clefs d'un object et les renvoie sous forme d'un tableau.
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
