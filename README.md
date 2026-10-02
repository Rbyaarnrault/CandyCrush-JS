# CandyCrush JavaScript

## 1. Description générale du Projet
Ce projet consiste à créer une application web simulant le fonctionnement du CandyCrush. C'est un jeu où le joueur doit interragir avec l'application en échangeant de places 2 bonbons d'une grille de bonbons pour créer des alignements de 3 bonbons ou plus identiques (horizontaux ou verticaux mais pas en diagonales).
Après cela le ou les alignements valides disparaissent pour laisser place à de nouveaux bonbons générés aléatoirement.
Une partie s'arrête quand plus aucun alignement n'est possible.
Chaque bonbon supprimé ajoute un point au score.

Dans notre cas, je choisis une solution technique qui va donner un but au joueur:
Il doit faire le maximum de point en une partie. Le score sera enregistré en mémoire. Lors de parties ultérieures, le joueur devra tenter de battre son meilleur score (Highscore).
C'est la simulation d'un jeu de type arcade.

## 2. Librairies annexes
Ces librairies permettent d'utiliser des fonctions utilitaires indépedemment du contexte. Elles pourraient servir dans plusieurs projets et cela permet d'éviter de les réecrire à chaque fois et de simplifier le code

* **MathsUtils**: Permet des calculs mathématiques 
* **GridUtils**: Permet de manimpuler un tableau

##	3. Présentation globale de l'Architecture du système (Modèle-Vue-Controlleur)
L'organisation de la structure doit séparer la logique métier de la solution technique choisie pour réaliser la vue. Cela permet de pouvoir changer l'un ou l'autre indépendemment en cas de modification des besoins.

**Structure du projet**:
```
	|----/images: Stocke les images associées au bonbons
	|----/audio: Stocke les fichiers audio
	|----/sauvegarde: Stocke le fichier de sauvegarde pour reprendre une partie
	|----/src
	----|----/modele: Logique métier
	----|----/vue: Affichage visuel
	----|----/controlleur: Chef d'orchestre
	|----/librairies: fonctions utilitaires
```

### Modèle(Logique)
* **Class Bonbon:** Permet d'instancier des objets bonbons contenant des 	attributs(couleur, image, (identifiant unique ?)).

* **Structure de données:** **Class Grille** = Objet Tableau en 2D qui va stocker une grille de bonbons (matrice).

* **Attributs de la partie:** **Class Score**, = Gestion des attributs `int scorePartie` et `int highscore`.

* **Gestion des bonbons:** Détection de motifs valides, Supression des
motifs, Génération de nouveaux bonbons, Chute de ces nouveaux bonbons pour remplacer ceux supprimés.

* **Sérialisatino:** Sauvegarde de l'état de la grille (dans un fichier.txt ?), Reprise d'une partie selon cet état sauvegardé

### Vue(Interface)
* **Rendu visuel:** Zone de jeu(canva) pour voir la grille de bonbons, Affichage du score et highscore.

* **Animations:** Echange/suppresion/chute de bonbons, Affichage de la sélection d'un bonbon(Click)
					  
* (Secondaire: **Audio:** Gestion de la musique du jeu et d'effets sonores).
	
### Contrôleur
Le contrôleur fait le lien entre le Modèle et la Vue. Il retranscrit les événements pour que le modèle agisse en conséquence et adapte la vue en retour.
	
* **Evénement:** Capture des MouseEvent(click de souris)
* **Adaptation:** Convertit une coordonnée pixels(x,y) de la Vue en coordonnées(i,j) de la matrice du Modèle.

* **Asynchronisme:** Permet d'alterner entre l'utilisateur qui a la main, puis bloque le système pendant le calcul de la logique et l'affichage des animations
	 

## 4. Gestion de l'asynchronisme
L'application doit suivre une logique asynchrone pour pouvoir laisser la main soit au joueur, soit au navigateur web mais pas les deux en même temps. Cela permet d'assurer une stabilité dans les calculs, ne pas interrompre les méthodes liées au Modèle et à l'affichage de la Vue.

- Quand le navigateur a la main, le joueur ne peut rien faire, sélectionner aucun bonbon.

- Quand le joueur a la main, le navigateur patiente et attend uniquement les mousesEvent, lui permettant de récupérer la main et faire ses calculs.
Cela doit durer jusqu'à la fin d'une partie ou la fermeture de l'application.


**Schéma de l'asynchronisme**:
* 1) **Attente(Main au joueur):** Le jeu est stable, les écouteurs de clics sont actifs.

