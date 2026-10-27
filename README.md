# Build Your BlockChain - Blockchain

## Objectif

Le but de cette étape est de manipuler une blockchain un minimum fonctionnelle :

* faire tourner un réseau de nœuds qui minent des blocs et se synchronisent ;
* rejoindre un réseau public et y inscrire une transaction signée ;
* ajouter une récompense pour le mineur ;
* faire évoluer une règle de consensus : l'ajustement de la difficulté.

`npm test` vérifie les classes utilisées par le nœud (`class/`). Les fichiers `serveur.js`, `tools.js`, `tools/` et `scenarios/` des étapes précédentes ne servent plus à cette étape.

## De l'étape 2 à la blockchain

À l'étape 2, les nœuds se mettaient d'accord en gardant la valeur la plus vieille. Mais rien n'empêchait un individu mal intentionné de forger une valeur avec un *vieux* horodatage. La blockchain remplace cette règle par une autre, plus difficile à tromper.

* **Les blocs.** Les données ne sont plus des couples clé / valeur isolés : elles sont regroupées en *transactions*, elles-mêmes regroupées dans des *blocs*. Chaque bloc contient l'empreinte du bloc précédent (`previous`) : vous retrouvez la fonction de hachage de l'étape 2. Modifier un bloc change son empreinte et casse le lien avec tous les blocs suivants. Le premier bloc, qui n'a pas de précédent, s'appelle le *genesis*.
* **La preuve de travail.** Pour qu'un bloc soit valide, son empreinte doit être inférieure à une valeur appelée *difficulté* (`difficulty`). La seule façon d'y arriver est d'essayer des valeurs de `nonce` jusqu'à trouver la bonne : c'est le *minage*. Produire un bloc coûte donc du calcul, et réécrire l'histoire coûterait autant que de la produire.
* **La règle de consensus.** Entre deux chaînes valides, les nœuds gardent la plus longue.
* **Les signatures.** Chaque participant possède un *wallet* : une paire de clés, privée et publique, que le *CLI* sait créer. Les commandes envoyées à votre nœud et les transactions sont signées avec votre clé privée ; n'importe qui peut vérifier la signature avec votre clé publique, mais personne ne peut signer à votre place.

## 1 - Lancement

Cette étape est indépendante des précédentes. Vous ne devez plus lancer `serveur.js` mais `noeud.js`. J'ai aussi modifié le *CLI* pour qu'il fonctionne avec `noeud.js`.

Vous pouvez accéder à l'aide du *CLI* via `node cli.js` et à celle du nœud via `node noeud.js --help`.

Le code de `noeud.js` est fonctionnel mais par la suite de ce TP vous devrez le modifier pour ajouter des fonctionnalités.

#### En vous aidant de l'aide du *CLI* et de celle du nœud, lancez un nœud. Expliquez la procédure.

##### Indice : vous **n**'avez **pas** besoin de modifier le code.

##### Indice : le nœud met quelques secondes à démarrer, le temps de calculer la preuve de travail du genesis. Attendez le message `My node id` avant de lui envoyer des commandes.

## 2 - À deux (ou plus), c'est mieux !

Toujours sans modifier le code, essayez de lancer deux nœuds en parallèle et de faire en sorte qu'ils communiquent.

En regardant l'aide du nœud et non celle du *CLI* (l'interprétation de la commande `mine` n'est pas codée dans le serveur), lancez les nœuds pour qu'ils minent des blocs. Observez ce qu'il se passe.

#### Expliquez comment faire pour que les nœuds se synchronisent.

##### Indice : vous **n**'avez **pas** besoin de modifier le code.

##### Indice : Pour vérifier que les nœuds sont synchronisés, comparez le résultat des commandes `blockByIndex` sur les deux nœuds, notamment les timestamps.

##### Indice : si le nœud n'est pas assez verbeux, il y a une option pour ça. Mais parfois trop d'informations noie l'information ;)

