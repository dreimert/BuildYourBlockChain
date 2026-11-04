# Correction de l'étape 3

Pour commencer, je me place à l'étape 3 : `git checkout etape-3`.

## 1 - Lancement

Je commence par lancer le nœud sans consulter les aides avec la commande `node noeud.js` et j'obtiens le message `## ERREUR ## Le wallet default n'existe pas. Vous devez utiliser le CLI pour le créer`. Oups...

Je consulte l'aide du *CLI* pour savoir quoi faire : `node cli.js`. J'obtiens l'aide suivante :

```
cli.js <commande>

Commandes :
  cli.js create                         Crée un couple de clés (un wallet)
  cli.js get <key>                      Récupère la valeur associé à la clé
  cli.js set <key> <value> [timestamp]  Place une association clé / valeur
  cli.js keys                           Demande la liste des clés
  cli.js identities                     Demande la liste des identités
  cli.js rewards                        Demande la liste des rewards
  cli.js peers                          Demande la liste des pairs du noeud
  cli.js addPeer <portOrPeerUrl>        Ajoute un nouveau noeud voisin. Authenti
                                        fication requise.
  cli.js mine <state>                   active ou désactive le minage. Authentif
                                        ication requise.
  cli.js last                           Affiche le dernier block
  cli.js blockById <id>                 Affiche le block d'id indiquée
  cli.js blockByIndex <index>           Affiche le block à l'index indiqué
  cli.js identity <name>                Envoie une commande identity. Authentifi
                                        cation requise.

Options :
      --version  Affiche le numéro de version                          [booléen]
  -u, --url      Url du serveur à contacter        [défaut : "http://localhost"]
  -p, --port     port à utiliser                               [défaut : "3000"]
  -w, --wallet   wallet à utiliser                          [défaut : "default"]
  -b, --bot      désactive les messages utilisateur             [défaut : false]
      --help     Affiche l'aide                                        [booléen]

