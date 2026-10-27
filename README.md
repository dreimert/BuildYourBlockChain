# Build Your BlockChain - Consensus

## Objectif

Le but de cette étape est de mettre en place un algorithme de consensus pour notre base de données :

* départager deux valeurs proposées pour une même clé ;
* réparer un nœud qui a manqué des mises à jour ;
* découvrir les fonctions de hachage.

`npm test` vérifie l'ensemble de l'étape : il ne passera entièrement qu'à la fin.

## Consensus

À l'étape précédente, nous avons mis en place un système distribué minimal mais qui fonctionne plus ou moins bien car il n'a pas d'algorithme de consensus. Un algorithme de consensus est un algorithme qui va permettre aux nœuds de se mettre d'accord sur une valeur. Par exemple, si deux valeurs différentes sont proposées pour une même clé, l'algorithme doit permettre d'en choisir une.

Ces désaccords peuvent être dus à :

* des contraintes du monde physique comme la vitesse de la lumière. L'information ne peut pas se téléporter d'un serveur à l'autre, il y a un délai : la latence.
* Il peut y avoir des dysfonctionnements : pannes de matériel ou corruptions de données.
* Il y a des humains qui interagissent avec le système et l'infrastructure, ils peuvent être mal informés, incompétents ou malveillants.

Il n'y a pas d'algorithme de consensus ultime. Pour pouvoir mettre en place un algorithme de consensus, il faut mettre en place des contraintes qui auront un coût en temps ou en ressources.

## Ouch ! Ça lag...

La latence est partout dès qu'il y a communication. L'information ne peut pas aller plus vite que la lumière, sans compter les temps de traitement. Par exemple, à l'heure où j'écris ces lignes, pour l'échange d'un message de ping, il y a 229 millisecondes de latence entre Paris et Tokyo : https://wondernetwork.com/pings. Imaginez maintenant un système distribué de plusieurs milliers de nœuds, le temps que l'information se propage d'un bout à l'autre, il peut se passer plusieurs secondes. Et beaucoup plus si vous voulez transporter une grande quantité d'informations.

Maintenant, imaginez : à quelques millisecondes d'écart, deux nœuds du réseau reçoivent pour la clé `Ville` une valeur différente :

* Nœud 1 : Ville / Paris
* Nœud 2 : Ville / Tokyo

L'information se propage de proche en proche jusqu'à confrontation. Une partie des nœuds a associé Ville à Paris et pour l'autre, Ville égale Tokyo.

#### Imaginez des solutions possibles. Notez-les, on pourra s'en servir plus tard.

## Combattre le temps par le temps

Dans l'idée initiale, on ne peut pas mettre à jour une valeur. Partant de cette idée, il semble cohérent que la valeur la plus vieille soit la bonne. Je vous propose donc l'algorithme de consensus suivant : on garde la valeur la plus vieille.

On a la date de création d'une valeur mais on n'en tient pas compte pour le moment et on ne la partage pas sur un `set` seulement sur un `get`. Il va falloir l'ajouter dans les données échangées pour pouvoir comparer.

Pour commencer, il faut que la commande `set` accepte une valeur simple comme la chaîne `'Reimert'` ou un objet avec la valeur et la date. Je vous donne le code pour faire ça :

```Javascript
socket.on('set', function (field, value, callback) {
  // Si value n'est pas un object
  if (value === null || typeof value !== 'object') {
    // on modifie la valeur pour en faire un objet
    value = {
      value: value,
      date: Date.now()
    }
  }
  // ...
})
```

J'ai modifié le *CLI* : la commande `set` accepte un troisième paramètre optionnel, la date de création en millisecondes. Par exemple, `node cli.js set Ville Paris 10000` envoie l'objet `{ value: 'Paris', date: 10000 }`. C'est pratique pour rejouer les scénarios à la main.

#### Modifiez la commande `set` dans `serveur.js` pour qu'elle supporte une valeur simple ou un objet.

Quand vous propagez une valeur à vos voisins, envoyez l'objet complet, avec sa date : sinon chaque voisin la daterait avec sa propre horloge.

#### Lancez la commande `node scenarios/latence.js`.

Si vous voulez voir plus en détail ce qu'il se passe, vous pouvez ajouter l'option `-v`. C'est valable pour tous les scénarios.

