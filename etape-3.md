# Correction de l'étape 3

Pour commencer, je me place à l'étape 3 : `git co etape-3`.

## 1 - Lancement

Je commence par lancer le nœud sans consulter les aides avec la commande `node noeud.js` et j'obtiens le message `## ERREUR ## Le wallet défaut n'existe pas. Vous devez utiliser le CLI pour le créer`. Oups...

Je consulte l'aide du *CLI* pour savoir quoi faire : `node cli.js`. J'obtiens l'aide suivante :

```
cli.js <commande>

Commandes :
  cli.js create                         Crée un couple de clés (un wallet)
  cli.js get <key>                      Récupère la valeur associé à la clé
  cli.js set <key> <value> [timestamp]  Place une association clé / valeur
  cli.js keys                           Demande la liste des clés
  cli.js identities                     Demande la liste des identitées
  cli.js rewards                        Demande la liste des rewards
  cli.js peers                          Demande la liste des pairs du noeud
  cli.js addPeer <portOrPeerUrl>        Ajoute un nouveau noeud voisin
  cli.js mine <state>                   active ou désactive le minage
  cli.js last                           Affiche le dernier block
  cli.js blockById <id>                 Affiche le block d'id indiquée
  cli.js blockByIndex <index>           Affiche le block à l'index indiqué
  cli.js identity <name>                Envoie une commande identity

Options :
      --version  Affiche le numéro de version                          [booléen]
  -u, --url      Url du serveur à contacter        [défaut : "http://localhost"]
  -p, --port     port à utiliser                               [défaut : "3000"]
  -w, --wallet   wallet à utiliser                          [défaut : "default"]
  -b, --bot      désactive les messages utilisateur             [défaut : false]
      --help     Affiche l'aide                                        [booléen]

Vous devez indiquer une commande
```

Je remarque la première commande qui est *create* qui `Crée un couple de clés (un wallet)`. Le message me disait que le *wallet* *default* n'existait pas. Je lance la commande : `node cli.js create`. La commande me demande le nom du wallet avec entre parenthèses *default*. Je me contente de faire entrée. Si je mets un autre nom, un wallet à ce nom sera créé. Le programme me dit avoir généré une clé dans `./wallets/default/` et affiche ma clé publique. Je peux vérifier le contenu du dossier avec `ls ./wallets/default/`.

Je réessaie de lancer le noeud : `node noeud.js`. Cette fois, il se lance et affiche : `My node id: 1ystke58miz`.

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
  timestamp: 1674204695199,
  difficulty: 1766847064778384329583297500742918515827483896875618958121606201292619775n,
  nonce: 15154,
  id: '0000c4c433852f29ccd56f466e436b222251e8d96c2db455b5b77cb31918e5a3',
  validaded: true
}
```

Hum. Gênant. Genesis ? *Block* d'index 0 ? Je regarde l'aide du noeud `node noeud.js --help` :

```
Options :
  -p, --port       port à utiliser                             [défaut : "3000"]
  -u, --url        url que le serveur annonce      [défaut : "http://localhost"]
  -w, --wallet     wallet à utiliser pour controler le noeud[défaut : "default"]
  -m, --mine       active le minage                   [booléen] [défaut : false]
  -b, --bootstrap  Initialise le genesis de la blockchain avec ce timestamp
                                                                        [nombre]
      --saveOnSig  Écrit la db sur disque quand un signal SIGINT est reçu
                                                      [booléen] [défaut : false]
      --autoSave   Écrit la blockchain sur disque régulièrement
                                                      [booléen] [défaut : false]
  -v, --verbose    Affiche les logs                   [booléen] [défaut : false]
  -d, --debug      Affiche les logs de debug          [booléen] [défaut : false]
      --version    Affiche le numéro de version                        [booléen]
      --help       Affiche l'aide                                      [booléen]
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
  timestamp: 1674206211864,
  difficulty: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 5830,
  id: '0000efd91578eb486e5d009739294a335e0dbf33c1c6e5244680f51da2f97378'
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
  timestamp: 1674204695199,
  difficulty: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 15154,
  id: '0000c4c433852f29ccd56f466e436b222251e8d96c2db455b5b77cb31918e5a3'
}
Disconnect
```

Quand je regarde, je vois que les timestamps, les nonces et les ids sont différents. Vu la description de l'option *bootstrap*, je vais essayer de lancer le second nœud avec le timestamp du premier : `node noeud.js -p 3001 -v -b 1674206211864`. Pas d'erreur. Je vérifie le *block* d'index 0 sur le second noeud :

```
> node cli.js -p 3001 blockByIndex 0
Connection à http://127.0.0.1:3001
Connection établie
blockByIndex argv.index =>
{
  index: 0,
  previous: null,
  transactions: [],
  timestamp: 1674206211864,
  difficulty: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 5830,
  id: '0000efd91578eb486e5d009739294a335e0dbf33c1c6e5244680f51da2f97378'
}
Disconnect
```

Il est identique au premier ! Et si je *addPeer* `node cli.js addPeer http://127.0.0.1:3001` ? Pas d'erreur !

Bon, maintenant, il faut miner. Je lance le minage sur le second nœud grâce à l'aide : `node noeud.js -p 3001 -v -b 1674206211864 -m`. Il commence à afficher plein de choses :