Vous devez indiquer une commande
```

Je remarque la première commande qui est *create* qui `Crée un couple de clés (un wallet)`. Le message me disait que le *wallet* *default* n'existait pas. Je lance la commande : `node cli.js create`. La commande me demande le nom du wallet avec entre parenthèses *default*. Je me contente de faire entrée. Si je mets un autre nom, un wallet à ce nom sera créé. Le programme me dit avoir généré une clé dans `./wallets/default/` et affiche ma clé publique. Je peux vérifier le contenu du dossier avec `ls ./wallets/default/`.

Je réessaie de lancer le noeud : `node noeud.js`. Cette fois, il se lance et, au bout de quelques secondes (le temps de calculer la preuve de travail du genesis), affiche : `My node id: 1ystke58miz`.

## 2 - À deux (ou plus), c'est mieux !

On me demande de lancer plusieurs nœuds. J'ai déjà mon noeud précédent qui tourne et j'essaie d'en lancer un nouveau : `node noeud.js`. J'obtiens une erreur :

```
My node id: 26c8vtu2gkr
node:events:491
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1485:16)
    at listenInCluster (node:net:1533:12)
    at Server.listen (node:net:1621:7)
    at Server.attach (/Users/dreimert/test/BuildYourBlockChain/node_modules/socket.io/dist/index.js:204:17)
    at new Server (/Users/dreimert/test/BuildYourBlockChain/node_modules/socket.io/dist/index.js:101:18)
    at Network.run (file:///Users/dreimert/test/BuildYourBlockChain/class/Network.js:20:15)
    at file:///Users/dreimert/test/BuildYourBlockChain/noeud.js:284:9
    at ModuleJob.run (node:internal/modules/esm/module_job:193:25)
    at async Promise.all (index 0)
    at async ESMLoader.import (node:internal/modules/esm/loader:530:24)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1512:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  code: 'EADDRINUSE',
  errno: -48,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

Fort·e de mon expérience des TPs précédents, je comprends que je dois changer le port : `node noeud.js -p 3001`. Et comme pour les TPs précédents, je fais un *addPeer* pour connecter les deux nœuds : `node cli.js addPeer 3001`. La commande semble fonctionner :

```
Connection à http://127.0.0.1:3000
Connection établie
addPeer http://127.0.0.1:3001 =>
OK
Disconnect
```

Mais quand je retourne sur mon noeud, je vois :

```
## ERREUR ## On ne peut pas changer le genesis Block {
  index: 0,
  previous: null,
  transactions: [],
  txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  timestamp: 1793788905613,
  difficulty: 110427941548649020598956093796432407239217743554726184882600387580788735n,
  nonce: 864933,
  id: '00000bbd97b7217d6f31a761189da81b6606501f60cc5f78dcb55eb2c9c30953',
  validaded: true
}
```

Hum. Gênant. Genesis ? *Block* d'index 0 ? Je regarde l'aide du noeud `node noeud.js --help` :

```
Options :
  -p, --port       port à utiliser                             [défaut : "3000"]
  -u, --url        url que le serveur annonce      [défaut : "http://localhost"]
  -w, --wallet     wallet à utiliser pour controler le noeud[défaut : "default"]
  -m, --mine       active le minage                   [booléen] [défaut : false]
  -b, --bootstrap  Initialise le genesis de la blockchain avec ce timestamp
                                                                        [nombre]
      --saveOnSig  Écrit la db sur disque quand un signal SIGINT est reçu
                                                      [booléen] [défaut : false]
      --autoSave   Écrit la blockchain sur disque régulièrement
                                                      [booléen] [défaut : false]
  -v, --verbose    Affiche les logs                   [booléen] [défaut : false]
  -d, --debug      Affiche les logs de debug          [booléen] [défaut : false]
      --version    Affiche le numéro de version                        [booléen]
      --help       Affiche l'aide                                      [booléen]
```

Je vois que la description de l'option *bootstrap* est `Initialise le genesis de la blockchain avec ce timestamp`. Je vois dans l'erreur que l'index du *block* est 0 et un indice me dit d'utiliser `blockByIndex`.

Je regarde le *block* d'index 0 pour mes deux noeuds :

```
> node cli.js blockByIndex 0
Connection à http://127.0.0.1:3000
Connection établie
blockByIndex argv.index =>
{
  index: 0,
  previous: null,
  transactions: [],
  timestamp: 1793788902574,
  difficulty: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 944251,
  id: '00000350a43bd8fd4ec29433c39194fde40178b40e593d6a922dc9a74b666f40'
}
Disconnect
```

```
> node cli.js -p 3001 blockByIndex 0
Connection à http://127.0.0.1:3001
Connection établie
blockByIndex argv.index =>
{
  index: 0,
  previous: null,
  transactions: [],
  timestamp: 1793788905613,
  difficulty: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 864933,
  id: '00000bbd97b7217d6f31a761189da81b6606501f60cc5f78dcb55eb2c9c30953'
}
Disconnect
```

Quand je regarde, je vois que les timestamps, les nonces et les ids sont différents. Vu la description de l'option *bootstrap*, je vais essayer de lancer le second nœud avec le timestamp du premier : `node noeud.js -p 3001 -v -b 1793788902574`. Pas d'erreur. Je vérifie le *block* d'index 0 sur le second noeud :

```
> node cli.js -p 3001 blockByIndex 0
Connection à http://127.0.0.1:3001
Connection établie
blockByIndex argv.index =>
{
  index: 0,
  previous: null,
  transactions: [],
  timestamp: 1793788902574,
  difficulty: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 944251,
  id: '00000350a43bd8fd4ec29433c39194fde40178b40e593d6a922dc9a74b666f40'
}
Disconnect
```

Il est identique au premier ! Et si je *addPeer* `node cli.js addPeer http://127.0.0.1:3001` ? Pas d'erreur !

Bon, maintenant, il faut miner. Je lance le minage sur le second nœud grâce à l'aide : `node noeud.js -p 3001 -v -b 1793788902574 -m`. Il commence à afficher plein de choses :

```
Mode verbeux
My node id: 1dhzs7gdusq
Minage activé
Serveur lancé sur le port 3001.
add block 1 0000015cd471b34bc7a94731f0fb0c72aab38a14da20dca87eba103e47c24381
Search for the hash of block 2
add block 2 000008596ab99f2e8211806e26f6473305590f32826f3bf5de1c4f6e3d910ec5
Search for the hash of block 3
add block 3 000006e43c5dcc4c234bce492347304c6a86f8fd9a1421152af91183e403dcfe
Search for the hash of block 4
...
```

Ça semble fonctionner. Si je vérifie avec un *blockByIndex* :

```
> node cli.js -p 3001 blockByIndex 5
Connection à http://127.0.0.1:3001
Connection établie
blockByIndex argv.index =>
{
  index: 5,
  previous: '00000d0b3c28a80030f1ac39c507669dbdfee4890c99a9405c27e63cf266bd73',
  transactions: [],
  timestamp: 1793789296164,
  difficulty: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 3698566,
  id: '000007b63bf5743995d1abc03e21d6b477026358b7d64bf0aa3d26ccc5763b3a'
}
Disconnect

> node cli.js -p 3000 blockByIndex 5
Connection à http://127.0.0.1:3000
Connection établie
blockByIndex argv.index =>
{
  index: 5,
  previous: '00000d0b3c28a80030f1ac39c507669dbdfee4890c99a9405c27e63cf266bd73',
  transactions: [],
  timestamp: 1793789296164,
  difficulty: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 3698566,
  id: '000007b63bf5743995d1abc03e21d6b477026358b7d64bf0aa3d26ccc5763b3a'
}
Disconnect
```

Les deux nœuds ont le même *block*.

À l'*addPeer*, le nœud demande le dernier *block* de son voisin (`last`), puis télécharge un par un ceux qui lui manquent en remontant les `previous` (`blockById` dans `Blockchain.addBlock`). C'est la même idée que la fonction `sync` de l'étape 1, mais *block* par *block* au lieu de clé par clé.

#### Un nœud qui reçoit un bloc qu'il connaît déjà ne le retransmet pas. Pourquoi est-ce indispensable ? Quel lien avec les étapes 0 et 1 ?

Sans cette règle, un *block* tournerait indéfiniment dans le réseau : A l'envoie à B, B le renvoie à A, qui le renvoie à B... Dès qu'il y a un cycle dans le graphe des voisins, la propagation ne s'arrête jamais. C'est exactement ce qui arrêtait la propagation d'un `set` à l'étape 1 : un nœud ne retransmet que ce qui est nouveau pour lui. Et c'est le `set` de l'étape 0, qui refuse une clé déjà présente, qui nous a donné ce comportement.

#### À l'étape 2, on départageait deux valeurs de même date de façon déterministe. Comment `noeud.js` départage-t-il deux chaînes de même longueur ? Est-ce un problème ?

Dans `Blockchain.addBlock`, un *block* valide qui ne prolonge pas la chaîne n'est adopté que si `block.index > this.last().index`. À longueur égale, le nœud garde donc la chaîne qu'il a reçue **en premier**. Ce n'est pas déterministe : deux nœuds peuvent garder deux chaînes différentes. Ce n'est pas bloquant, car le désaccord disparaît dès que l'une des deux branches reçoit un *block* de plus et devient la plus longue. Mais en attendant, les nœuds ne sont pas d'accord sur l'état de la base. Bitcoin fait de même, c'est pourquoi on attend quelques *blocks* de confirmation avant de considérer une transaction comme acquise.

### 2.1 - Prendre le contrôle

Je fais ce que le sujet demande :

```
> node cli.js -p 3000 mine "<state>"
cli.js mine <state>

active ou désactive le minage. Authentification requise.

Arguments positionnels :
  state                                       [requis] [choix : "start", "stop"]

Options :
      --version  Affiche le numéro de version                          [booléen]
  -u, --url      Url du serveur à contacter        [défaut : "http://localhost"]
  -p, --port     port à utiliser                               [défaut : "3000"]
  -w, --wallet   wallet à utiliser                          [défaut : "default"]
  -b, --bot      désactive les messages utilisateur             [défaut : false]
      --help     Affiche l'aide                                        [booléen]

Valeurs invalides :
  Argument : state, donné : "<state>", choix : "start", "stop"
```

Oups, essayons avec *start* :

```
> node cli.js -u http://127.0.0.1 -p 3001 mine start

Connection à http://127.0.0.1:3001
Connection établie
mine start =>
ERROR: mine error : not implemented
Disconnect
```

Et au niveau du nœud : `cmd::mine { state: 'start' }`. Dans noeud, je cherche `mine error : not implemented` et je trouve la ligne 285. Je sais que l'option mine du noeud fonctionne, je cherche `mine` dans le noeud et trouve plusieurs lignes :
- 32 qui semble déclarer l'option
- 137 qui regarde si `mine` est vrai et active le minage. Je copie / colle ce code dans la commande et supprimer l'erreur :

```Javascript
} else if (cmd.type === 'mine') {
  log.info('cmd::mine', cmd.params)
  mining = true
  log.info('Minage activé')
  miner.findPow(blockchain.buildNextBlock())

  callback()
} else if (cmd.type === 'identity') {
```

Je teste, je relance mes nœuds sans qu'ils minent. Pour éviter de me prendre la tête sur le bootstrap, je le fixe. Et je lance la commande mine :

```
> node noeud.js -b 1793788902574
> node noeud.js -p 3001 -v -b 1793788902574
> node cli.js -u http://127.0.0.1 -p 3001 mine start
```

Le nœud commence à miner. Je l'arrête : `node cli.js -u http://127.0.0.1 -p 3001 mine stop`. Et ... il continue. J'ai oublié de prendre en compte le *stop*. Je modifie le code :

```Javascript
} else if (cmd.type === 'mine') {
  log.info('cmd::mine', cmd.params)

  if (cmd.params.state === 'start') {
    mining = true
    miner.findPow(blockchain.buildNextBlock())
  } else {
    mining = false
  }

  callback()
} else if (cmd.type === 'identity') {
```

Cette fois, tout fonctionne. Après un *stop*, il arrive qu'un dernier *block* soit encore miné : le *worker* termine la preuve de travail en cours. Ce n'est pas gênant.

## 3 - Connectons-nous !

Je dois me synchroniser avec le nœud du prof : https://syd.reimert.fr. Je ne mine pas : le nœud du prof refuserait mes *blocks* sans récompense (section 5). Je fais un addPeer : `node cli.js addPeer https://syd.reimert.fr`.

Si j'ai mis l'option verbose, je vois qu'il se synchronise puis j'ai plein de warning : `## WARN ## fail verification Block {`.

Si je n'ai pas mis l'option verbose, j'obtiens : `## ERREUR ## On ne peut pas changer le genesis Block {`.

J'ai le même problème de genesis. Je récupère le timestamp sur le serveur du prof : `node cli.js -u https://syd.reimert.fr blockByIndex 0`. J'obtiens une erreur : `Error: connect ECONNREFUSED 51.255.201.126:3000`. En indice, je vois que le prof parle de port 443.

```
> node cli.js -u https://syd.reimert.fr -p 443 blockByIndex 0
Connection à https://syd.reimert.fr:443
Connection établie
blockByIndex argv.index =>
{
  index: 0,
  previous: null,
  transactions: [],
  timestamp: 1674199299451,
  difficulty: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 13581,
  id: '00008ef69466f99809dd634d9971a9909f47a2eb8d0754d8b6a76313b66b39f3'
}
Disconnect
```

Je récupère le timestamp (il change à chaque fois que le prof relance son réseau : il faut le relire en début de séance) et redémarre un serveur : `node noeud.js -b 1674199299451 -v`. Puis *addPeer* le serveur du prof : `node cli.js addPeer https://syd.reimert.fr`. Je vois au niveau du serveur, qu'il y a synchronisation et pas d'erreur.

## 4 - Laisser une trace dans ce monde

Je teste directement la commande et j'obtiens une erreur :

```
> node cli.js -u http://127.0.0.1 -p 3000 identity trololo
Connection à http://127.0.0.1:3000
Connection établie
identity trololo =>
ERROR: identity error : not implemented
Disconnect
```

Je cherche dans le noeud et arrive vers la ligne 287 :

```
} else if (cmd.type === 'identity') {
  log.info('cmd::identity', cmd.params)
  const error = new Error('identity error : not implemented')
  callback(error.message)
} else {
```

Je regarde comment fonctionne la commande *set* :

```
} else if (cmd.type === 'set') {
  log.info('cmd::set', cmd.params.key, cmd.params.value)
  const transaction = Transaction.fromCommand(cmd)
  if (blockchain.addTransaction(transaction)) {
    network.notifyNeighbors('transaction', transaction)
    callback()
  } else {
    const error = new Error('cmd error : cette transaction existe déjà')
    log.info(error)
    callback(error.message)
  }
} else if (cmd.type === 'addPeer') {
```

J'imite ou plutôt, je copie / colle pour *identity* :

```
} else if (cmd.type === 'identity') {
  log.info('cmd::identity', cmd.params)
  const transaction = Transaction.fromCommand(cmd)
  if (blockchain.addTransaction(transaction)) {
    network.notifyNeighbors('transaction', transaction)
    callback()
  } else {
    const error = new Error('cmd error : cette transaction existe déjà')
    log.info(error)
    callback(error.message)
  }
} else {
```

Comme le demande le sujet, je teste en local, sur un nœud que je n'ai **pas** relié à celui du prof : `node cli.js identity trololo`. Tout semble fonctionner mais quand je fais `node cli.js identities`, il n'y a rien. Je tourne en rond pendant un moment et je me souviens que le prof a parlé de minage. Je lance le minage : `node cli.js mine start` et je stoppe après quelques blocks : `node cli.js mine stop`. Je réessaie :

```
> node cli.js identities
Connection à http://127.0.0.1:3000
Connection établie
identities =>
[
  {
    name: 'trololo',
    pub: '-----BEGIN PUBLIC KEY-----\n' +
      'MIIDOTCCAi4GByqGSM44BAEwggIhAoIBAQCxMLoWe/B2nxOxPK+f9CnvLrHU9vFi\n' +
      'yckJCoy37Hw+CDU1L4eeZzbg5Ctmu5WObRQv6Z17j40vTpN2gPMxtZD7GqMGQWqp\n' +
      'WojTSqORdMD95uEhrvzweRPmxbDhxdZASoZrCH+Hu7mvRNm6GiadVOgC84lsFRZ8\n' +
      'xHd6uUpZR24kp6JUKJ1rndbYkYCYVLDN/GMHw/d2tTaPdWhI7naHxzvvBMyl8xly\n' +
      'Cf2lFcYLj3V2XwtEdUHGo61tH4jfuZmbCX7eztmrsuoJFVepAcGmo565Zj80O9EX\n' +
      'ME7/nr5wWleMhc1Z0DuE4dN90+h27gmA+sj+zpItAGbFBTShY+E1DtvDAhUAjfaC\n' +
      '/9zNlDGLq7Sb6+Ca2jMj3g0CggEBAIKPJcU1k3BwAZYT5qzdB5KUi0brBl3qB2Sv\n' +
      '40Nu2sbvAhTnt7qAFtW8cEjr18vkGNVV89ZhYIpv7LloMaQyQLqdsf8yAWsRIjbS\n' +
      '0jxDVC4cE0pg559f5oAjWfs0et4ueFdu9gnDdl4SXseAO/NVSNjy5ExgLRvBtmTS\n' +
      'AE/2ZVs9fBQl1Jso8lznxQM4jShMLuPddJxVGwVgSNn+PT9sJbNsl6P6wKZ3VZG8\n' +
      '8X6Wu9/TBe+n43DLbYfWkuog0RPTFr2Y6BYluliIi/fZmGvrF9BC6zfXJfEOWKe1\n' +
      'DJSmPFrPVJf7xy75vs/NlPHSrOYVYeWSJXu2EHs8CmS2tIWy53QDggEDAAKB/35q\n' +
      'EzODdmkAQLYDq+JusJK+x5ouwM9t32a1kt6TEu18ErZD1epIN/mITbmsX+iLfMMT\n' +
      'qxPAgtU4D85ECC/2z8UtRCLgSn43fLSbT/7pN4YAzGB3RLsy/BaE3PPfp3R4sfBO\n' +
      'FPr+BTM1PC82ZalsDOAVsDLyiLs6twCZpd+fCi/mX7qiiHQCH1jVmk3ies3gogj0\n' +
      'EC77t5Is6s+yDQVpUWv4Dk6QhrgaQAZ1wCCSimrzemzmjLYPi/6ZfKrl95pY2h53\n' +
      '+HLCUKRHkeI9SEwyeqPJh5woWVE94g9LYU/2KQbpQ8JODwAN9Q/9718Tv/1h/cUA\n' +
      'JTwo4/hpeaKVJvQlww==\n' +
      '-----END PUBLIC KEY-----\n'
  }
]
Disconnect
```

#### Pour qu'une transaction soit prise en compte, elle doit être ajoutée dans un block de la blockchain. Pour qu'elle soit ajoutée à la blockchain, il faut que le système mine.

Les récompenses de la section 5 iront à la clé publique du *wallet* de mon nœud : j'envoie donc mon *identity* avec ce même *wallet* (celui par défaut ici), avant de miner.

Maintenant que ma transaction *identity* semble fonctionner, je peux essayer en prod :

```
> node noeud.js -b 1674199299451 -v # lancement du serveur avec le timestamp du serveur
> node cli.js addPeer https://syd.reimert.fr # J'ajoute le serveur
> node cli.js identity Trololololo # J'ajoute mon identité
```

Et je vérifie que mon identité est dans la liste : `node cli.js -u http://127.0.0.1 -p 3000 identities`. Mais elle n'y est pas. J'attends et je réessaie :

```
> node cli.js identities
Connection à http://127.0.0.1:3000
Connection établie
identities =>
[
  {
    name: 'Trololololo',
    pub: '-----BEGIN PUBLIC KEY-----\n' +
      'MIIDOTCCAi4GByqGSM44BAEwggIhAoIBAQCxMLoWe/B2nxOxPK+f9CnvLrHU9vFi\n' +
      'yckJCoy37Hw+CDU1L4eeZzbg5Ctmu5WObRQv6Z17j40vTpN2gPMxtZD7GqMGQWqp\n' +
      'WojTSqORdMD95uEhrvzweRPmxbDhxdZASoZrCH+Hu7mvRNm6GiadVOgC84lsFRZ8\n' +
      'xHd6uUpZR24kp6JUKJ1rndbYkYCYVLDN/GMHw/d2tTaPdWhI7naHxzvvBMyl8xly\n' +
      'Cf2lFcYLj3V2XwtEdUHGo61tH4jfuZmbCX7eztmrsuoJFVepAcGmo565Zj80O9EX\n' +
      'ME7/nr5wWleMhc1Z0DuE4dN90+h27gmA+sj+zpItAGbFBTShY+E1DtvDAhUAjfaC\n' +
      '/9zNlDGLq7Sb6+Ca2jMj3g0CggEBAIKPJcU1k3BwAZYT5qzdB5KUi0brBl3qB2Sv\n' +
      '40Nu2sbvAhTnt7qAFtW8cEjr18vkGNVV89ZhYIpv7LloMaQyQLqdsf8yAWsRIjbS\n' +
      '0jxDVC4cE0pg559f5oAjWfs0et4ueFdu9gnDdl4SXseAO/NVSNjy5ExgLRvBtmTS\n' +
      'AE/2ZVs9fBQl1Jso8lznxQM4jShMLuPddJxVGwVgSNn+PT9sJbNsl6P6wKZ3VZG8\n' +
      '8X6Wu9/TBe+n43DLbYfWkuog0RPTFr2Y6BYluliIi/fZmGvrF9BC6zfXJfEOWKe1\n' +
      'DJSmPFrPVJf7xy75vs/NlPHSrOYVYeWSJXu2EHs8CmS2tIWy53QDggEDAAKB/35q\n' +
      'EzODdmkAQLYDq+JusJK+x5ouwM9t32a1kt6TEu18ErZD1epIN/mITbmsX+iLfMMT\n' +
      'qxPAgtU4D85ECC/2z8UtRCLgSn43fLSbT/7pN4YAzGB3RLsy/BaE3PPfp3R4sfBO\n' +
      'FPr+BTM1PC82ZalsDOAVsDLyiLs6twCZpd+fCi/mX7qiiHQCH1jVmk3ies3gogj0\n' +
      'EC77t5Is6s+yDQVpUWv4Dk6QhrgaQAZ1wCCSimrzemzmjLYPi/6ZfKrl95pY2h53\n' +
      '+HLCUKRHkeI9SEwyeqPJh5woWVE94g9LYU/2KQbpQ8JODwAN9Q/9718Tv/1h/cUA\n' +
      'JTwo4/hpeaKVJvQlww==\n' +
      '-----END PUBLIC KEY-----\n'
  }
]
Disconnect
```

Le délai, c'est le temps que le serveur mine un *block* qui intègre la transaction. Dès que le *block* avec la transaction est intégré, c'est bon !

#### Qu'est-ce qui empêche quelqu'un d'inscrire plusieurs identités, ou le nom de quelqu'un d'autre ?

Rien. `Transaction.isValid` vérifie seulement la signature et la forme des paramètres. La signature prouve que la transaction vient bien du détenteur de la clé, pas que le nom lui appartient. Je peux donc envoyer plusieurs *identity* avec la même clé (`Blockchain.integrateTransaction` garde la dernière pour les *rewards*), prendre le nom de quelqu'un d'autre, ou créer autant de *wallets* que je veux. Il faudrait une règle de consensus en plus, par exemple refuser un nom ou une clé déjà inscrits, et même ainsi, rien ne relie une clé à une personne réelle.

## 5 - Contribuer au réseau

Cette fois, le prof me lâche un peu plus. Pour ajouter un block dans la blockchain, il doit avoir un *reward* comme première transaction. Il faut forger notre propre transaction. Il donne ce code là en commentaire :

```Javascript
const tx = new Transaction(...)
// ...
nextBlock.transactions.unshift(tx)
// indice : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
// indice : pour créer une transaction, vous pouvez regarder comment cli.js crée une command
```

Grace à VS Code, je vois que le prototype de *Transaction* est `new Transaction(type: any, params: any, user: any, signature?: string, id?: string): Transaction`. Je vais voir directement le code de *Transaction*, notamment son constructeur :

```Javascript
constructor (type, params, user, signature = '', id = '') {
  this.type = type
  this.params = params
  this.user = user
  this.signature = signature
  this.id = id
}
```

Je vois aussi que type est utilisé dans la fonction *isValid* :

```Javascript
} else if (this.type === 'reward') {
  this.validaded = verify.verify(this.user, this.signature, 'hex') && this.id === this.getHash() && this.params === null
} else {
```

Et je vais voir comment on crée une commande dans le *CLI* :

```Javascript
const cmd = new Command(argv._[0], params, publicKey)

cmd.sign(privateKey)
```

Je dois passer trois paramètres dans le constructeur de Transaction, les deux autres étant optionnels :

- type : grace à la fonction *isValid*, j'en déduit que sa valeur est `'reward'`;
- params : De même pour params, sa valeur doit être `null`;
- user : grâce au *CLI*, je sais qu'il faut mettre la clé publique et j'ai déjà une variable qui contient la clé publique dans `noeud.js`.

Il faut ensuite signer comme dans le *CLI*. Pour ça il faut la clé privée mais je ne l'ai pas. Du coup, je vais copier ce qui est fait pour la clé publique, ce qui donne :

```Javascript
// Clé pour controler le serveur
let publicKey
let privateKey

try {
  publicKey = fs.readFileSync(`./wallets/${argv.wallet}/pub`, 'utf8')
  privateKey = fs.readFileSync(`./wallets/${argv.wallet}/priv`, 'utf8')
} catch (e) {
  if (e.code === 'ENOENT') {
    log.error(`Le wallet ${argv.wallet} n'existe pas. Vous devez utiliser le CLI pour le créer`)
  } else {
    log.error(e)
  }
  process.exit(1)
}
```

Ensuite je forge la transaction. Le sujet me prévient que `// reward here ;)` n'est pas le seul endroit où le nœud lance le minage. Je cherche `miner.findPow` et j'en trouve trois : l'option `--mine` au démarrage, `setBlock` après chaque *block* ajouté, et ma commande *mine* de la section 2.1. Plutôt que de copier trois fois le même code, je crée une fonction qui prépare le *block* et lance le minage :

