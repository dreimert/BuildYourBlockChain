# Build Your BlockChain

Le but de ce tutoriel est de coder une blockchain depuis un exemple simple de base de données pour en comprendre les mécanismes. Cette blockchain sera très loin d'une blockchain de production mais permettra d'illustrer les différentes mécaniques la constituant. Les notions et les problématiques seront introduites au fur et à mesure de la progression. Certaines seront *un peu* simplifiées.

Le code se fait en Javascript pour permettre au plus grand nombre de réaliser ce tutoriel et parce que c'est le langage de programmation que j'utilise quotidiennement :D. L'environnement utilisé est Node.js (https://nodejs.org/fr/), en version 24 minimum, avec `npm` pour gérer les dépendances.

Ce tutoriel est la cinquième itération, vous pouvez trouver la quatrième là : https://github.com/dreimert/BuildYourChain.

## Prérequis et installation de node

Ce sont les mêmes que pour le TD de scraping : suivez ses sections [Prérequis](https://github.com/dreimert/syd-scraping#prérequis) et [Installation de node](https://github.com/dreimert/syd-scraping#installation-de-node). Si vous avez fait le TD de scraping, vous n'avez rien à réinstaller : la version de node qu'il installe convient.

Vérifiez que node s'exécute bien :

    node --version

## Cloner ce dépôt

```Bash
git clone https://github.com/dreimert/BuildYourBlockChain
cd BuildYourBlockChain
```

## Installer les dépendances

```Bash
npm install
```

## Objectif

Les buts de cette étape sont :

* Mettre en place l'environnement du tutoriel.
* Prise en main de l'environnement.
* Comprendre les bases de socket.io : envoyer un message et recevoir une réponse.
* Comprendre le fonctionnement d'une base de données minimaliste.

## Durée

Cette étape dure entre 10 et 30 min selon votre familiarité avec Javascript. Si vous dépassez les 30 min, appelez l'enseignant pour vous débloquer.

## Une base de données minimaliste

J'ai réalisé pour vous un serveur de base de données minimaliste. Pour l'exécuter, tapez la commande : `node serveur.js`.

Le serveur de la base de données n'accepte que trois commandes : `get`, `set` et `keys` :

* get : permet de récupérer la valeur d'une clé. Si la clé n'existe pas dans la base de données, retourne une erreur.
* set : permet d'associer une valeur à une clé. Une fois une valeur associée à une clé, **il n'est plus possible de modifier la valeur** :
  * si la clé n'existe pas dans la base de données, la valeur est associée à la clé et la commande réussit ;
  * si la clé existe avec la même valeur, rien ne change et la commande réussit ;
  * si la clé existe avec une autre valeur, rien ne change et la commande retourne l'erreur `set error : Field ${field} exists.`.
* keys : retourne la liste des clés de la base de données.

Le serveur enregistre aussi la date de création de chaque clé. Elle ne sert pas pour l'instant, elle servira dans une prochaine étape.

J'ai codé un *CLI* (Command Line Interface) pour passer des commandes au serveur. Pour voir les commandes que le *CLI* peut lancer : `node cli.js`. Les commandes `addPeer` et `peers` serviront à l'étape suivante : le serveur ne les connaît pas encore.

#### Utilisez le *CLI* pour lancer les trois commandes et voir le comportement du serveur.

Vous pouvez voir le code du serveur et du *CLI* dans les fichiers `serveur.js` et `cli.js`. Si vous observez bien le code, vous pouvez voir un callback. Le premier paramètre de celui-ci correspond à une erreur, c'est une convention classique en Javascript. S'il n'y a pas d'erreur, on met ce paramètre à `undefined`. Une commande doit **toujours** appeler le callback pour se terminer sinon vous aurez une erreur côté client.

Le fichier de test `test.js` va nous permettre de tester notre serveur de base de données automatiquement. Vous pouvez lancer les tests via la commande `npm test`. **Ce fichier lance automatiquement le serveur de base de données** et envoie les logs dans les fichiers `serveur.log` et `serveur.err`. Si vous n'arrivez pas à comprendre pourquoi les tests ne fonctionnent pas, lancez manuellement le serveur et les commandes.

**Vous ne devrez jamais modifier le fichier du *CLI* ou le fichier de tests**. Ils seront mis à jour quand vous changerez d'étape avec `git checkout`. Si vous les avez modifiés par erreur, `git checkout -- cli.js test.js` annule vos modifications.

#### Lancez les tests. Un test échoue. Corrigez le serveur pour que toutes les commandes fonctionnent et respectent le protocole.

##### Indice : db[field].value

#### Pourquoi est-il utile qu'un `set` avec la même valeur réussisse ? Pensez à ce qui se passe si le même message arrive deux fois.

## Socket.io

Pour gagner du temps, j'utilise *socket.io* qui me permet d'établir une connexion entre le serveur et le client. Vous pouvez trouver la documentation là : https://socket.io/.

Nous n'utiliserons pas beaucoup plus de fonctionnalités que celles utilisées dans l'exemple de serveur. Il faut savoir envoyer et recevoir un message.

#### En lisant `cli.js`, expliquez ce qu'il se passe côté client si le serveur n'appelle jamais le callback.

## Conclusion

Vous avez survécu ? Cool !

Quel est le rapport entre cette base de données et la blockchain ? La blockchain est une base de données avec les propriétés décrites. On ne peut pas mettre à jour les données ni en supprimer, on ne peut qu'en ajouter et lire le contenu.

Mais la blockchain est une base de données distribuée, ce qui n'est pas le cas de la nôtre qui raisonne en termes de client / serveur. On va essayer de corriger ça !

## Suite

Allez à l'étape 1 : `git checkout etape-1`.

Pour continuer à lire le sujet :

* soit vous lisez le fichier `README.md` sur votre machine.
* soit sur GitHub, au-dessus de la liste des fichiers, vous pouvez cliquer sur `main` et sélectionner `etape-1`.
