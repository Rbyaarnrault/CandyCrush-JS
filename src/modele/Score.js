export class Score{
    constructor(){
        this.scorePartie = 0;
        this.highscore = parseInt(localStorage.getItem('candyCrushHighscore')) || 0;
    }

    augmenterScore(points){
        this.scorePartie += points;

        //Meilleur score atteint ?
        if(this.scorePartie > this.highscore){
            this.highscore = this.scorePartie;
            localStorage.setItem('candyCrushHighscore', this.highscore);
        }
    }

    resetScore(){
        this.scorePartie = 0;
    }
}