```Javascript
// Prépare le prochain bloc, avec la récompense en première transaction, et lance le minage
function mineNextBlock () {
  const nextBlock = blockchain.buildNextBlock()

  const tx = new Transaction('reward', null, publicKey)
  tx.sign(privateKey)
  nextBlock.transactions.unshift(tx)

  log.info(`Search for the hash of block ${nextBlock.index}`)

  miner.findPow(nextBlock)
}
```

Je la déclare juste avant le `if (argv.mine)`, puis je remplace les trois appels :

```Javascript
if (argv.mine) {
  mining = true
  log.info('Minage activé')
  mineNextBlock()
}
```

```Javascript
if (await blockchain.addBlock(block, socket)) {
  network.notifyNeighbors('block', block)
  if (mining) {
    mineNextBlock()
  }
}
```

```Javascript
if (cmd.params.state === 'start') {
  mining = true
  mineNextBlock()
} else {
  mining = false
}
```

Le *block* a calculé l'empreinte de ses transactions (`txHash`) dans son constructeur, avant que j'ajoute la récompense. Ça fonctionne quand même : le mineur reconstruit le *block* avec `Block.fromObject` avant de chercher la preuve de travail.

Je teste d'abord en local, puis je relance le tout avec le timestamp du nœud du prof :

```
> node noeud.js -b 1674199299451 -v
> node cli.js addPeer https://syd.reimert.fr
> node cli.js mine start
```

