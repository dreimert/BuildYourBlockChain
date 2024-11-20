# Build Your BlockChain

Le but de ce tutoriel est de coder une blockchain depuis un exemple simple de base de données pour en comprendre les mécanismes. Cette blockchain sera très loin d'une blockchain de production mais permettra d'illustrer les différentes mécaniques la constituant. Les notions et les problématiques seront introduites au fur et à mesure de la progression. Certaines seront *un peu* simplifiées.

Le code se fait en Javascript pour permettre au plus grand nombre de réaliser ce tutoriel et parce que c'est le langage de programmation que j'utilise quotidiennement :D. L'environnement utilisé pour l'écriture de ce sujet est Node.js (https://nodejs.org/fr/) en version 18 minimum avec `npm` pour gérer les dépendances.

Ce tutoriel est la cinquième itération, vous pouvez trouver la quatrième là : https://github.com/dreimert/BuildYourChain.

## Prérequis

Je pars du principe que vous savez coder en Javascript et utiliser git et github. Si ce n'est pas le cas, je vous invite pour le prochain TD à lire :

* Javascript :
  * https://eloquentjavascript.net/ (troisième édition en anglais)
  * https://fr.eloquentjavascript.net/ (première edition en français, anglais, allemand et polonais)
* Programmation événementielle en Javascript:
  * https://eloquentjavascript.net/11_async.html (Chapitre 11 de Eloquent JavaScript troisième édition)
  * http://www.fil.univ-lille1.fr/~routier/enseignement/licence/tw1/spoc/chap10-evenements-partie1.html (Vidéo / cours de Jean-Christophe Routier)
* Git : http://rogerdudler.github.io/git-guide/index.fr.html

## Installation classique de node

Vous êtes sur votre machine perso ? Tout se passe là : https://nodejs.org/

## Installation de node si vous êtes sur les postes de l'INSA

Attention ! Vous devez faire cette manipulation dans un répertoire non virtuel. Par exemple dans votre home. Si vous le faite dans HOME_INSA ou sur le bureau, ça ne fonctionnera pas.

Télécharger les binaires et les décompresser :

    wget https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz
    tar -xJvf node-v20.18.0-linux-x64.tar.xz

Mettre à jour votre PATH pour trouver les binaires :

    echo "export PATH=$(pwd)/node-v20.18.0-linux-x64/bin/:$PATH" >> ~/.bashrc

Recharger vos variables d'environnement :

    . ~/.bashrc

Vérifier que node s'exécute bien :

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
* Comprendre les bases de socket.io.
* Comprendre le fonctionnement d'une base de données minimaliste.

## Durée

Cette étape dure entre 10 et 30 min selon votre familiarité avec Javascript. Si vous dépassez les 30 min appeler l'enseignant pour vous débloquer.

## Une base de données minimaliste

J'ai réalisé pour vous un serveur de base de données minimaliste. Pour l'exécuter, taper la commande : `node serveur.js`.

Le serveur de la base de données n'accepte que trois commandes : `get`, `set` et `keys` :

* get : permet de récupérer la valeur d'une clé. Si la clé n'existe pas, retourne une erreur.
* set : permet d'associer une valeur à une clé, une fois une valeur associée à une clé, **il n'est plus possible de modifier la valeur**. Si la clé n'existe pas, la valeur est affectée à la clé. Si la clé existe, elle n'est pas modifiée et dans le cas où la valeur est identique, la commande ne retourne pas d'erreur et se résout normalement sinon la commande retourne une erreur `set error : Field ${field} exists.`.
* keys : retourne la liste des clés de la base de données.

J'ai codé un *CLI* (Command Line Interface) pour passer des commandes au serveur. Pour voir les commandes que le *CLI* peut lancer : `node cli.js`.

#### Utilisez le *CLI* pour lancer les trois commandes et voir le comportement du serveur.

Vous pouvez voir le code du serveur et du *CLI* dans les fichiers `serveur.js` et `cli.js`. Si vous observez bien le code, vous pouvez voir un callback. Le premier paramètre de celui-ci correspond à une erreur, c'est une convention classique en Javascript. S'il n'y a pas d'erreur, on met ce paramètre à `undefined`. Une commande doit **toujours** appeler le callback pour se terminer sinon vous aurez une erreur côté client.

Le fichier de test `test.js` va nous permettre de tester notre serveur de base de données automatiquement. Vous pouvez lancer les tests via la commande `npm test`. **Ce fichier lance automatiquement le serveur de base de données** et envoie les logs dans les fichiers `serveur.log` et `serveur.err`. Si vous n'arrivez pas à comprendre pourquoi les tests ne fonctionnent pas, lancez manuellement le serveur et les commandes.

**Vous ne devrez jamais modifier le ficher du *CLI* ou le fichier de tests**. Ils seront mis à jour automatiquement au fur et à mesure de la progression.

#### Lancez les tests. Un test ne doit pas fonctionner. Corrigez le serveur pour que toutes les commandes fonctionnent et respectent le protocole.

##### Indice : db[field].value

## Socket.io

Pour gagner du temps, j'utilise *socket.io* qui me permet d'établir une connexion entre le serveur et le client. Vous pouvez trouver la documentation là : https://socket.io/.

Nous n'utiliseront pas beaucoup plus de fonctionnalités que celles utilisés dans l'exemple de serveur. Il faut savoir envoyer et recevoir un message.

## Conclusion

Vous avez survécu ? Cool !

Quel est le rapport entre cette base de données et la blockchain ? La blockchain est une base de données avec les propriétés décrites. On ne peut pas mettre à jours les données ni en supprimer, on ne peut qu'en ajouter et lire le contenu.

Mais la blockchain est une base de données distribuées, ce qui n'est pas le cas de la notre qui raisonne en terme de client / serveur. On va essayer de corriger ça !

## Suite

Allez à l'étape 1 : `git checkout etape-1`.

Pour continuer à lire le sujet :

* soit vous lisez le fichier `README.md` sur votre machine.
* soit sur GitHub, au-dessus de la liste des fichiers, vous pouvez cliquer sur `main` et sélectionner `etape-1`.