* 2) **Alternance:** 
		- L'utilisateur effectue un échange de bonbons,
		- Le **Controlleur** active un verrou, informe le **Modèle** d'une modification de donnée,
			- Le **Modèle** calcule/ appelle ses fonctions:
				* **Schéma de boucle** = 
					- Réactivation du verrou (si pas déjà activé),
					- Recherche si de nouveaux motifs sont encore disponibles après échange de bonbons:
						- Simulation sur une copie locale de la matrice avant échange réel?
						
						- Test d'un motif:
							* **Si oui:**
								* Suppression >
								* Génération d'un ou plusieurs bonbons >
								* Chute >
								* Test si un ou plusieurs nouveaux motifs >
								- Tant que la matrice n'est pas stable(motif crée par les nouveaux bonbons directement):
									- Averti le **Controlleur** qui va notifier la **Vue**:
										* La **Vue** lance les animations dédiées au tour de boucle en cours:
											- Affichage de l'échange,
											- Animation de supression de motif,
											- Chute de bonbons.
										* Le **Controlleur** averti le modèle:
											- retour au début de boucle.
								- Matrice stable = 
									- Fin des animations,
									- Libération du verrou par le **Controlleur**.
								
							- **Si non:** le **Controlleur** notifie la **Vue** qui lance son animation d'échange impossible:
								- Libération du verrou(Le joueur récupère la main)
									
					- Fin de partie(Il n'y a plus d'échanges possibles):
						Le **Contrôleur** notifie la **Vue** qui lance son animation de fin.
											
										
							
## 5. Implémentation

### Fonctions clées du Modèle:
* `void initMatrice()`: Génère une grille de bonbons aléatoire, sans se préoccuper des alignements.

* `void echangerBonbons(i1,j1,i2,j2)` : Teste si 2 bonbons adjacents (ligne ou colonne) créés un motif valide.
	- **Si oui**: Fait l'échange de places dans la matrice.
	- **Si non**: Ne fait rien.
* `Boolean verifierMotif(i,j)`: Vérifie si un bonbon appartient à un alignement valide de 3 bonbons ou plus identiques.
* `void supprimerMotif(i,j)`: Supprime tous les bonbons appartenant au motif valide.
* `void augmenterScore()`: Incrémente de 1 le score. Permet l'appel de cette fonction pour chaque bonbon supprimé.
* `Boolean verifierPossibiliteNouveauxMouvement()`: Renvoie vrai si il existe encore un échange possible.
* `void genererNouveauBonbon(j)`: Génère aléatoirement un nouveau bonbon dans la jème colonne de la grille. Ce bonbon viendra combler la case vide la plus basse possible.
* `void sauvegarderProgression(fichier)`: Sauvegarde la progression dans le fichier si existant, sinon le crée.
* `void chargerProgression(fichier)`: Modifie l'état de la matrice pour reprendre une partie:
	- **Seulement si** le fichier existe et si il contient une structure valide de matrice correspondant à un état de partie existant.
										
### Fonctinos clées de la Vue:
* `void dessinerGrille()`: Affichage de l'état actuel de la matrice contenant les images des bonbons

* `Int[] getIndiceMatrice(x,y)`: Convertit les pixels en coordonnées de matrice(i,j) sous la forme d'un [Int,Int]
	- Division de la taille du canva par le nombre de lignes et colonnes de la matrice

* `void animationEchange(i1,j1,i2,j2)`: Echange visuellement la place des 2 images des bonbons (i1,j1) et (i2,j2).
* `void animerChuteBonbon(j)`: Animation verticale lors du comblement des vides par de nouveaux bonbons dans la colonne j.
	

### Fonctions clées du Controlleur:
* `void onClick()`: Detecte et gère le click du premier bonbon, puis du 2ème

* `void validerMouvement()`: Vérifie auprès du modèle si l'échange est valide (va créer un motif).
	
* (Secondaire: `void onOffMusique()`: Active/Désactive la musique du jeu)
					


## 6. Limitations
* **Taille de l'écran** du navigateur: La grille peut est définie de taille fixe par rapport à la taille du canva. Cependant sur un écran trop petit, l'affichage de la Vue pourrait avoir un rendu médiocre car tous les éléments ne pourraient soit pas être alignés, soit sortir de l'écran du navigateur.

* **Gestion d'arrêt forcé**: L'application ne prévoit aucun système en cas de fermeture brutale de l'application. Les derniers événements effectués après ou en cours de sauvegarde, ne seront pas conservés et pourraient même corrompre le fichier de sauvegarde en cours qui le rendrait inutilisable.

* **Score maximum**: N'ayant pas de maximum de score, si un joueur parvenait à emmener un score très haut (suppérieur à 2147483647), la donnée liée au score serait corrompue car elle est de type Int. Il y aurait alors une incohérence (overflow). De manière générale, cela est vrai avec n'importe quel type déclaré si le joueur emmène son score au dela du maximum possible lié au type déclaré.