Et je regarde si je réussis à avoir des rewards ;)

```
> node cli.js rewards
Connection à http://127.0.0.1:3000
Connection établie
rewards =>
{ unknown: 88, SYD: 49, Trololo: 118 }
Disconnect
```

Fini !

## 6 - Ajuster la difficulté

Le prof ne s'attend pas à ce que je finisse cette partie mais il faut la comprendre ;)

Si j'en crois l'énoncé, l'objectif est d'avoir un *block* toutes les 10 secondes. Pour ce faire, il y a une mécanique qui tous les 60 *blocks* regarde ce qu'il se passe et qui réajuste la difficulté en fonction. Le prof donne la formule de calcul de la difficulté. Du coup, il faut juste coder un calcul de la moyenne des 60 derniers *blocks* !

C'est quoi la difficulté d'ailleurs ? C'est la valeur maximale que peut prendre l'identifiant d'un *block*. C'est ce qui va faire que notre machine va prendre plus ou moins de temps pour trouver une preuve de travail. C'est basé sur la loi des grands nombres qui dit, en simplifiant, que plus je répète un événement, plus ce qui se passe en réalité est proche de la probabilité.

En très gros et en simplifiant, si je lance un dé équilibré, la probabilité dit que chaque chiffre de 1 à 6 à une chance sur six de sortir. Maintenant, quand je lance 6 fois un dé, j'ai : 3, 5, 4, 1, 4 et 1. Hum. Mais plus je vais lancer ce dé, plus je vais tendre vers les 1 / 6 pour chaque possibilité.

