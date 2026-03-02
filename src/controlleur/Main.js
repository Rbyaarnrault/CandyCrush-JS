import {Grille} from '../modele/Grille.js';
import { AffichageGrille } from '../vue/AffichageGrille.js';
import {Score} from '../modele/Score.js';

export class Main{
    constructor(){
        //Verrou
        this.verouille = false;

        this.nbLignes = 6;
        this.nbColonnes = 6;

        //Modèle
        this.grille = new Grille(this.nbLignes, this.nbColonnes);
        this.score = new Score(); //Score + Highscore

        //Sauvegarde Existante ?
        const datasSauvegarde = this.grille.chargerProgression();
        if(datasSauvegarde){
            this.score.scorePartie = datasSauvegarde.scorePartie;
            this.score.highscore = datasSauvegarde.highscore;
        }

        //Vue
        this.canvas = document.getElementById('zoneJeu');
        this.vue = new AffichageGrille(this.canvas, this.grille);

        this.premierClick = null;
        this.offsets = {};

        this.updateVue();
        this.initEvenements();

        this.initialiserJeu();
    }

    //Pour le début du jeu, supprime les motifs mais sans augmenter le score
    async initialiserJeu(){
        this.verouille = true;
        await this.resoudreGrille(true);
        this.score.resetScore();
        this.verouille = false;
    }

    initEvenements(){
        //Gestion du click Utilisateur
        this.canvas.addEventListener('click', (event) => {

            //Verrou bloquant
            if (this.verouille){
                return;
            }else{
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX-rect.left;
                const y = event.clientY-rect.top;

                //Conversion pixel en Indice de matrice
                const j = Math.floor(x/this.vue.tailleCase);
                const i = Math.floor(y/this.vue.tailleCase);

                if((i < this.grille.nbLignes) && (j < this.grille.nbColonnes)){
                    this.cliquerBonbon(i,j);
                }
            }
        });

        document.getElementById('btnReset').addEventListener('click', ()=>{
            if (confirm("Voulez-vous Supprimer la sauvegarde ?")){
                localStorage.removeItem('candyCrush_save');
                localStorage.removeItem('candyCrushHighscore');

                window.location.reload();

                console.log("Réinitialisation OK");
            }
        })
    }

    async cliquerBonbon(i,j){
        // Pas encore de bonbons cliqués
        if (this.premierClick == null){
            this.premierClick = {i,j};
            console.log(`case ${i},${j} cliquée`);

        }else{
            //Enregistrement
            const i2 = this.premierClick.i;
            const j2 = this.premierClick.j

            //Le deuxième click doit être adjacent au premier
            const estAdjacent = (Math.abs(i - i2) + Math.abs(j - j2) === 1);

            if (estAdjacent){
                this.verouille = true; //Activation du verrou, le navigateur a la main

                const motifTrouve = this.grille.echangerBonbon(i, j, i2, j2);

                if (motifTrouve){
                    await this.attendre(300); //Pause
                    await this.resoudreGrille();
                    this.verouille = false; //Désactivation, le joueur reprend la main
                    console.log("Echange Réussi");
                }else{
                    console.log("Echange échoué : pas de motif valide");
                }
                this.verouille = false;
            }else{
                console.log("Les 2 bonbons cliqués ne sont pas adjacents");
            }

            //Déselection
            this.premierClick = null;
        }
    }

    async resoudreGrille(ignoreScore = false) {
        this.verouille = true; // Verrou activé
        let motif = this.detecterUnMotif(); // Fonction simple qui parcourt et renvoie le premier {i,j} trouvé
        let scoreATraiter = null;

        while (motif) {
            if (ignoreScore){
                scoreATraiter = {augmenterScore:()=>{}};
            }else{
                scoreATraiter = this.score;
            }

            await this.attendre(500); 

            this.grille.supprimerMotif(motif.i, motif.j, scoreATraiter);
            await this.attendre(500); // Temps pour voir la suppression

            // Chute progressive
            for (let j = 0; j < this.grille.nbColonnes; j++) {
                // Tant qu'on peut faire descendre un bonbon dans cette colonne
                while (this.grille.genererNouveauBonbon(j)) {
                    // CETTE PAUSE est cruciale pour voir le bonbon descendre case par case
                    await this.attendre(100); 
                }
            }
            
            // On vérifie si de nouveaux motifs sont apparus après la chute
            motif = this.detecterUnMotif();
            
        }
        this.grille.sauvegarderProgression(this.score);
    }

    detecterUnMotif(){
        //Parcours de toute la grille
        for(let i=0; i<this.nbLignes; i+=1){
            for(let j=0; j<this.nbColonnes; j+=1){

                // Je rregarde si c'est un motif valide
                if(this.grille.verifierMotif(this.grille.matrice, i, j)){
                    //Si oui je retourne le couple de coordonnées
                    return {i: i, j: j};
                }
            }
        }
        return null;
    }

    async faireChuterFluide(colonne){
        let aBouge = this.grille.genererNouveauBonbon(colonne);

        if(aBouge){
            let depart = performance.now()
            let duree = 200;

            return new Promise(resolve => {
                const animer = (now)=>{
                    let progression = (now - depart)/ duree;
                    if (progression>1){
                        progression = 1;
                    }

                    //Calcul de l'offset
                    let offset = (1-progression) * -this.vue.tailleCase;

                    this.vue.setOffsetColonne(colonne, offset);

                    if (progression <1){
                        requestAnimationFrame(animer);
                    }else{
                        this.vue.setOffsetColonne(colonne, 0);
                        resolve();
                    }
                };
                 requestAnimationFrame(animer);
            });
        }
    }
    

    //Affichage de lagrille
    updateVue(){
        this.vue.dessinerGrille(this.premierClick, this.offsets, this.score);
        requestAnimationFrame(this.updateVue.bind(this));
    }

    attendre(ms){
        return new Promise(resolve=> setTimeout(resolve,ms));
    }

    setOffsetColonne(colonne, offset) {
        
    }
}
