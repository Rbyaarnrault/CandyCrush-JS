import {Bonbon} from './Bonbon.js';

export class Grille {
    constructor(nbLignes, nbColonnes){
        this.nbLignes = nbLignes;
        this.nbColonnes = nbColonnes;
        this.matrice = [];
        this.initMatrice();
    }


    initMatrice() {
        this.matrice = [];
        for(let i=0; i<this.nbLignes; i++){
            // Je crée une ligne à chaque fois
            this.matrice[i] = [];

            for(let j=0; j<this.nbColonnes; j++){
                this.matrice[i][j] = new Bonbon();
            }
        }
        console.log(`Grille de bonbons initialisée`);
    }

    // Retourne le bonbon située à la place i,j dans la grille si il existe
    getBonbon(i,j){
        if (this.matrice[i]){ //ligne existante ?
            if (this.matrice[i][j]){ //Bonbon?
                return this.matrice[i][j];
            }
        }
        return null;
    }
}