Dans notre preuve de travail, on utilise ce principe pour avoir un *block* toutes les 10 secondes. En effet, plus il va être difficile de trouver une preuve et plus il va falloir faire d'essais. Plus il y aura d'essais et plus la loi des grands nombres sera vérifiée. Il en va de même pour le nombre de participants. Plus il y aura de personnes pour chercher une preuve, plus il faudra qu'elle soit difficile mais plus il y a augmentation du nombre participant et du nombre d'essais, plus elle devient résistante à l' influence extérieur et statistiquement fiable.

Je commence par regarder `Blockchain.js` et je vois :

```Javascript
// Vérification locale
buildNextBlock () {
  const last = this.last()
  return new Block(last.index + 1, last.id, [...this.pendingTransactions], Date.now(), last.difficulty)
}
```

Comme je vais devoir calculer la difficulté dans *buildNextBlock* et *verify*, je crée une fonction pour factoriser le calcul et Copilot me propose :

```Javascript
calculateDifficulty (block) {
  const previous = this.getPreviousAt(block, block.index - 10)
  const time = block.timestamp - previous.timestamp
  const difficulty = previous.difficulty

  if (time > 10 * 60 * 1000) {
    return difficulty - 1
  } else if (time < 10 * 60 * 1000) {
    return difficulty + 1
  } else {
    return difficulty
  }
}
```

