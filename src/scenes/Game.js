import Phaser from 'phaser';
import Capybara from '../prefabs/Capybara.js';
import UiManager from '../prefabs/UiManager.js';
import Cibo from '../prefabs/Cibo.js';

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

        // Carica gli sprite del cibo
        this.load.image('pomodoro', 'assets/images/tomato.png');
        this.load.image('foglia', 'assets/images/leaf.png');
        this.load.image('anguria', 'assets/images/watermelon.png');
    }

    create() {    
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // -- INIZIALIZZAZIONE GRAFICA --

        // Inizializzazione dello sfondo
        const backgroundGraphics = this.add.graphics();
        backgroundGraphics.fillGradientStyle(0x2e1065, 0x2e1065, 0xfbcfe8, 0xfbcfe8, 1);
        backgroundGraphics.fillRect(0, 0, width, height);
        backgroundGraphics.setDepth(-1);
    
        // Inizializzazione della scritta -- PROVVISORIO --
        this.add.text(width / 2, height / 4, 'Capybara Deh', {
            fontSize: '32px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        // Inizializzazione del Capybara
        this.capybara = new Capybara(this, width / 2, height * 0.75, 'player');

        // Inizzializzazione dell'UI Manager
        this.ui = new UiManager(this);

        // Inizializzazione dei confini del mondo fisico
        const altezzaMondoFisico = height - 120; // Blocco a 120 pixel dal fondo -- DATI PROVVISORI --
        this.physics.world.setBounds(0, 0, width, altezzaMondoFisico);
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

    spawnCibo(idCibo, valoreRicarica) {
        // CONTROLLO: Se esiste già un cibo sullo schermo, interrompiamo la funzione e non facciamo nulla
        if (this.ciboCorrente && this.ciboCorrente.active) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Randomizza lo spawn del cibo sull'asse X e setto lo spawn sull'asse Y ad 1/3 dello schermo
        const spawnX = Phaser.Math.Between(50, width - 50);
        const spawnY = height * 0.33;

        // Crea il nuovo cibo
        this.ciboCorrente = new Cibo(this, spawnX, spawnY, idCibo, valoreRicarica);

        // Gestione dell'overlap
        this.physics.add.overlap(this.capybara, this.ciboCorrente, (capy, cibo) => {
            capy.mangia(cibo);
        }, null, this);
    }

}