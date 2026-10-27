import fs from 'fs'
import net from 'net'
import { spawn } from 'child_process'
import { io } from 'socket.io-client'

const promiseTimeout = function (name, ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(`${name}: Timed out in ${ms} ms.`))
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
        console.info(`# On attend ${ms} ms`)
      }
      setTimeout(resolve, ms)
    })
  }
}

export function isPortFree (port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', err => (err.code === 'EADDRINUSE' ? resolve(false) : reject(err)))
      .once('listening', () => tester.once('close', () => resolve(true)).close())
      .listen(port)
  })
}

// Attend qu'un serveur écoute sur le port, pour ne pas lancer les commandes trop tôt
export function waitForPort (port, timeout = 5000) {
  const start = Date.now()

  return new Promise((resolve, reject) => {
    function attempt () {
      const socket = net.connect(port, 'localhost')
        .once('connect', () => {
          socket.end()
          resolve()
        })
        .once('error', () => {
          if (Date.now() - start > timeout) {
            reject(new Error(`Port ${port} toujours fermé après ${timeout} ms`))
          } else {
            setTimeout(attempt, 100)
          }
        })
    }

    attempt()
  })
}

export const network = {}

export async function run (id, port, verbose = true) {
  if (!await isPortFree(port)) {
    throw new Error(`Le port ${port} est déjà utilisé. Avez-vous bien arrêté tous les serveurs en cours d'exécution ?`)
  }

  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs')
  }

  const out = fs.createWriteStream(`./logs/${id}.log`)
  const err = fs.createWriteStream(`./logs/${id}.err`)

  if (verbose) {
    console.info(`# Lancement de ${id} sur le port ${port}`)
  }

  network[id] = {
    process: spawn('node', ['./serveur.js', `--port=${port}`], {
      stdio: ['ignore', 'pipe', 'pipe']
    }),
    port,
    id,
    out,
    err
  }

  network[id].process.stdout.on('data', (data) => {
    if (verbose) {
      data.toString().split('\n').filter(i => i).map((d) => process.stdout.write(`${id} -> ${d}\n`))
    }
    out.write(data)
  })

  network[id].process.stderr.on('data', (data) => {
    if (verbose) {
      data.toString().split('\n').filter(i => i).map((d) => process.stderr.write(`${id} -> ${d}\n`))
    }
    err.write(data)
  })

  const onError = new Promise((resolve, reject) => {
    network[id].process.on('exit', (err) => {
      reject(new Error(`Le noeud ${id} vient de s'arrêter avec le code ${err}`))
    })
  })

  return Promise.race([
    onError,
    waitForPort(port).catch(() => {
      throw new Error(`Le noeud ${id} n'écoute pas sur le port ${port}. Regardez le fichier logs/${id}.err.`)
    })
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

export function runNetwork (topology, port = 7000, verbose = true, timeout = 15000) {
  // run est asynchrone : on calcule la liste des nouveaux noeuds avant de les lancer
  const newIds = [...new Set(topology.flat())].filter((id) => !network[id])
  const newNodes = newIds.map((id) => run(id, port++, verbose))

  return Promise.all(newNodes).then(() => {
    return Promise.all(topology.map((connexion) => {
      return setNeighbor(network[connexion[0]], network[connexion[1]], verbose, timeout)
    }))
  }).then(wait(1000, verbose)).then(network)
}

export function setNeighbor (src, dst, verbose = true, timeout = 5000) {
  if (verbose) {
    console.info(`# Ajout de ${dst.id}:${dst.port} comme voisin de ${src.id}:${src.port}`)
  }

  const socket = io(`http://localhost:${src.port}`, {
    path: '/byc',
    timeout: 1000,
    reconnection: true,
    requestTimeout: 1000
  })

  // On ferme la socket même en cas de timeout, sinon elle empêche le programme de se terminer
  return promiseTimeout(`Ajout de ${dst.id}:${dst.port} comme voisin de ${src.id}:${src.port}`, timeout, new Promise((resolve, reject) => {
    socket.on('connect', () => {
      socket.emit('addPeer', dst.port, (error) => {
        if (error) {
          console.error('#! setNeighbor::addPeer:error:', error)
          reject(error)
        } else {
          resolve()
        }
        socket.close()
      })
    })
  })).finally(() => socket.close())
}

export function auth (target, neighbor, verbose = true, timeout = 5000) {
  if (verbose) {
    console.info(`# Ajout de ${neighbor.id} dans la liste des voisin de ${target.id}`)
  }

  const socket = io(`http://localhost:${target.port}`, {
    path: '/byc',
    timeout: timeout,
    reconnection: false,
    requestTimeout: timeout
  })

  return promiseTimeout('auth', timeout, new Promise((resolve, reject) => {
    socket.on('connect', () => {
      socket.emit('auth', neighbor.port, (error, value) => {
        if (error) {
          console.error('#! auth::auth:error:', error)
          reject(error)
        } else {
          resolve()
        }
        socket.close()
      })
    })
  })).finally(() => socket.close())
}

export function killall () {
  const res = []
  for (const id in network) {
    res.push(network[id].process.kill())
  }
  return res
}

export default {
  network,
  wait,
  isPortFree,
  waitForPort,
  run,
  parseTopology,
  runNetwork,
  setNeighbor,
  auth,
  killall
}