Bon, ça n'a vraiment pas l'air de faire ce que je veux. Il n'y a même pas la formule du prof mais la structure de base est pas mal. Je modifie pour mettre la formule du prof et faire que le calcul soit tous les 60 *blocks* et non tous les 10. En réfléchissant, je me rends compte qu'il n'y a pas besoin de tester si je vais plus ou moins vite que la moyenne attendu, il y a juste à faire le calcul.

```Javascript
calculateDifficulty (block) {
  const nbBlock = 60
  const previous = this.getPreviousAt(block, block.index - nbBlock)
  const time = block.timestamp - previous.timestamp
  const moyenne = time / nbBlock
  const nextDifficulty = previous.difficulty * BigInt(Math.floor(moyenne)) / 10000n

  return nextDifficulty
}
```

`getPreviousAt` remonte les `previous` à partir de `block` : ça marche aussi pour un *block* en construction, qui n'est pas encore dans `knownBlocks`, puisque son `previous` (le dernier *block*) y est.

Je modifie *buildNextBlock* pour ajouter la difficulté tous les 60 *blocks* :

```Javascript
buildNextBlock () {
  const last = this.last()

  const block = new Block(last.index + 1, last.id, [...this.pendingTransactions], Date.now(), last.difficulty)

  if (block.index % 60 === 0) {
    block.difficulty = this.calculateDifficulty(block)
  }

  return block
}
```

