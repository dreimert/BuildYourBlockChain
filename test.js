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
        if (error.code === 126) {
          t.comment('Avez-vous fait un `chmod +x serveur.js` ?')
        }
        t.end()
        return reject(error)
      }
      return resolve({ stdout, stderr })
    })
  })
}

test('Vérification de la version de node', function (t) {
  return execCommande('node --version', t).then(({ stdout, stderr }) => {
    t.ok(parseInt(stdout.split('.')[0].split('v')[1]) >= 16, 'Version de node supérieure ou equal à 16')
  })
})

test('Vérification de la version', function (t) {
  return execCommande('node ./serveur.js --version', t).then(({ stdout, stderr }) => {
    t.equal(stdout, '1.0.0\n', 'Numéro de version')
  })
})

function isPortTaken (port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', err => (err.code === 'EADDRINUSE' ? resolve(false) : reject(err)))
      .once('listening', () => tester.once('close', () => resolve(true)).close())
      .listen(port)
  })
}

let serveur

test('Démarrage du serveur sur le port 3000', function (t) {
  return isPortTaken(3000).then((ok) => {
    t.ok(ok, 'Port disponible')
    if (!ok) {
      t.comment("Avez-vous bien arrêté tous les serveurs en cours d'exécution ?")
    }
  }).then(() => {
    const out = fs.openSync('./serveur.log', 'a')
    const err = fs.openSync('./serveur.err', 'a')

    serveur = spawn('node', ['./serveur.js', '--port=3000'], {
      stdio: ['ignore', out, err]
    })
  })
})

test('Affectation de la valeur "Reimert" à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set name Reimert', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set réussi')
  })
})

test('Récupération de la valeur associé à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get name', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Reimert\n', 'Valeur correct')
  })
})

test('Récupération de la valeur associé à la clef "jeNeSuisPasDef"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get jeNeSuisPasDef', t).then(({ stdout, stderr }) => {
    t.equal(stderr, 'ERROR: Field jeNeSuisPasDef not exists\n', 'Retour une erreur')
  })
})

test('Affectation de la valeur "Frenot" à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set name Frenot', t).then(({ stdout, stderr }) => {
    t.equal(stderr, 'ERROR: set error : Field name exists.\n', 'Set doit échouer car la valeur change')
  })
})

test('Récupération de la valeur associé à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get name', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Reimert\n', 'Valeur correct')
  })
})

test('Réaffectation de la valeur "Reimert" à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set name Reimert', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir car la valeur ne change pas. Cf. protocole.')
  })
})

test('Récupération de la valeur associé à la clef "name"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get name', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Reimert\n', 'Valeur correct')
  })
})

test('Récupération de la list des clefs', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true keys', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'name\n', 'Valeur correct')
  })
})

test('Affectation de la valeur "Frenot" à la clef "directeur"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true set directeur Frenot', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  })
})

test('Récupération de la valeur associé à la clef "directeur"', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true get directeur', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'Frenot\n', 'Valeur correct')
  })
})

test('Récupération de la list des clefs', function (t) {
  return execCommande('node ./cli.js --port=3000 --bot=true keys', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'name,directeur\n', 'Valeur correct')
  })
})

test('Kill serveur', function (t) {
  t.ok(serveur.kill(), 'Arret du serveur')
  t.end()
})
