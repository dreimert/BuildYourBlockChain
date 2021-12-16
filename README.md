# Build Your BlockChain - Blockchain

## Objectif

Le but de cette étape est de manipuler une blockchain un minimum fonctionnelle.

## 1 - Lancement

Cette étape est indépendante des précédentes. Vous ne devez plus lancer `serveur.js` mais `noeud.js`. J'ai aussi modifié le *CLI* pour qu'il fonctionne avec `noeud.js`.

Vous pouvez accéder à l'aide du *CLI* via `node cli.js` et à celle du noeud via `node noeud.js --help`.

Le code de `noeud.js` est fonctionnel mais par la suite de ce TP vous devrez le modifier pour ajouter des fonctionnalités.

#### À l'aide des aides, lancer un nœud. Expliquer la procédure.

##### Indice : vous **n**'avez **pas** besoin de modifier le code.

## 2 - À deux (ou plus), c'est mieux !

Toujours sans modifier le code, essayez de lancer deux nœuds en parallèle et de faire en sorte qu'ils communiquent.

En regardant l'aide du nœud et non celle du *CLI* (l'interprétation de la commande `mine` n'est pas codée dans le serveur), lancez les nœuds pour qu'ils minent des blocs. Observez ce qu'il se passe.

#### Expliquez comment faire pour que les nœuds se synchronisent.

##### Indice : si le nœud n'est pas assez verbeux, il y a une option pour ça.

##### Indice : Pour vérifier que les noeuds sont synchronisés, comparer le résultat des commandes `last` sur les deux noeuds, notamment les timestamps.

#### Modifier `noeud.js` pour que la commande `node cli.js mine <state>` fonctionne.

## 3 - Connectons-nous !

Durant ce TP, j'ai un nœud qui tourne sur https://syd.reimert.fr.

#### Essayez de vous connecter à mon nœud et de vous synchroniser. Comment avez-vous fait ?

##### Indice : mon noeud tourne sur le port 443.

## 4 - Laisser une trace dans ce monde

La transaction `identity` sert à associer votre clé publique à votre nom.

En observant le code du nœud, notamment la commande `set`, de `cli.js` mais aussi `class/Transaction.js`, modifiez `noeud.js` pour que la commande `node cli.js identity <name>` fonctionne.

Attention, faites vos tests en local, il serait dommage d'écrire n'importe quoi publiquement ;)

#### Inscrivez une unique transaction de type `identity` dans la blockchain publique (https://syd.reimert.fr).

##### Indice : pour vérifier le fonctionnement, vous pouvez utiliser la commande `identities` du *CLI*.

## 5 - Contribuer au réseau

Vos nœuds minent des blocks sans demander rétribution mais tout le monde n'est pas aussi généreux. Pire, mon nœud mine des blocks, demande rétribution et refuse vos blocs si vous ne demandez pas de rétribution, quel chacal !

#### Modifiez `noeud.js` pour que votre nœud ajoute une transaction de type `reward` aux blocs qu'il mine.

##### Indice : ligne 135 du nœud de base, j'ai même laissé en commentaire un autre indice ;)

## 6 - Ajuster la difficulté

Vous avez déjà vécu cette sensation que le temps défile trop vite comme moi pour préparer cette étape ? Ou au contraire, qu'il est lent et que ce cours ne va jamais finir ?

Dans la blockchain, la vitesse d'ajout des blocs peut varier avec la modification de la puissance de calcul des participants mais on veut qu'en moyenne il y ai toujours le même temps entre les blocs.

Dans notre protocole, je fixe l'objectif à **un bloc toutes les 10 secondes** et la réévaluation de la difficulté **tous les 60 blocs** soit environ toutes les 10 minutes. Si c'est trop rapide ou trop lent, modifier la difficulté en fonction.

J'utilise la formule suivante : `const nextDifficulty = previousDifficulty * BigInt(Math.floor(moyenne)) / 10000n`.

#### Modifiez `Blockchain.buildNextBlock` et `Block.verify` pour implémenter la réévaluation.

##### Indice : `100 % 12 === 4`

##### Indice : `100n * 2n`

#### Décrivez les modifications et pourquoi.

## 7 - Appelez le prof

J'ai pas trop d'idées là et si vous arrivez ici félicitation durant le TP ! Appelez-moi ;)

## Conclusion

La blockchain que je vous propose est très loin d'être parfaite. Elle est facilement attaquable et on peut faire un peu n'importe quoi avec mais elle est fonctionnelle.

C'est une bonne base pour aller plus loin :
- transactions monétaires
- langage de script
- votre imagination

## Suite (coming soon)

Aller à l'étape 4 : `git checkout etape-4`.

Pour continuer à lire le sujet :

* soit vous lisez le fichier `README.md` sur votre machine.
* soit sur GitHub, au-dessus de la liste des fichiers, vous pouvez cliquer sur `Branch: master` et sélectionner `etape-4`.
