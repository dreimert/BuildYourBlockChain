import fs from 'fs'
import { spawn } from 'child_process'
import { io } from 'socket.io-client'

const promiseTimeout = function (ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error('Timed out in ' + ms + 'ms.'))
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

export function wait (ms, verbose = true) {
  return () => {
    return new Promise((resolve) => {
      if (verbose) {
        console.info(`On attend ${ms} ms`)
      }
      setTimeout(resolve, ms)
    })
  }
}

export const network = {}

export function run (id, port, verbose = true) {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs')
  }

  const out = fs.openSync(`./logs/${id}.log`, 'a')
  const err = fs.openSync(`./logs/${id}.err`, 'a')

  if (verbose) {
    console.info(`Lancement de ${id} sur le port ${port}`)
  }

  network[id] = {
    process: spawn('node', ['./serveur.js', `--port=${port}`], {
      stdio: ['ignore', out, err]
    }),
    port,
    id
  }

  const onError = new Promise((resolve, reject) => {
    network[id].process.on('exit', (err) => {
      reject(new Error(`Le noeud ${id} vient de s'arrêter avec le code ${err}`))
    })
  })

  return Promise.race([
    onError,
    wait(1000, false)()
  ])
}

export function parseTopology (topology) {
  return topology.split(/[ ,\n]+/g).filter(i => i).map((connexion) => {
    if (connexion.match(/^\w+-\w+$/)) {
      return connexion.split('-')
    } else {
      throw new Error(`Syntax error: ${connexion}`)
    }
  })
}

export function runNetwork (topology, port = 7000, verbose = true, timeout = 5000) {
  const newNodes = []

  topology.forEach((connexion) => {
    if (!network[connexion[0]]) {
      newNodes.push(run(connexion[0], port++, verbose))
    }

    if (!network[connexion[1]]) {
      newNodes.push(run(connexion[1], port++, verbose))
    }
  })

  return Promise.all(newNodes).then(() => {
    return Promise.all(topology.map((connexion) => {
      return setNeighbor(network[connexion[0]], network[connexion[1]], verbose, timeout)
    }))
  }).then(wait(1000, verbose)).then(network)
}

export function setNeighbor (src, dst, verbose = true, timeout = 5000) {
  if (verbose) {
    console.info(`Ajout de ${dst.id}:${dst.port} comme voisin de ${src.id}:${src.port}`)
  }

  return promiseTimeout(timeout, new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${src.port}`, {
      path: '/byc',
      timeout: timeout,
      reconnection: false,
      requestTimeout: timeout
    })

    socket.on('connect', () => {
      socket.emit('addPeer', dst.port, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
        socket.close()
      })
    })
  }))
}

export function auth (target, neighbor, verbose = true, timeout = 5000) {
  if (verbose) {
    console.info(`Ajout de ${neighbor.id} dans la liste des voisin de ${target.id}`)
  }

  const socket = io(`http://localhost:${target.port}`, {
    path: '/byc',
    timeout: timeout,
    reconnection: false,
    requestTimeout: timeout
  })

  return promiseTimeout(timeout, new Promise((resolve, reject) => {
    socket.on('connect', () => {
      socket.emit('auth', neighbor.port, (error, value) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
        socket.close()
      })
    })
  }))
}

export function killall () {
  const res = []
  for (const id in network) {
    res.push(network[id].process.kill())
  }
  return res
}

export default {
  wait,
  run,
  parseTopology,
  runNetwork,
  setNeighbor,
  auth,
  killall
}
