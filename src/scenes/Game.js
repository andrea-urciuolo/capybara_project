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

        // Carica gli sprite del cibo
        this.load.image('pomodoro', 'assets/images/tomato.png');
        this.load.image('foglia', 'assets/images/leaf.png');
        this.load.image('anguria', 'assets/images/watermelon.png');
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

        // Impostiamo i confini del mondo fisico: X=0, Y=0, Larghezza totale, Altezza ridotta per lasciare spazio all'HUD
        const altezzaMondoFisico = height - 120; // Blocco a 120 pixel dal fondo (regolabile in base all'altezza dell'HUD)
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
        if (this.ciboCorrente && this.ciboCorrente.active) {
            console.log("Scena Game: C'è già del cibo sullo schermo! Finisci questo prima.");
            return; 
        }

        console.log(`Scena Game: Spawno il cibo di tipo ${idCibo}`);

        // Salviamo il valore di ricarica in una variabile di istanza della scena
        this.ricaricaCiboCorrente = valoreRicarica;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Creiamo l'oggetto fisico del cibo al centro dello schermo
        // Usiamo l'idCibo come chiave della texture (es. 'pomodoro')
        this.ciboCorrente = this.physics.add.image(width / 2, height / 2, idCibo);
        this.ciboCorrente.setScale(0.08); // Regola la scala in base alla dimensione della tua immagine
        this.ciboCorrente.body.setAllowGravity(true); // Niente gravità, deve fluttuare finché non lo trasciniamo
        this.ciboCorrente.setCollideWorldBounds(true); // Dice al cibo di scontrarsi con i confini del mondo
        this.ciboCorrente.setBounce(0.3);

        // Abilitiamo il Drag & Drop (Trascinamento) su Phaser per questo oggetto
        this.ciboCorrente.setInteractive({ draggable: true });

        // 1. INIZIO TRASCINAMENTO: Quando il giocatore afferra il cibo
        this.ciboCorrente.on('dragstart', (pointer) => {
            // Disattiviamo la gravità e azzeriamo la velocità così non cade mentre lo teniamo in mano
            this.ciboCorrente.body.setAllowGravity(false);
            this.ciboCorrente.setVelocity(0, 0);
        });

        // 2.DURANTE IL TRASCINAMENTO: Segue il movimento del mouse/dito
        this.ciboCorrente.on('drag', (pointer, dragX, dragY) => {
            this.ciboCorrente.x = dragX;
            this.ciboCorrente.y = dragY;
        });

        // 3. FINE TRASCINAMENTO: Quando il giocatore rilascia il cibo
        this.ciboCorrente.on('dragend', (pointer) => {
            // Riattiviamo la gravità per farlo cadere di nuovo se non ha toccato il capibara
            this.ciboCorrente.body.setAllowGravity(true);
        });

        // Controlliamo se il cibo tocca il capibara
        this.physics.add.overlap(this.capybara, this.ciboCorrente, () => {
            this.manciaCibo();
        }, null, this);
    }

    manciaCibo() {
        // Sicurezza: se per qualche motivo il cibo è già stato rimosso, usciamo
        if (!this.ciboCorrente || !this.ciboCorrente.active) return;

        // Default di sicurezza: se la variabile non è definita per qualche motivo, usa 15
        const puntiRicarica = this.ricaricaCiboCorrente || 15;

        console.log("Scena Game: Il Capibara ha mangiato!");

        // 1. Ricarichiamo la fame del Capibara (es. di 20 punti, massimo 100)
        this.capybara.fame = Math.min(100, this.capybara.fame + puntiRicarica);

        // 2. Facciamo fare un verso di gioia al Capibara
        const versoCasuale = Phaser.Math.Between(1, 2);
        this.sound.play(`verso_${versoCasuale}`, { volume: 0.6 }); // TODO: Aggiungi suoni nuovi per aver mangiato

        // 3. Facciamo fare un piccolo sobbalzo al Capibara per dare feedback visivo
        this.tweens.add({
            targets: this.capybara,
            scaleX: 0.35, // Si allarga un secondo
            scaleY: 0.25, // Si schiaccia (effetto masticazione/gioia)
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });

        // 4. Distruggiamo definitivamente l'oggetto cibo dal motore di gioco
        this.ciboCorrente.destroy();
}
}