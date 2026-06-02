import Phaser from 'phaser';
import Capybara from '../prefabs/Capybara.js';

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

        // --- SEZIONE UI BASILARE ---
        this.uiGraphics = this.add.graphics();

        // Definiamo la posizione di partenza della nostra UI (in alto a sinistra)
        this.uiX = 50;
        this.uiY = 50;
        this.barraLarghezzaMax = 150; // Lunghezza della barra quando la statistica è a 100
        this.barraAltezza = 15;       // Spessore della barra
    }

    update() {
        if (this.capybara) {
            this.capybara.aggiorna();
        }

        // Aggiorniamo la grafica della UI solo se il Capibara esiste
        if (this.capybara && this.uiGraphics) {
            // 1. Puliamo i vecchi disegni del fotogramma precedente
            this.uiGraphics.clear();

            // 2. DISEGNIAMO LA BARRA DELLA FAME (Colore Rosso/Arancio)
            // Sfondo grigio della barra (il "contenitore" vuoto)
            this.uiGraphics.fillStyle(0x34495e, 1);
            this.uiGraphics.fillRect(this.uiX, this.uiY, this.barraLarghezzaMax, this.barraAltezza);
            // Barra colorata dinamica
            const larghezzaFame = (this.capybara.fame / 100) * this.barraLarghezzaMax;
            this.uiGraphics.fillStyle(0xe67e22, 1); // Arancione
            this.uiGraphics.fillRect(this.uiX, this.uiY, larghezzaFame, this.barraAltezza);

            // 3. DISEGNIAMO LA BARRA DELLA FELICITÀ (Colore Rosa/Magenta)
            // Spostiamo la Y più in basso di 25 pixel per non sovrapporle
            const yFelicita = this.uiY + 25;
            this.uiGraphics.fillStyle(0x34495e, 1);
            this.uiGraphics.fillRect(this.uiX, yFelicita, this.barraLarghezzaMax, this.barraAltezza);
        
            const larghezzaFelicita = (this.capybara.felicita / 100) * this.barraLarghezzaMax;
            this.uiGraphics.fillStyle(0xe91e63, 1); // Rosa gajardo
            this.uiGraphics.fillRect(this.uiX, yFelicita, larghezzaFelicita, this.barraAltezza);

            // 4. DISEGNIAMO LA BARRA DELL'ENERGIA (Colore Giallo)
            const yEnergia = this.uiY + 50;
            this.uiGraphics.fillStyle(0x34495e, 1);
            this.uiGraphics.fillRect(this.uiX, yEnergia, this.barraLarghezzaMax, this.barraAltezza);
        
            const larghezzaEnergia = (this.capybara.energia / 100) * this.barraLarghezzaMax;
            this.uiGraphics.fillStyle(0xf1c40f, 1); // Giallo fiammante
            this.uiGraphics.fillRect(this.uiX, yEnergia, larghezzaEnergia, this.barraAltezza);
        }
    }
}