Il faut aussi que mon nœud vérifie la difficulté des *blocks* qu'il reçoit. Sinon, un mineur malhonnête pourrait garder une difficulté facile et produire des *blocks* bien plus vite que les autres. Je modifie `Block._verify`, dans le `if (this.previous)`, après la vérification du *block* précédent :

```Javascript
_verify (blockchain) {
  // ...

  if (this.previous) {
    // ...

    if (this.index % 60 === 0 && blockchain.calculateDifficulty(this) !== this.difficulty) {
      log.debug('_verify::difficulty:oups', this)
      return false
    } else if (this.index % 60 !== 0 && this.difficulty !== previous.difficulty) {
      log.debug('_verify::difficulty:oups', this)
      return false
    }
  }

  // ...
}
```

J'ai plus qu'à lancer et voir si ça fonctionne !

Pour tester sans attendre 10 minutes, je lance deux nœuds en local avec le même genesis, l'un qui mine et l'autre simplement relié au premier. Au *block* 60, la difficulté change : avec des *blocks* trouvés en 4 secondes environ, la cible passe de `0x0000ffff…` à `0x0000066c…`, soit environ 2,5 fois plus petite, donc plus difficile. Le second nœud accepte le *block* 60 : il a calculé la même difficulté. Le vrai test reste de rester synchronisé avec le nœud du prof.

