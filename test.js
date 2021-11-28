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
  return networkTools.runNetwork(networkTools.parseTopology('a-b b-c a-c'), 7000, false)
})

test('Vérification des voisins de a', function (t) {
  return execCommande('node ./cli.js --port=7000 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7001,7002\n'), 'deux voisins sur les ports 7001 et 7002')
  })
})

test('Vérification des voisins de b', function (t) {
  return execCommande('node ./cli.js --port=7001 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7002,7000\n'), 'deux voisins sur les ports 7000 et 7002')
  })
})

test('Vérification des voisins de c', function (t) {
  return execCommande('node ./cli.js --port=7002 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7000,7001\n'), 'deux voisins sur les ports 7000 et 7001')
  })
})

test('Réajout à c de b', function (t) {
  return execCommande('node ./cli.js --port=7002 --bot=true addPeer 7001', t).then(({ stdout, stderr }) => {
    t.equal(stderr, 'neighbor exists\n', 'Doit refuser avec une erreur "neighbor exists"')
  })
})

test('Vérification de la propagation de valeur', function (t) {
  return execCommande('node ./cli.js --port=7000 --bot=true set casque quest2 1234567890', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  }).then(() => {
    return execCommande('node ./cli.js --port=7000 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur a')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7001 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur b')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7002 --bot=true get casque', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur c')
    })
  })
})

test('Vérification de la propagation d\'une seconde valeur', function (t) {
  return execCommande('node ./cli.js --port=7000 --bot=true set jeu beatsaber 1234567890', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'OK\n', 'Set doit réussir')
  }).then(() => {
    return execCommande('node ./cli.js --port=7000 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur a')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7001 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur b')
    })
  }).then(() => {
    return execCommande('node ./cli.js --port=7002 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur c')
    })
  })
})

test('Démarrage d\'un quatrième serveur d connecté à a', function (t) {
  return networkTools.runNetwork(networkTools.parseTopology('a-d'), 7003, false)
})

test('Vérification de l\'initialisation', function (t) {
  return execCommande('node ./cli.js --port=7003 --bot=true get casque', t).then(({ stdout, stderr }) => {
    t.equal(stdout, 'quest2\n', 'La valeur doit être correct sur d')
  }).then(() => {
    return execCommande('node ./cli.js --port=7003 --bot=true get jeu', t).then(({ stdout, stderr }) => {
      t.equal(stdout, 'beatsaber\n', 'La valeur doit être correct sur d')
    })
  })
})

test('Vérification des voisins de a', function (t) {
  return execCommande('node ./cli.js --port=7000 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7001,7002,7003\n'), 'trois voisins sur les ports 7001, 7002 et 7003')
  })
})

test('Vérification des voisins de b', function (t) {
  return execCommande('node ./cli.js --port=7001 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7002,7000\n'), 'deux voisins sur les ports 7000 et 7002')
  })
})

test('Vérification des voisins de c', function (t) {
  return execCommande('node ./cli.js --port=7002 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7000,7001\n'), 'deux voisins sur les ports 7000 et 7001')
  })
})

test('Vérification des voisins de c', function (t) {
  return execCommande('node ./cli.js --port=7003 --bot=true peers', t).then(({ stdout, stderr }) => {
    t.deepEqual(splitAndSort(stdout), splitAndSort('7000\n'), 'un voisin sur le port 7000')
  })
})

test('Kill serveurs', function (t) {
  t.deepEqual(networkTools.killall(), [true, true, true, true], 'Arret des serveurs')
  return Promise.resolve()
})
