import Phaser from 'phaser';
import Capybara from '../prefabs/Capybara.js';
import UiManager from '../prefabs/UiManager.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        console.log('Scena Game: Preload in corso...');
        
        // Carica gli sprite del Capybara
        this.load.image('player', 'assets/images/capybara.png');

        // Carica i versi del Capybara
        this.load.audio('verso_1', 'assets/audio/capybara_sound_1.mp3');
        this.load.audio('verso_2', 'assets/audio/capybara_sound_2.mp3');
    }

    create() {    
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
    
        this.add.text(width / 2, height / 4, 'Capybara Deh', {
            fontSize: '32px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        // Inizializzazione del Capybara
        this.capybara = new Capybara(this, width / 2, height * 0.75, 'player');

        // Inizzializzazione dell'UI Manager
        this.ui = new UiManager(this);
    }

    update() {
        // Ridisegna il Capybara ogni frame
        if (this.capybara) {
            this.capybara.aggiorna();
        }

        // Ridisegna l'UI passandogli come parametri le statistiche del Capybara
        if (this.ui && this.capybara) {
            this.ui.disegna(this.capybara);
        }

    }
}