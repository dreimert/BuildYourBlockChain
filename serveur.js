#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Server } from 'socket.io'

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
      const error = new Error(`set error : Field ${field} exists.`)
      console.info(error)
      callback(error.message)
    } else {
      console.info(`set ${field} : ${value}`)
      db[field] = {
        value,
        date: Date.now() // on sauvegarde la date de création
      }
      callback()
    }
  })

  socket.on('keys', function (callback) {
    console.info('keys')
    callback(undefined, Object.keys(db)) // Object.keys() extrait la liste des clefs d'un object et les renvoie sous forme d'un tableau.
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