Quand vous ajoutez un voisin, le nœud lui demande son dernier bloc, puis télécharge un par un les blocs qui lui manquent. Comparez avec la fonction `sync` de l'étape 1.

#### Un nœud qui reçoit un bloc qu'il connaît déjà ne le retransmet pas. Pourquoi est-ce indispensable ? Quel lien avec les étapes 0 et 1 ?

#### À l'étape 2, on départageait deux valeurs de même date de façon déterministe. Comment `noeud.js` départage-t-il deux chaînes de même longueur ? Est-ce un problème ?

##### Indice : regardez `Blockchain.addBlock`.

### 2.1 - Prendre le contrôle

#### Essayez la commande `mine <state>` du *CLI*.

#### Modifiez `noeud.js` pour que la commande `node cli.js mine <state>` fonctionne.

Après un `mine stop`, il est possible qu'un dernier bloc soit encore miné : le mineur termine la preuve de travail en cours.

## 3 - Connectons-nous !

Durant ce TP, j'ai un nœud qui tourne sur https://syd.reimert.fr.

**Ne minez pas encore** : mon nœud refuse les blocs qui ne demandent pas de récompense (cf. section 5).

#### Essayez de vous connecter à mon nœud et de vous synchroniser. Comment avez-vous fait ?

##### Indice : mon nœud tourne sur le port 443.

## 4 - Laisser une trace dans ce monde

La transaction `identity` sert à associer votre clé publique à votre nom.

En observant le code du nœud, notamment la commande `set` mais aussi `class/Transaction.js`, modifiez `noeud.js` pour que la commande `node cli.js identity <name>` fonctionne.

Attention, faites vos tests en local, il serait dommage d'écrire n'importe quoi publiquement ;) Pour cela, relancez un nœud **sans** l'ajouter comme voisin du mien.

Les récompenses de la section 5 seront attribuées à la clé publique du wallet de votre nœud. Envoyez donc votre `identity` avec ce même wallet, et avant de miner : une récompense obtenue par une clé sans identité est comptée comme `unknown`.

#### Inscrivez une unique transaction de type `identity` dans la blockchain publique (https://syd.reimert.fr).

##### Indice : pour vérifier le fonctionnement, vous pouvez utiliser la commande `identities` du *CLI*.

#### Qu'est-ce qui empêche quelqu'un d'inscrire plusieurs identités, ou le nom de quelqu'un d'autre ?

## 5 - Contribuer au réseau

Vos nœuds minent des blocs sans demander rétribution mais tout le monde n'est pas aussi généreux. Pire, mon nœud mine des blocs, demande rétribution et refuse vos blocs si vous ne demandez pas de rétribution, quel chacal !

#### Modifiez `noeud.js` pour que votre nœud ajoute une transaction de type `reward` aux blocs qu'il mine.

##### Indice : cherchez le commentaire `// reward here ;)` dans `noeud.js`, j'ai même laissé des indices ;)

##### Indice : le reward doit être la première transaction du bloc :)

##### Indice : ce n'est pas le seul endroit où le nœud lance le minage. Cherchez tous les appels à `miner.findPow` : une fonction qui prépare le bloc à miner vous évitera d'oublier un cas.

`Block` calcule l'empreinte de ses transactions (`txHash`) dans son constructeur. Si vous ajoutez une transaction après avoir construit le bloc, `txHash` n'est plus à jour : ça fonctionne quand même parce que le mineur reconstruit le bloc (`Block.fromObject`) avant de chercher la preuve de travail.

## 6 - Ajuster la difficulté

Vous avez déjà vécu cette sensation que le temps défile trop vite comme moi pour préparer cette étape ? Ou au contraire, qu'il est lent et que ce cours ne va jamais finir ?

Dans la blockchain, la vitesse d'ajout des blocs peut varier avec la modification de la puissance de calcul des participants mais on veut qu'en moyenne il y ait toujours le même temps entre les blocs.

