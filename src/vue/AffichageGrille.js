export class AffichageGrille{

    constructor(canvas, modeleGrille){
        this.canvas = canvas;
        this.contexte = canvas.getContext('2d');
        this.modele = modeleGrille;

        let longCase = this.canvas.width / this.modele.nbColonnes;
        let largCase = this.canvas.height / this.modele.nbLignes;

        //Pour que j'ai une case carrée à l'affichage
        this.tailleCase = Math.min(longCase, largCase);
    }

    dessinerGrille(){
        this.contexte.clearRect(0,0, this.canvas.width, this.canvas.height);

        for(let i=0; i<this.modele.nbLignes; i++){
            for(let j=0; j<this.modele.nbColonnes; j++){

                let bonbon = this.modele.getBonbon(i,j);

                if(bonbon){
                    let image = bonbon.getImage();

                    if(image.complete){ //chargement de l'image terminé ?
                        this.contexte.drawImage(image, j*this.tailleCase, i*this.tailleCase,this.tailleCase,this.tailleCase);
               
                    }
                }
            }
        }
    }
}