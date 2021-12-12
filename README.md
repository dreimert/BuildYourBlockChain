# Build Your BlockChain - Blockchain

## Objectif

Le but de cette étape est de manipuler une blockchain un minimum fonctionnelle.

## 1 - Lancement

Cette étape est indépendante des précédentes. Vous ne devez plus lancer `serveur.js` mais `noeud.js`. J'ai aussi modifié le *CLI* pour qu'il fonctionne avec `noeud.js`.

Vous pouvez accéder à l'aide du *CLI* via `node cli.js` et à celle du noeud via `node noeud.js --help`.

Le code de `noeud.js` est fonctionnel mais par la suite de ce TP vous devrez le modifier pour ajouter des fonctionnalités.

#### À l'aide des aides, lancer un noeud. Expliquer la procédure.

##### Indice : vous **n**'avez **pas** besoin de modifier le code.

## 2 - À deux (ou plus), c'est mieux !

Toujours sans modifier le code, essayez de lancer deux noeuds en parallèle et de faire en sorte qu'ils communiques.

En regardant l'aide du noeud, lancez les noeuds pour qu'ils minent des blocks. Observez ce qu'il se passe.

#### Expliquez comment faire pour que les noeuds se synchronisent.

##### Indice : si le noeud n'est pas assez verbeux, il y a une option pour ça.

## 3 - Connectons-nous !

Durant ce TP, j'ai un noeud qui tourne sur https://syd.reimert.fr.

#### Essayez de vous connecter à mon noeud et de vous synchroniser. Comment avez-vous fait ?

## 4 - Laisser une trace dans ce monde

En observant le code du noeud, de `cli.js` mais aussi `class/Transaction.js`, modifiez `noeud.js` pour que la commande `node cli.js identity <name>` fonctionne.

Attention, faites vos tests en local, il serai dommage d'écrire n'importe quoi publiquement ;)

#### Inscrivez une unique transaction de type `identity` dans la blockchain publique (https://syd.reimert.fr).

## 5 - Contribuer au réseau

Mon noeud mine des blocks sans demander rétribution mais tout le monde n'est pas aussi généreux.

#### Modifiez `noeud.js` pour que votre noeud ajoute une transaction de type `reward` aux blocks qu'il mine.

##### Indice : ligne 135 du noeud de base, j'ai même laissé en commentaire un autre indice ;)

## 6 - Ajuster la difficulté

Vous avez déjà vécu cette sensation que le temps défile trop vite comme moi pour préparer cette étape ? Ou au contraire, qu'il est lent et que ce cours ne va jamais finir ?

Dans la blockchain, la vitesse d'ajout des blocks peut varier avec la modification de la puissance de calcul des participants mais on veut qu'en moyenne il y ai toujours le même temps entre les blocks.

Dans notre protocole, je fixe l'objectif à **un block toutes les 10 secondes** et la réévaluation de la difficulté **tous les 60 blocks** soit environ toutes les 10 minutes.

#### Modifiez `Blockchain.buildNextBlock` et `Block.verify` pour implémenter la réévaluation.

##### Indice : Pour éviter divers problèmes durant le TP, mon noeud public n'implémente pas la réévaluation de la difficulté.

##### Indice : `100 % 12 === 4`

#### Décrivez les modifications et pourquoi.

## 7 - Appelez le prof

J'ai pas trop d'idée là. Appelez-mois le jour du TP ;)

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