#### Modifiez la manière dont la commande `set` traite les clefs déjà définies pour garder la plus vieille.

Si la valeur reçue est plus vieille, elle remplace la valeur actuelle et vous la propagez. Si elle est plus récente, vous la refusez et la commande retourne une erreur.

Vous pouvez tester avec `node scenarios/latence.js`. Si votre implémentation est correcte, le réseau devrait converger vers une seule valeur.

Cette solution fonctionne ; tant qu'il n'y a pas de dysfonctionnements ou d'utilisateurs malveillants.

### Désynchronisation

Si un nœud a un problème réseau et que des messages sont perdus, il ne sera jamais mis à jour, même s'il utilise la commande `keys`, celle-ci ne retourne pas l'horodatage de la valeur. S'il a une valeur, il la gardera.

### Attaques

#### Qu'est-ce qui empêche un individu mal intentionné de forger un message `set` avec un *vieux* horodatage ou si l'horloge de la machine est mal réglée ? Que va-t-il se passer ?

Cet algorithme fonctionne dans un monde parfait, sans panne ni personnes mal intentionnées. Essayons de faire plus résistant.

## Résistance aux pannes

Le problème d'une panne réseau est que le nœud ne reçoit pas la mise à jour de la valeur. Une solution est de comparer ce que l'on a avec ce qu'ont ses voisins : à chaque connexion, et idéalement à intervalle régulier (cf. Pour aller plus loin).

Vous pouvez voir une illustration en lançant la commande `node scenarios/panne.js`.

Actuellement, la commande `keys` ne retourne que la liste des clés mais pas l'horodatage. Avec celle-ci, on ne peut pas savoir si une clé a changé. Le code suivant permet d'extraire le champ *date* de chaque clé de la base de données et de construire un dictionnaire.

```Javascript
function extractHorodatage (db) {
  return Object.keys(db).reduce(function (result, key) {
    result[key] = {
      date: db[key].date
    }
    return result
  }, {})
}
// Si db = {a: {value: 'Dublin', date: 123456789}}
// retourne : {a: {date: 123456789}}
```

#### Écrivez une commande `keysAndTime` qui retourne un dictionnaire des clés avec l'horodatage.

Vous pouvez la tester avec `node cli.js keysAndTime`.

Il ne reste plus qu'à appeler la commande `keysAndTime` à la place de `keys` à la synchronisation pour détecter une désynchronisation et la corriger. Quand vous corrigez la valeur, informez vos voisins qui sont peut-être aussi désynchronisés. Attention, ce n'est plus un tableau mais un dictionnaire. Cf. indice ;)

#### Mettez en place la mécanique de détection et de correction.

##### Indice 1 :

```Javascript
for (const key in object) {
  console.log(object[key])
}
// Si object vaut : {a: {date: 123456789}}
// Affiche : {date: 123456789}
```

##### Indice 2 : pour ne pas dupliquer la logique de comparaison, sortez le code de `set` dans une fonction que la commande `set` et `sync` appellent toutes les deux. Quand `sync` l'appelle, il n'y a pas de callback : `callback?.()` n'appelle le callback que s'il existe.

#### Notifiez les voisins du changement.

#### Vérifiez le bon fonctionnement en exécutant `node scenarios/panne.js`.

## C'est toujours un problème de temps

Dans la vie, je suis plutôt optimiste mais en informatique si ça peut mal se passer, ça se passera mal. Et puis, j'ai besoin de ce ressort scénaristique de fou pour vous amener là où je veux : La solution précédente fonctionne ? Vous êtes sûr ?

#### Que se passe-t-il si pour une même date, il y a deux valeurs différentes ?

#### Lancez `node scenarios/horloge.js` et observez.

Pour départager deux valeurs de même date, il suffit d'une règle que tous les nœuds appliquent de la même façon, par exemple garder la plus petite des deux valeurs. Mais comparer les valeurs elles-mêmes oblige à les envoyer à chaque synchronisation. Imaginez si c'est un fichier de plusieurs centaines de Mo ou Go ! On ne va pas envoyer plusieurs To de données à chaque tentative de synchronisation ! À la place, on va comparer l'empreinte de la valeur qui est produite par une fonction de hachage. Une sorte de carte d'identité de la valeur.

## Prenons un peu de *hash*

