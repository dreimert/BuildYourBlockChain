#!/usr/bin/env node

import yargs from 'yargs'
import fs from 'fs'
import readline from 'readline'
import { hideBin } from 'yargs/helpers'
import { io } from 'socket.io-client'
import { generateKeyPairSync } from 'crypto'

import Command from './class/Command.js'

yargs(hideBin(process.argv)) // Analyse des paramètres
  .command('create', 'Crée un couple de clés', () => {}, create)
  .command('get <key>', 'Récupère la valeur associé à la clé', () => {}, sendCommand)
  .command('set <key> <value> [timestamp]', 'Place une association clé / valeur', () => {}, sendCommand)
  .command('keys', 'Demande la liste des clés', () => {}, sendCommand)
  .command('peers', 'Demande la liste des pairs du noeud', () => {}, sendCommand)
  .command('addPeer <peerUrl>', 'Ajoute un nouveau noeud voisin', (yargs) => {
    return yargs.option('force', {
      alias: 'f',
      default: false,
      type: 'boolean'
    })
  }, sendCommand)
  .command('mine <state>', 'active ou désactive le minage', (yargs) => {
    yargs.positional('state', {
      choices: ['start', 'stop']
    })
  }, sendCommand)
  .command('last', 'Affiche le dernier block', () => {}, sendCommand)
  .command('blockById <id>', 'Affiche le block d\'id indiquée', () => {}, sendCommand)
  .command('blockByIndex <index>', 'Affiche le block à l\'index indiqué', () => {}, sendCommand)
  .command('identity <name>', 'Envoie une commande identity', () => {}, sendCommand)
  .version('2.0.0')
  .option('url', {
    alias: 'u',
    default: 'http://localhost',
    description: 'Url du serveur à contacter'
  })
  .option('port', {
    alias: 'p',
    default: '3000',
    description: 'port à utiliser'
  })
  .option('wallet', {
    alias: 'w',
    default: 'default',
    description: 'wallet à utiliser'
  })
  .option('bot', {
    alias: 'b',
    default: false,
    description: 'désactive les messages utilisateur'
  })
  .demandCommand(1, 'Vous devez indiquer une commande')
  .help()
  .parse()

function create () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const readWalletName = new Promise((resolve, reject) => {
    rl.question('Nom du wallet ? (default) ', (answer) => {
      const name = answer || 'default'
      console.info('Nom du wallet : ', name)
      resolve(name)
    })
  })

  readWalletName.then((walletName) => {
    const {
      publicKey,
      privateKey
    } = generateKeyPairSync('dsa', {
      modulusLength: 2048,
      divisorLength: 160,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    fs.mkdirSync(`./wallets/${walletName}`, { recursive: true })

    if (fs.existsSync(`./wallets/${walletName}/pub`) || fs.existsSync(`./wallets/${walletName}/priv`)) {
      console.error('Vous avez déjà une clé qui porte ce nom')
      process.exit(1)
    }

    fs.writeFileSync(`./wallets/${walletName}/pub`, publicKey, 'utf8')
    fs.writeFileSync(`./wallets/${walletName}/priv`, privateKey, 'utf8')

    console.info(`Clé générée dans ./wallets/${walletName}/`)
    console.info(publicKey)

    process.exit(0)
  })
}

function buildCommand (argv, info) {
  const publicKey = fs.readFileSync(`./wallets/${argv.wallet}/pub`, 'utf8')
  const privateKey = fs.readFileSync(`./wallets/${argv.wallet}/priv`, 'utf8')

  let params

  if (argv._[0] === 'set') {
    info(`set ${argv.key} =>`)

    params = { key: argv.key, value: argv.value }
  } else if (argv._[0] === 'mine') {
    info(`mine ${argv.state} =>`)

    params = { state: argv.stat }
  } else if (argv._[0] === 'addPeer') {
    info(`addPeer ${argv.peerUrl} =>`)

    if (parseInt(argv.peerUrl)) {
      argv.peerUrl = 'http://localhost:' + parseInt(argv.peerUrl)
    }

    params = { url: argv.peerUrl, force: argv.force }
  } else if (argv._[0] === 'identity') {
    info(`identity ${argv.name} =>`)

    params = { name: argv.name }
  }

  const cmd = new Command(argv._[0], params, publicKey)

  cmd.sign(privateKey)

  return cmd
}

function sendCommand (argv) {
  function info (msg) {
    if (!argv.bot) {
      console.info(msg)
    }
  }

  const socket = io(`${argv.url}:${argv.port}`, {
    path: '/byc',
    timeout: 5000,
    reconnection: false,
    requestTimeout: 5000
  })

  socket.on('error', (error) => {
    console.error('error:', error)
    socket.close()
  })

  socket.on('reconnect', (error) => {
    console.error('reconnect:', error)
    socket.close()
  })

  socket.on('reconnect_attempt', (error) => {
    console.error('reconnect:', error)
    socket.close()
  })

  socket.on('reconnect_error', (error) => {
    console.error('reconnect:', error)
    socket.close()
  })

  socket.on('reconnect_failed', (error) => {
    console.error('reconnect:', error)
    socket.close()
  })

  socket.on('connect_error', (error) => {
    console.error('connect_error:', error)
    socket.close()
  })

  socket.on('disconnect', () => {
    info('Disconnect')
  })

  socket.on('connect', () => {
    info('Connection établie')

    let id

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      new Promise((resolve, reject) => {
        id = setTimeout(() => {
          clearTimeout(id)
          socket.close()
          reject(new Error('Le serveur ne répond pas'))
          info('Le serveur ne répond pas...')
        }, 5000)
      }),
      new Promise((resolve, reject) => {
        function end () {
          clearTimeout(id)
          socket.close()
          resolve()
        }

        let cmd, publicKey, privateKey

        switch (argv._[0]) {
          case 'get':
            info(`Commande get ${argv.key} =>`)

            socket.emit('get', argv.key, (error, res) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info(res)
              }
              end()
            })
            break
          case 'keys':
            info('keys =>')

            socket.emit('keys', (error, keys) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info(keys.join(','))
              }
              end()
            })
            break
          case 'peers':
            info('peers =>')

            socket.emit('peers', (error, peers) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info(peers.join(','))
              }
              end()
            })
            break
          case 'last':
            info('last =>')

            socket.emit('last', (error, block) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info(block)
              }
              end()
            })
            break
          case 'blockById':
            info('blockById argv.id =>')

            socket.emit('blockById', argv.id, (error, block) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info(block)
              }
              end()
            })
            break
          case 'blockByIndex':
            info('blockByIndex argv.index =>')

            socket.emit('blockByIndex', argv.index, (error, block) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info(block)
              }
              end()
            })
            break
          case 'set':
          case 'mine':
          case 'addPeer':
          case 'identity':
            socket.emit('cmd', buildCommand(argv, info), (error) => {
              if (error) {
                console.error('ERROR:', error)
              } else {
                console.info('OK')
              }
              end()
            })
            break
          default:
            console.error('Commande inconnue')
            end()
        }
      })
    ])
  })
}
