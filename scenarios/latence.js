import networkTools from '../tools/network.js'
import { execCommande } from '../tools/cli.js'
import argv from '../tools/params.js'

console.info("Lancement d'un chaine de 26 noeuds de a à z...")

// Lancement d'une chaine de 26 noeuds
networkTools.runNetwork(networkTools.parseTopology('a-b b-c c-d d-e e-f f-g g-h h-i i-j j-k k-l l-m m-n n-o o-p p-q q-r r-s s-t t-u u-v v-w w-x x-y y-z'), 7000, argv.verbose).then(() => {
  // Mise en place de deux valeurs diffèrentes à chaque bout
  console.info('Attribution de la valeur Paris pour a et Tokio pour z.')
  return Promise.all([
    // Initialisation de a avec Paris
    execCommande(`node ./cli.js --port=${networkTools.network.a.port} --bot=true set Ville Paris 10000`),
    // Initialisation de z avec Tokio
    execCommande(`node ./cli.js --port=${networkTools.network.z.port} --bot=true set Ville Tokio 10001`)
  ])
}).then(
  networkTools.wait(5000) // On attend 15 secondes. C'est complémentement arbitraire.
).then(() => {
  console.info('Recherche des valeurs de chaque noeuds')
  return Promise.all('abcdefghijklmnopqrstuvwxyz'.split('').map((node) => {
    return execCommande(`node cli.js --port=${networkTools.network[node].port} --bot=true get Ville`).then(({ stdout, stderr }) => {
      return `${node} => ${stdout.substring(0, 5)}`
    })
  })).then((liste) => {
    console.info(liste)
    console.info('Arrêtez ce programme pour arrêter l\'ensemble des noeuds lancés ou laissez le tourner pour pouvoir les explorer.')
  })
}).catch((err) => {
  console.error('Oups...', err)
})