Une fonction de hachage est une fonction qui prend en entrée un ensemble de données et retourne une empreinte, aussi appelée *hash*, de taille fixe quelle que soit l'entrée. Comme il y a bien plus d'entrées possibles que d'empreintes, deux entrées différentes peuvent avoir la même empreinte : c'est une collision. Une bonne fonction de hachage cryptographique rend pourtant ces cas inexploitables :

* il est en pratique impossible de trouver deux entrées qui ont la même empreinte (résistance aux collisions) ;
* à partir d'une empreinte, il est en pratique impossible de retrouver une entrée qui la produit (résistance à la pré-image).

Une famille de fonctions couramment utilisée est SHA. Voici quelques exemples d'empreinte :

```Bash
> echo "Blockchain" | shasum
# efcf8baf5959ad1ebc7f4950425ef1c2eae9cbd9  -

> echo "Block" | shasum
# d1a6b1157e37bdaad78bec4c3240f0d6c576ad21  -

> echo "Vous commencez à voir le principe ?" | shasum
# 25abec7ced7642b886c1bffbc710cc3439f23ab7  -
```

Une propriété intéressante est qu'une petite modification dans l'entrée change totalement l'empreinte :

```Bash
> echo "Blockchain" | shasum
# efcf8baf5959ad1ebc7f4950425ef1c2eae9cbd9  -

> echo "blockchain" | shasum
# ea5f179324c233b002fa8ac4201fa216001515e5  -
```

Les fonctions de hachage sont couramment utilisées pour vérifier que des données n'ont pas été corrompues lors d'un téléchargement par exemple. Le code suivant permet de produire une empreinte en Javascript.

```Javascript
import crypto from 'crypto'

// Retourne l'empreinte de data.
function getHash (data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}
```

## Spoiler : cette fois, c'est la bonne ... avant l'étape suivante.

#### Ajoutez un champ `hash` dans votre base de données : l'empreinte du champ `value`, calculée avec `getHash`.

#### Modifiez `set` pour calculer l'empreinte de la valeur.

#### Modifiez `set` pour qu'en cas de date identique mais hash différent, on retienne le plus petit.

#### Éditez la commande `keysAndTime` pour ajouter le hash. Elle retourne alors un dictionnaire de la forme `{ Ville: { date: 10000, hash: '5dd2…' } }`.

#### Modifiez votre algorithme de synchronisation pour vérifier le hash et appliquer les modifications comme pour `set`.

#### Lancez `node scenarios/horloge.js` et observez.

#### Garder le plus petit hash est un choix arbitraire. Pourquoi n'importe quelle règle convient-elle, à condition d'être la même sur tous les nœuds ?

Vous êtes maintenant résistant à la panne. Enfin, pas à l'instant T mais c'est déjà pas mal !

## Conclusion

Nous avons mis en place un algorithme de consensus qui résiste aux problèmes de latence et de panne réseau. Pour résister, nous avons ajouté des données et mis en place des échanges d'informations supplémentaires, ce qui représente un coût.

#### Comparez avec les solutions que vous aviez imaginées au début de l'étape.

Ce qu'il faut retenir :

* Un algorithme de consensus permet aux nœuds de se mettre d'accord ; il doit donner le même résultat sur tous les nœuds.
* L'horodatage permet de départager, mais il dépend des horloges et peut être falsifié.
* Pour réparer une désynchronisation, on compare des résumés (date, empreinte) plutôt que les données elles-mêmes.
* Une fonction de hachage produit une empreinte de taille fixe dont il est en pratique impossible de trouver une collision.

Nous n'avons pas traité le troisième cas de désaccords, dus à des utilisateurs potentiellement malveillants. Nous traiterons ce problème à l'étape suivante, en remplaçant « la valeur la plus vieille gagne » par une autre règle : celle de la chaîne la plus longue.

## Pour aller plus loin

#### Synchronisez régulièrement vos nœuds avec leurs voisins (par exemple avec `setInterval`), pour réparer une désynchronisation sans attendre une nouvelle connexion.

## Suite

Allez à l'étape 3 : `git checkout etape-3`.

Pour continuer à lire le sujet :

* soit vous lisez le fichier `README.md` sur votre machine.
* soit sur GitHub, au-dessus de la liste des fichiers, vous pouvez cliquer sur `main` et sélectionner `etape-3`.
