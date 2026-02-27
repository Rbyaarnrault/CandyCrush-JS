import MathsUtils from '../../librairies/MathsUtils.js';

const CouleurBonbon = {
    BLEU: 'Bleu', 
    VERT: 'Vert',
    ORANGE: 'Orange', 
    ROUGE: 'Rouge', 
    JAUNE: 'Jaune'
};

class Bonbon{
    constructor(){
        this.couleur = this.setCouleurRandom();
        this.image = new Image();
        this.associerImage(this.couleur);
    }

    //choisis aléatoirement une couleur qui determinera le type du bonbon selon le nombre de couleurs disponibles
    setCouleurRandom(){
        const couleurs = Object.values(CouleurBonbon); //liste de l'énumération CouleurBonbon
        return  couleurs[MathsUtils.genererIntAleatoire(couleurs.length)];
    }

    associerImage(choixCouleur){
        const chemin = `../../images/${choixCouleur}.png`;
        this.image.src = chemin;
        
        // Gestion de l'erreur de chargement
        this.image.onerror = () => {
            console.error(`Erreur lors du chargement de l'image ${chemin}`);
        };
    }

    getCouleur(){
        return this.couleur;
    }

    getImage(){
        return this.image;
    }
}

export {Bonbon, CouleurBonbon};