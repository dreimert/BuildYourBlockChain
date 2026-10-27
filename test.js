import tape from 'tape'
import _test from 'tape-promise'
import crypto from 'crypto'
import { io } from 'socket.io-client'

import networkTools from './tools/network.js'
import { execCommande } from './tools/cli.js'

const test = _test.default(tape) // decorate tape

function splitAndSort (peers) {
  return peers.replace('\n', '').split(',').sort()
}

function getHash (data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}

// Envoie une commande directement au noeud, pour lire une réponse structurée
function emit (port, ...args) {
  return new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${port}`, { path: '/byc', reconnection: false })
    const timeout = setTimeout(() => {
      socket.close()
      reject(new Error(`Le noeud ${port} ne répond pas à ${args[0]}`))
    }, 5000)

    socket.on('connect_error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    socket.emit(...args, (error, result) => {
      clearTimeout(timeout)
      socket.close()
      return error ? reject(new Error(error)) : resolve(result)
    })
  })
}

function getOn (port, key) {
  return execCommande(`node ./cli.js --port=${port} --bot=true get ${key}`).then(({ stdout }) => stdout)
}

// Si un port est pris, les tests parleraient à d'autres serveurs : on s'arrête là
for (const port of [7350, 7351, 7352, 7353, 7354, 7355, 7356]) {
  if (!await networkTools.isPortFree(port)) {
    console.error(`Le port ${port} est déjà utilisé. Avez-vous bien arrêté tous les serveurs en cours d'exécution ?`)
    process.exit(1)
  }
}

test('Vérification de la version', function (t) {
  return execCommande('node ./serveur.js --version', t).then(({ stdout, stderr }) => {
    t.equal(stdout, '1.0.0\n', 'Numéro de version')
  })
})

test('Démarrage de trois serveurs a, b et c', function (t) {
  return networkTools.runNetwork(networkTools.parseTopology('a-b b-c a-c'), 7350, false)
})

test('Vérification des voisins de a', function (t) {
  return execCommande('node ./cli.js --port=7350 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7351,7352\n'), 'deux voisins sur les ports 7351 et 7352')
  })
})

test('Vérification des voisins de b', function (t) {
  return execCommande('node ./cli.js --port=7351 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7352,7350\n'), 'deux voisins sur les ports 7350 et 7352')
  })
})

test('Vérification des voisins de c', function (t) {
  return execCommande('node ./cli.js --port=7352 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7350,7351\n'), 'deux voisins sur les ports 7350 et 7351')
  })
})

test('Réajout à c de b', function (t) {
  return execCommande('node ./cli.js --port=7352 --bot=true addPeer 7351', t).then(({ stdout, stderr }) => {
    t.equal(stderr, 'ERROR: neighbor exists\n', 'Doit refuser avec une erreur "neighbor exists"')
  })
})

test('Vérification de la propagation de valeur', function (t) {
  return execCommande('node ./cli.js --port=7350 --bot=true set casque quest2 1234567890', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  }).then(() => {
    return execCommande('node ./cli.js --port=7350 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correcte sur a')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7351 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correcte sur b')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7352 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correcte sur c')
    })
  })
})

test('Vérification de la propagation d\'une seconde valeur', function (t) {
  return execCommande('node ./cli.js --port=7350 --bot=true set jeu beatsaber 1234567890', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  }).then(() => {
    return execCommande('node ./cli.js --port=7350 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correcte sur a')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7351 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correcte sur b')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7352 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correcte sur c')
    })
  })
})

test('Démarrage d\'un quatrième serveur d connecté à a', function (t) {
  return networkTools.runNetwork(networkTools.parseTopology('a-d'), 7353, false)
})

test('Vérification de l\'initialisation', function (t) {
  return execCommande('node ./cli.js --port=7353 --bot=true get casque', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'quest2\n', 'La valeur doit être correcte sur d')
  }).then(() => {
    return execCommande('node ./cli.js --port=7353 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correcte sur d')
    })
  })
})

// Cette fois, c'est le nouveau noeud qui fait addPeer : il doit se synchroniser lui-même
test('Démarrage d\'un cinquième serveur e qui ajoute a comme voisin', function (t) {
  return networkTools.runNetwork(networkTools.parseTopology('e-a'), 7354, false)
})

test('Vérification de l\'initialisation par addPeer', function (t) {
  return execCommande('node ./cli.js --port=7354 --bot=true get casque', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'quest2\n', 'La valeur doit être correcte sur e')
  }).then(() => {
    return execCommande('node ./cli.js --port=7354 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correcte sur e')
    })
  })
})

test('Vérification des voisins de a', function (t) {
  return execCommande('node ./cli.js --port=7350 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7351,7352,7353,7354\n'), 'quatre voisins sur les ports 7351, 7352, 7353 et 7354')
  })
})

