import networkTools from '../tools/network.js'
import { execCommande } from '../tools/cli.js'

console.info('Lancement de deux noeuds de a et b')

// Lancement d'une chaine de 26 noeuds
networkTools.runNetwork(networkTools.parseTopology('a-b')).then(() => {
  // Mise en place de deux valeurs diffèrentes à chaque bout
  console.info('Attribution de la valeur Reimert à nom pour a')
  return execCommande(`node ./cli.js --port=${networkTools.network.a.port} --bot=true set nom Reimert`)
}).then(
  networkTools.wait(5000) // On attend 5 secondes. C'est complémentement arbitraire.
).then(() => {
  console.info('Recherche des valeurs de chaque noeuds')
  return Promise.all('ab'.split('').map((node) => {
    return execCommande(`node cli.js --port=${networkTools.network[node].port} --bot=true get nom`).then(({ stdout, stderr }) => {
      return `${node} => ${stdout.substring(0, 7)}`
    })
  })).then((liste) => {
    console.info(liste)
  })
}).then(() => {
  console.info('Ajout de c')
  return networkTools.runNetwork(networkTools.parseTopology('a-c b-c'), 7002)
}).then(() => {
  // Mise en place de deux valeurs diffèrentes à chaque bout
  console.info('Attribution de la valeur Damien à prenom pour a')
  return execCommande(`node ./cli.js --port=${networkTools.network.a.port} --bot=true set prenom Damien`)
}).then(
  networkTools.wait(5000) // On attend 5 secondes. C'est complémentement arbitraire.
).then(() => {
  console.info('Recherche des valeurs de chaque noeuds')
  return Promise.all('abc'.split('').map((node) => {
    return execCommande(`node cli.js --port=${networkTools.network[node].port} --bot=true get nom`).then(({ stdout, stderr }) => {
      return `${node} => ${stdout.substring(0, 7)}`
    })
  })).then((liste) => {
    console.info(liste)
  })
}).then(() => {
  console.info('Recherche des valeurs de chaque noeuds')
  return Promise.all('abc'.split('').map((node) => {
    return execCommande(`node cli.js --port=${networkTools.network[node].port} --bot=true get prenom`).then(({ stdout, stderr }) => {
      return `${node} => ${stdout.substring(0, 6)}`
    })
  })).then((liste) => {
    console.info(liste)
  })
}).then(() => {
  console.info('Arrêtez ce programme pour arrêter l\'ensemble des noeuds lancés ou laissez le tourner pour pouvoir les explorer.')
}).catch((err) => {
  console.error('Oups...', err)
})