```
Mode verbeux
My node id: y01oxwdzpz
Minage activé
Serveur lancé sur le port 3001.
add block 1 0000907e2e4de4d9da9f35bb81878366ff80ba28885237a9950f8b4580b56c16
Search for the hash of block 2
add block 2 0000c64a5dde01e34a2b7eeac0a08a316d0df2a590b81857c8a10176f09e359b
Search for the hash of block 3
add block 3 0000e4bc87f55e7bb355deda8cc28993758da04735920165a2696dc76187302c
Search for the hash of block 4
add block 4 000032f4282f9e9a3eb91568c445c257e7878975833c68e9308d804734cc8300
Search for the hash of block 5
add block 5 0000671d57ebe6cdb714eabf7efc94a45ef918e4942c6eb1d9b3eef1ca6b8e02
Search for the hash of block 6
...
```

Ça semble fonctionner. Si je vérifie avec un *blockByIndex* :

```
> node cli.js -p 3001 blockByIndex 100
Connection à http://127.0.0.1:3001
Connection établie
blockByIndex argv.index =>
{
  index: 100,
  previous: '00003cd8e6405dc5795e0fbc444b062c9ad1df35218becbe454e74c027f3367c',
  transactions: [],
  timestamp: 1674206768061,
  difficulty: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 30552,
  id: '000080c6c2691f58798bb593aa13f5ee5efc94c21e18f3a91341c07690ceee17'
}
Disconnect

> node cli.js -p 3000 blockByIndex 100
Connection à http://127.0.0.1:3000
Connection établie
blockByIndex argv.index =>
{
  index: 100,
  previous: '00003cd8e6405dc5795e0fbc444b062c9ad1df35218becbe454e74c027f3367c',
  transactions: [],
  timestamp: 1674206768061,
  difficulty: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  nonce: 30552,
  id: '000080c6c2691f58798bb593aa13f5ee5efc94c21e18f3a91341c07690ceee17'
}
Disconnect
```

Les deux nœuds ont le même *block*.

### 2.1 - Prendre le contrôle

Je fais ce que le sujet demande :

```
> node cli.js -p 3000 mine "<state>"
cli.js mine <state>

active ou désactive le minage. Authentification requise.

Arguments positionnels :
  state                                       [requis] [choix : "start", "stop"]

Options :
      --version  Affiche le numéro de version                          [booléen]
  -u, --url      Url du serveur à contacter        [défaut : "http://localhost"]
  -p, --port     port à utiliser                               [défaut : "3000"]
  -w, --wallet   wallet à utiliser                          [défaut : "default"]
  -b, --bot      désactive les messages utilisateur             [défaut : false]
      --help     Affiche l'aide                                        [booléen]

Valeurs invalides :
  Argument : state, donné : "state", choix : "start", "stop"
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

Et au niveau du nœud : `cmd::mine { state: 'start' }`. Dans noeud, je cherche `mine error : not implemented` et je trouve la ligne 282. Je sais que l'option mine du noeud fonctionne, je cherche `mine` dans le noeud et trouve plusieurs lignes :
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
> node noeud.js -b 1674206211864
> node noeud.js -p 3001 -v -b 1674206211864
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

Cette fois, tout fonctionne.

## 3 - Connectons-nous !

Je dois me synchroniser avec le nœud du prof : https://syd.reimert.fr. Je fais un addPeer : `node cli.js addPeer https://syd.reimert.fr`.

Si j'ai mis l'option verbose, je vois qu'il se synchronise puis j'ai plein de warning : `## WARN ## fail verification Block {`.

Si je n'ai pas mis l'option verbose, j'obtiens : `## ERREUR ## On ne peut pas changer le genesis Block {`.

J'ai un le même problème de genesis. Je récupère le timestamp sur serveur du prof : `node cli.js -u https://syd.reimert.fr blockByIndex 0`. J'obtiens une erreur : `Error: connect ECONNREFUSED 51.255.201.126:3000`. En indice, je vois que le prof parle de port 443.

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

Je récupère le timestamp et redémarre un serveur : `node noeud.js -b 1674199299451 -v`. Puis *addPeer* le serveur du prof : `node cli.js addPeer https://syd.reimert.fr`. Je vois au niveau du serveur, qu'il y a synchronisation et pas d'erreur.

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

Je cherche dans le noeud et arrive vers les lignes 290 :

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

Et je teste : `node cli.js identity trololo`. Tout semble fonctionner mais quand je fais `node cli.js identities`, il n'y a rien. Je tourne en rond pendant un moment et je me souviens que le prof a parlé de minage. Je lance le minage : `node cli.js mine start` et je stoppe après quelques blocks : `node cli.js mine stop`. Je réessaie :

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

Maintenant que ma transaction *identity* semble fonctionner, je peux essayer en prod :

```
> node noeud.js -b 1674199299451 -v # lancement du serveur avec le timestamp du serveur
> node cli.js addPeer https://syd.reimert.fr # J'ajoute le serveur
> node cli.js identity Trololololo // J'ajoute mon identité
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

Ensuite je forge la transaction :

```Javascript
if (mining) {
  const nextBlock = blockchain.buildNextBlock()

  // reward here ;)
  const tx = new Transaction('reward', null, publicKey)

  tx.sign(privateKey)

  nextBlock.transactions.unshift(tx)

  log.info(`Search for the hash of block ${nextBlock.index}`)

  miner.findPow(nextBlock)
}
```

Je relance le tout :

```
> node noeud.js -b 1674206211864 -v
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

Dans notre preuve de travail, on utilise ce principe pour avoir un *block* toutes les 10 secondes. En effet, plus il va être difficile de trouver une preuve et plus il va falloir faire d'essais. Plus il y aura d'essais et plus la loi des grands nombres sera vérifiée. Il en va de même pour le nombre de participants. Plus il y aura de personnes pour chercher une preuve, plus il faudra qu'elle soit difficile mais plus il y a augmentation du nombre participant et du nombre d'essais, plus elle devient résistante à l' influence extérieur et statistiquement fiable.

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

Et je modifie `Block._verify` pour ajouter :

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