test('Vérification des voisins de b', function (t) {
  return execCommande('node ./cli.js --port=7351 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7352,7350\n'), 'deux voisins sur les ports 7350 et 7352')
  })
})

test('Vérification des voisins de c', function (t) {
  return execCommande('node ./cli.js --port=7352 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7350,7351\n'), 'deux voisins sur les ports 7350 et 7351')
  })
})

test('Vérification des voisins de d', function (t) {
  return execCommande('node ./cli.js --port=7353 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7350\n'), 'un voisin sur le port 7350')
  })
})

test('Vérification des voisins de e', function (t) {
  return execCommande('node ./cli.js --port=7354 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7350\n'), 'un voisin sur le port 7350')
  })
})

// # Consensus : la valeur la plus vieille gagne

test('Une valeur plus vieille remplace la valeur existante', function (t) {
  return execCommande('node ./cli.js --port=7351 --bot=true set casque quest3 1000', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir car la date est plus ancienne')
  }).then(networkTools.wait(500, false)).then(() => {
    return Promise.all([7350, 7351, 7352, 7353, 7354].map((port) => getOn(port, 'casque')))
  }).then((values) => {
    t.deepEqual(values, Array(5).fill('quest3\n'), 'La valeur la plus vieille doit être propagée à tous les noeuds')
  })
})

test('Une valeur plus récente est refusée', function (t) {
  return execCommande('node ./cli.js --port=7352 --bot=true set casque quest1 2000000000', t).then(({ stdout, stderr }) => {
    t.ok(stderr.startsWith('ERROR:'), 'Set doit échouer car la date est plus récente')
  }).then(networkTools.wait(500, false)).then(() => {
    return Promise.all([7350, 7352].map((port) => getOn(port, 'casque')))
  }).then((values) => {
    t.deepEqual(values, ['quest3\n', 'quest3\n'], 'La valeur ne doit pas changer')
  })
})

test('keysAndTime retourne la date et l\'empreinte de chaque clé', function (t) {
  return emit(7350, 'keysAndTime').then((keys) => {
    t.deepEqual(keys, {
      casque: { date: 1000, hash: getHash('quest3') },
      jeu: { date: 1234567890, hash: getHash('beatsaber') }
    }, 'Dictionnaire des clés avec date et hash (empreinte du champ value)')
  })
})

test('À date égale, la valeur de plus petite empreinte gagne', function (t) {
  // La valeur de plus grande empreinte arrive en premier : « le premier arrivé gagne » ne suffit pas
  const [bigger, smaller] = ['Paris', 'Tokyo'].sort((x, y) => getHash(x) < getHash(y) ? 1 : -1)
  const expected = `${smaller}\n`

  return execCommande(`node ./cli.js --port=7350 --bot=true set Ville ${bigger} 5000`, t)
    .then(networkTools.wait(500, false))
    .then(() => execCommande(`node ./cli.js --port=7352 --bot=true set Ville ${smaller} 5000`, t))
    .then(networkTools.wait(500, false))
    .then(() => Promise.all([7350, 7351, 7352, 7353, 7354].map((port) => getOn(port, 'Ville'))))
    .then((values) => {
      t.deepEqual(values, Array(5).fill(expected), `Tous les noeuds doivent garder ${expected.trim()}`)
    })
})

// # Résistance aux pannes : deux noeuds qui ont divergé se réparent à la connexion

test('Démarrage de deux serveurs f et g non connectés', function (t) {
  return Promise.all([networkTools.run('f', 7355, false), networkTools.run('g', 7356, false)])
})

test('Valeurs différentes sur f et g', function (t) {
  return execCommande('node ./cli.js --port=7355 --bot=true set Pays France 100', t)
    .then(() => execCommande('node ./cli.js --port=7356 --bot=true set Pays Japon 200', t))
    .then(() => Promise.all([getOn(7355, 'Pays'), getOn(7356, 'Pays')]))
    .then((values) => {
      t.deepEqual(values, ['France\n', 'Japon\n'], 'f et g ont chacun leur valeur')
    })
})

test('La connexion de f et g corrige la désynchronisation', function (t) {
  return networkTools.runNetwork(networkTools.parseTopology('f-g'), 7355, false)
    .then(networkTools.wait(500, false))
    .then(() => Promise.all([getOn(7355, 'Pays'), getOn(7356, 'Pays')]))
    .then((values) => {
      t.deepEqual(values, ['France\n', 'France\n'], 'g doit adopter la valeur la plus vieille de f')
    })
})

test('Kill serveurs', function (t) {
  t.deepEqual(networkTools.killall(), [true, true, true, true, true, true, true], 'Arrêt des serveurs')
  return Promise.resolve()
})
