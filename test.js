import tape from 'tape'
import _test from 'tape-promise'

import networkTools from './tools/network.js'
import { execCommande } from './tools/cli.js'

const test = _test.default(tape) // decorate tape

function splitAndSort (peers) {
  return peers.replace('\n', '').split(',').sort()
}

test('Vérification de la version', function (t) {
  return execCommande('node ./serveur.js --version', t).then(({ stdout, stderr }) => {
    t.equal(stdout, '1.0.0\n', 'Numero de version')
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
      t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur a')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7351 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur b')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7352 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur c')
    })
  })
})

test('Vérification de la propagation d\'une seconde valeur', function (t) {
  return execCommande('node ./cli.js --port=7350 --bot=true set jeu beatsaber 1234567890', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  }).then(() => {
    return execCommande('node ./cli.js --port=7350 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur a')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7351 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur b')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7352 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur c')
    })
  })
})

test('Démarrage d\'un quatrième serveur d connecté à a', function (t) {
  return networkTools.runNetwork(networkTools.parseTopology('a-d'), 7353, false)
})

test('Vérification de l\'initialisation', function (t) {
  return execCommande('node ./cli.js --port=7353 --bot=true get casque', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur d')
  }).then(() => {
    return execCommande('node ./cli.js --port=7353 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur d')
    })
  })
})

test('Vérification des voisins de a', function (t) {
  return execCommande('node ./cli.js --port=7350 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7351,7352,7353\n'), 'trois voisins sur les ports 7351, 7352 et 7353')
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

test('Vérification des voisins de c', function (t) {
  return execCommande('node ./cli.js --port=7353 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7350\n'), 'un voisin sur le port 7350')
  })
})

test('Kill serveurs', function (t) {
  t.deepEqual(networkTools.killall(), [true, true, true, true], 'Arret des serveurs')
  return Promise.resolve()
})