#### Que se passe-t-il si `nextDifficulty` dépasse `Block.MinimumDifficulty` ?

`Block.isValid` refuse tout *block* dont la difficulté dépasse `Block.MinimumDifficulty`. Si les *blocks* sont trop lents, le *block* 60 (ou 120, 180...) a forcément une difficulté trop grande : **plus personne ne peut produire de *block* valide**, la chaîne est bloquée pour toujours. Avec la difficulté de départ (`0x0000ffff…`) et le minimum (`0x000fffff…`), il suffit d'une moyenne supérieure à 160 secondes par *block*, par exemple si presque tous les mineurs s'arrêtent.

La correction serait de borner le résultat : `nextDifficulty > Block.MinimumDifficulty ? Block.MinimumDifficulty : nextDifficulty`. Mais c'est un changement de règle de consensus : si mon nœud l'applique et pas celui du prof, nous ne serons plus d'accord sur le *block* 60 et la chaîne se séparera en deux.

## Conclusion

#### Citez trois attaques possibles contre ce réseau.

* **L'attaque des 51 %** : quelqu'un qui a plus de puissance de calcul que le reste du réseau produit une chaîne plus longue que celle des autres. Tous les nœuds l'adoptent, et il peut ainsi réécrire l'histoire.
* **L'attaque par l'horloge** : les timestamps sont choisis par le mineur et seulement vérifiés comme croissants. En annonçant des *blocks* très espacés dans le temps, un mineur fait baisser la difficulté à la réévaluation suivante et mine ensuite beaucoup plus vite que les autres.
* **La chaîne la plus longue n'est pas celle qui a demandé le plus de travail** : on compte les *blocks*, pas le travail. Combinée à l'attaque par l'horloge, elle permet de fabriquer une longue chaîne facile à miner qui remplace la vraie.
* **L'usurpation d'identité** : n'importe qui peut inscrire le nom de quelqu'un d'autre, ou autant d'identités qu'il veut (section 4).
* **Le spam** : les transactions sont gratuites. On peut en inonder le réseau pour remplir les *blocks* et ralentir les nœuds.
