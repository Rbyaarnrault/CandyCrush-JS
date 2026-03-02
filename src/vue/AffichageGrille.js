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

    dessinerGrille(click = null, offsets = {}, score = null){ // paramètre par défault
        this.contexte.clearRect(0,0, this.canvas.width, this.canvas.height);

        for(let i=0; i<this.modele.nbLignes; i++){
            for(let j=0; j<this.modele.nbColonnes; j++){

                let bonbon = this.modele.getBonbon(i,j);

                if(bonbon){
                    let image = bonbon.getImage();
                    let offsetY = (offsets[`${i},${j}`] || 0);

                    if(image.complete){ //chargement de l'image terminé ?
                        //Offset pour créer le décalage quand une animation est en cours
                        this.contexte.drawImage(image, j*this.tailleCase, (i*this.tailleCase) + offsetY ,this.tailleCase,this.tailleCase);
                    }

                }

                //Dessin du cadre autour du bonbon
                if (click && click.i === i && click.j === j){
                    this.contexte.strokeStyle = "white";
                    this.contexte.lineWidth = 3;
                    this.contexte.strokeRect(j * this.tailleCase, i * this.tailleCase, this.tailleCase, this.tailleCase);
                }
            }
        }
        if (score) { this.dessinerInterface(score);}
    }

    dessinerInterface(score){
        this.contexte.fillStyle = "black";
        this.contexte.font =  " bold 20px Arial";

        this.contexte.fillText(`Score: ${score.scorePartie}`, 10, 25);
        this.contexte.fillText(`Highscore: ${score.highscore}`, 10, 50);
    }
}