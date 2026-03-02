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
        for(let i=0; i<this.nbLignes; i+=1){
            // Je crée une ligne à chaque fois
            this.matrice[i] = [];

            for(let j=0; j<this.nbColonnes; j+=1){
                this.matrice[i][j] = new Bonbon();
            }
        }
        console.log(`Grille de bonbons initialisée`);
        return true;
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

    //Vérifie si un motif existe d'au moins 3 bonbons de même couleurs en ligne ou colonne
    verifierMotif(localMatrice, i,j){
        const couleurMotif = localMatrice[i][j].getCouleur();

        let cptCouleur = 0;
        let idxGauche = j;
        let idxDroite = j+1; // Pour ne pas recompter le bonbon de départ 2 fois dans la gauche et dans la droite
        let idxHaut = i;
        let idxBas = i+1;

        // EN ligne
            //idxGauche
        while((idxGauche>=0) && (localMatrice[i][idxGauche].getCouleur() == couleurMotif)){
            cptCouleur +=1;
            idxGauche -=1;
        }
           
            //Droite
        while((idxDroite<this.nbColonnes) && (localMatrice[i][idxDroite].getCouleur() == couleurMotif)){
            cptCouleur +=1;
            idxDroite +=1;
        }

        if(cptCouleur >= 3){
            return true;
        }else{
            cptCouleur = 0;
        }

        // En colonne
            //Haut
        while((idxHaut>=0) && (localMatrice[idxHaut][j].getCouleur() == couleurMotif)){
            cptCouleur +=1;
            idxHaut -=1;
        }

            //Bas
        while((idxBas<this.nbLignes) && (localMatrice[idxBas][j].getCouleur() == couleurMotif)){
            cptCouleur +=1;
            idxBas +=1;
        }

        if(cptCouleur >= 3){
            return true;
        }

        //Si aucun motif trouvé
        return false;
    }

    echangerBonbon(i1, j1, i2, j2){
        //Duplication de ma matrice profonde
        const matriceTmp = this.matrice.map(ligne => [...ligne]);

        //Simulation d'échange
        let bonbonTmp = matriceTmp[i1][j1];
        matriceTmp[i1][j1] = matriceTmp[i2][j2];
        matriceTmp[i2][j2] = bonbonTmp;

        //Vérification de motif
        //Si oui je fais l'échange sur la vraie matrice
        if( this.verifierMotif(matriceTmp, i1,j1) || this.verifierMotif(matriceTmp, i2,j2)){
            bonbonTmp = this.matrice[i1][j1];
            this.matrice[i1][j1] = this.matrice[i2][j2];
            this.matrice[i2][j2] = bonbonTmp;
            return true;
        }else{
            return false;
        }
    }

    genererNouveauBonbon(j){
        let mouvement = false;

        // Parcours de la colonne j de bas en haut
        for (let i=this.nbLignes-1; i>=0; i-=1){

            if(this.matrice[i][j] == null){
                if(i == 0){ // première ligne
                    //Nouveau Bonbon
                    this.matrice[i][j] = new Bonbon();

                }else{
                    if(this.matrice[i-1][j] != null){
                        // Sinon on fait descendre d'une ligne celui situé au dessus
                        this.matrice[i][j] = this.matrice[i-1][j];
                        this.matrice[i-1][j] = null;
                    }else{
                        //Si bonbon du dessus null, on remonte encore
                        continue;
                    }
                }
                mouvement =  true;
                break;
            }
        }
        return mouvement;
    }

    supprimerMotif(i, j, objetScore) {
        const couleurCible = this.matrice[i][j].getCouleur();
        
        //Motif Horizontal
        let listeHoriz = [{ ligne: i, col: j }]; // On commence avec le bonbon cliqué
        
        let gauche = j - 1;
        while (gauche >= 0 && this.matrice[i][gauche] !== null && this.matrice[i][gauche].getCouleur() === couleurCible) {
            listeHoriz.push({ ligne: i, col: gauche });
            gauche-=1;
        }
        
        let droite = j + 1;
        while (droite < this.nbColonnes && this.matrice[i][droite] !== null && this.matrice[i][droite].getCouleur() === couleurCible) {
            listeHoriz.push({ ligne: i, col: droite });
            droite+=1;
        }

        //Motif Vertical
        let listeV = [{ ligne: i, col: j }];
        
        let haut = i - 1;
        while (haut >= 0 && this.matrice[haut][j] !== null && this.matrice[haut][j].getCouleur() === couleurCible) {
            listeV.push({ ligne: haut, col: j });
            haut-=1;
        }
        
        let bas = i + 1;
        while (bas < this.nbLignes && this.matrice[bas][j] !== null && this.matrice[bas][j].getCouleur() === couleurCible) {
            listeV.push({ ligne: bas, col: j });
            bas+=1;
        }

        // Si les deux sont présents en même temps , je préfère priviligier le motif horizontal, car cela change plus de colonnes et donc de possibilités
        if (listeHoriz.length >= 3) {
            console.log("Suppression horizontale");
            for (let k = 0; k < listeHoriz.length; k++) {
                let pos = listeHoriz[k];
                this.matrice[pos.ligne][pos.col] = null; // On vide la case
                objetScore.augmenterScore(1); // +1 point par bonbon
            }
        } 
    
        else if (listeV.length >= 3) {
            console.log("Suppression verticale");
            for (let k = 0; k < listeV.length; k++) {
                let pos = listeV[k];
                this.matrice[pos.ligne][pos.col] = null; 
                objetScore.augmenterScore(1);
            }
        }
    }


    verifierPossibiliteNouveauxMouvement() {
        //Parcours de la grille
        for (let i = 0; i < this.nbLignes; i++) {
            for (let j = 0; j < this.nbColonnes; j++) {
                
                //Droite
                if (j + 1 < this.nbColonnes) {
                    if (this.simulerEtVerifierEchange(i, j, i, j + 1)) {
                        return true; //Possible
                    }
                }

                //Bas
                if (i + 1 < this.nbLignes) {
                    if (this.simulerEtVerifierEchange(i, j, i + 1, j)) {
                        return true; 
                    }
                }
            }
        }
        //Si pas trouvé
        return false;
    }

    //Fonction utile
    simulerEtVerifierEchange(i1, j1, i2, j2) {
        //Duplication de la matrice
        const matriceTmp = this.matrice.map(ligne => [...ligne]);

        //Simulation de l'échange
        let temp = matriceTmp[i1][j1];
        matriceTmp[i1][j1] = matriceTmp[i2][j2];
        matriceTmp[i2][j2] = temp;

        //Motif ?
        if (this.verifierMotif(matriceTmp, i1, j1) || this.verifierMotif(matriceTmp, i2, j2)) {
            return true;
        }
        
        return false;
    }

    //Gestion de la sauvegarde
    sauvegarderProgression(objetScore) {
        const datas = {
            //Attributs à sauvegarder
            lignes: this.nbLignes,
            colonnes: this.nbColonnes,
            matriceCouleurs: this.matrice.map(ligne => ligne.map(b => b ? b.getCouleur() : null)),
            scorePartie: objetScore.scorePartie,
            highscore: objetScore.highscore
        };

        localStorage.setItem('candyCrush_save', JSON.stringify(datas));
        console.log("Progression sauvegardée.");
    }

    chargerProgression() {
        const sauvegarde = localStorage.getItem('candyCrush_save');
        if (!sauvegarde) return null;

        try {
            const datas = JSON.parse(sauvegarde);
            
            // Reconstruction de la matrice
            for (let i = 0; i < this.nbLignes; i++) {
                for (let j = 0; j < this.nbColonnes; j++) {
                    const couleur = datas.matriceCouleurs[i][j];
                    if (couleur) {
                        const nouveauBonbon = new Bonbon();
                        nouveauBonbon.couleur = couleur;
                        nouveauBonbon.associerImage(couleur);
                        this.matrice[i][j] = nouveauBonbon;

                    } else {
                        this.matrice[i][j] = null;
                    }
                }
            }
            return datas;
        } catch (e) {
            return null;
        }
    }
}