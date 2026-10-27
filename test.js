import tape from 'tape'
import _test from 'tape-promise'

import networkTools from './tools/network.js'
import { execCommande } from './tools/cli.js'

const test = _test.default(tape) // decorate tape

function splitAndSort (peers) {
  return peers.replace('\n', '').split(',').sort()
}

// Si un port est pris, les tests parleraient à d'autres serveurs : on s'arrête là
for (const port of [7350, 7351, 7352, 7353, 7354]) {
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

test('Kill serveurs', function (t) {
  t.deepEqual(networkTools.killall(), [true, true, true, true, true], 'Arrêt des serveurs')
  return Promise.resolve()
})
