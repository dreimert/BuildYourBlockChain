import tape from 'tape'
import _test from 'tape-promise'
import net from 'net'
import fs from 'fs'

import { exec, spawn } from 'child_process'

const test = _test.default(tape) // decorate tape

function execCommande (cmd, t) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        t.error(error)
        t.end()
        return reject(error)
      }
      return resolve({ stdout, stderr })
    })
  })
}

function isPortFree (port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', err => (err.code === 'EADDRINUSE' ? resolve(false) : reject(err)))
      .once('listening', () => tester.once('close', () => resolve(true)).close())
      .listen(port)
  })
}

// Attend que le serveur écoute sur le port, pour ne pas lancer les commandes trop tôt
function waitForPort (port, timeout = 5000) {
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

// Si le port est pris, les tests parleraient à un autre serveur : on s'arrête là
if (!await isPortFree(3000)) {
  console.error("Le port 3000 est déjà utilisé. Avez-vous bien arrêté tous les serveurs en cours d'exécution ?")
  process.exit(1)
}

test('Vérification de la version de node', function (t) {
  return execCommande('node --version', t).then(({ stdout, stderr }) => {
    t.ok(parseInt(stdout.split('.')[0].split('v')[1]) >= 24, 'Version de node supérieure ou égale à 24')
  })
})

test('Vérification de la version', function (t) {
  return execCommande('node ./serveur.js --version', t).then(({ stdout, stderr }) => {
    t.equal(stdout, '1.0.0\n', 'Numéro de version')
  })
})

let serveur

test('Démarrage du serveur sur le port 3000', function (t) {
  const out = fs.openSync('./serveur.log', 'w')
  const err = fs.openSync('./serveur.err', 'w')

  serveur = spawn('node', ['./serveur.js', '--port=3000'], {
    stdio: ['ignore', out, err]
  })

  return waitForPort(3000).then(() => {
    t.pass('Serveur démarré')
  }, () => {
    t.fail('Le serveur ne démarre pas. Regardez le fichier serveur.err.')
    serveur.kill()
    process.exit(1)
  })
})

test('Affectation de la valeur "Reimert" à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set name Reimert', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set réussi')
  })
})

test('Récupération de la valeur associée à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get name', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Reimert\n', 'Valeur correcte')
  })
})

test('Récupération de la valeur associée à la clef "jeNeSuisPasDef"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get jeNeSuisPasDef', t).then(({ stdout, stderr }) => {
    t.equal(stderr, 'ERROR: Field jeNeSuisPasDef not exists\n', 'Retourne une erreur')
  })
})

test('Affectation de la valeur "Frenot" à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set name Frenot', t).then(({ stdout, stderr }) => {
    t.equal(stderr, 'ERROR: set error : Field name exists.\n', 'Set doit échouer car la valeur change')
  })
})

test('Récupération de la valeur associée à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get name', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Reimert\n', 'Valeur correcte')
  })
})

test('Réaffectation de la valeur "Reimert" à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set name Reimert', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir car la valeur ne change pas. Cf. protocole.')
  })
})

test('Récupération de la valeur associée à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get name', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Reimert\n', 'Valeur correcte')
  })
})

test('Récupération de la liste des clefs', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true keys', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'name\n', 'Valeur correcte')
  })
})

test('Affectation de la valeur "Frenot" à la clef "directeur"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set directeur Frenot', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  })
})

test('Récupération de la valeur associée à la clef "directeur"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get directeur', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Frenot\n', 'Valeur correcte')
  })
})

test('Récupération de la liste des clefs', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true keys', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'name,directeur\n', 'Valeur correcte')
  })
})

test('Kill serveur', function (t) {
  t.ok(serveur.kill(), 'Arret du serveur')
  t.end()
})
