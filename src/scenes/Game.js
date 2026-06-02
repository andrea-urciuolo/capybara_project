import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        console.log('Scena Game: Preload in corso...');
    }

    create() {
    console.log('Scena Game: Creata con successo!');
    
    // Recuperiamo le dimensioni della "finestra di gioco" corrente
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Posizioniamo il testo usando le variabili dinamiche (width / 2 e height / 2 è il centro esatto)
    this.add.text(width / 2, height / 2, 'Il Capibara non resiste più...', {
        fontSize: '32px',
        fill: '#00ff00'
    }).setOrigin(0.5);
}

    update() {

    }
}