Attention au vocabulaire : `difficulty` est la valeur maximale que peut prendre l'empreinte d'un bloc. C'est donc une cible : **plus elle est grande, plus il est facile** de trouver un bloc. `Block.MinimumDifficulty` est la difficulté minimale, c'est-à-dire la plus grande cible autorisée.

Dans notre protocole, je fixe l'objectif à **un bloc toutes les 10 secondes** et la réévaluation de la difficulté **tous les 60 blocs** soit environ toutes les 10 minutes. Si c'est trop rapide ou trop lent, modifier la difficulté en fonction.

Pour un bloc d'index `n` multiple de 60, j'utilise la formule suivante :

```Javascript
const nextDifficulty = previousDifficulty * BigInt(Math.floor(moyenne)) / 10000n
```

* `moyenne` vaut `(timestamp du bloc n − timestamp du bloc n − 60) / 60`, en millisecondes, où le bloc `n` est celui que l'on construit ;
* `previousDifficulty` est la difficulté du bloc `n − 60` ;
* `10000n` correspond à 10 secondes en millisecondes.

Pour tous les autres blocs, la difficulté est celle du bloc précédent.

Cette formule est une règle de consensus : votre nœud doit trouver **exactement** le même résultat que le mien, sinon il refusera ma chaîne. Rappelez-vous l'étape 2 : une règle n'est utile que si tous les nœuds l'appliquent de la même façon.

#### Modifiez `Blockchain.buildNextBlock` et `Block._verify` pour implémenter la réévaluation.

##### Indice : le modulo est fort utile. Exemple : `100 % 12 === 0`

##### Indice : pour manipuler des BigInt, il faut rajouter un n. Exemple : `100n * 2n`

##### Indice : `Blockchain.getPreviousAt` retrouve le bloc d'un index donné dans la chaîne d'un bloc.

##### Indice : `Block.verify` met son résultat en cache, c'est `Block._verify` qui fait la vérification.

#### Décrivez les modifications et pourquoi.

#### Vérifiez que votre nœud se synchronise toujours avec le mien : c'est le meilleur test de votre implémentation.

#### Que se passe-t-il si `nextDifficulty` dépasse `Block.MinimumDifficulty` ?

## 7 - Pour aller plus loin

Si vous arrivez ici durant le TP, félicitations ! Appelez-moi ;) Voici quelques pistes :

* **La chaîne la plus longue ou la chaîne qui a demandé le plus de travail ?** Notre nœud garde la chaîne qui a le plus de blocs. Avec l'ajustement de la difficulté, est-ce la même chose ? Comment tricher ?
* **L'attaque par l'horloge.** Les timestamps des blocs sont choisis par le mineur et seulement vérifiés comme croissants. Ils entrent pourtant dans le calcul de la difficulté. Que peut faire un mineur malhonnête ? (Souvenez-vous de la question sur les horodatages forgés de l'étape 2.)
* **Départager deux chaînes de même longueur** de façon déterministe, comme à l'étape 2.
* **Se resynchroniser après une coupure** : quand la connexion avec un voisin revient, le nœud ne redemande pas son dernier bloc.
* **Des transactions monétaires** : transférer des récompenses d'un wallet à un autre.

## Conclusion

La blockchain que je vous propose est très loin d'être parfaite, mais elle est fonctionnelle.

#### Citez trois attaques possibles contre ce réseau.

Ce qu'il faut retenir :

* Une blockchain est une suite de blocs reliés par leurs empreintes : modifier un bloc invalide tous les suivants.
* La preuve de travail rend la production d'un bloc coûteuse ; la règle de la chaîne la plus longue désigne la version de référence.
* Les signatures permettent de vérifier qui est l'auteur d'une transaction sans faire confiance au nœud qui la transmet.
* Les règles de consensus (validité d'un bloc, ajustement de la difficulté) doivent être appliquées à l'identique par tous les nœuds.

C'est une bonne base pour aller plus loin :

* transactions monétaires
* langage de script
* votre imagination

## Suite

La suite arrive bientôt !
