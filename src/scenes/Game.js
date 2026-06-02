import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        console.log('Scena Game: Preload in corso...');
        this.load.image('player', 'assets/images/capybara.png');
    }

    create() {
    console.log('Scena Game: Creata con successo!');
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.add.text(width / 2, height / 4, 'Capybara Deh', {
        fontSize: '32px',
        fill: '#00ff00'
    }).setOrigin(0.5);

    this.player = this.add.image(width / 2, height / 2, 'player');
    this.player.setScale(0.3);
}

    update() {

    }
}
