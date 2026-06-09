import Phaser from 'phaser';
import Capybara from '../prefabs/Capybara.js';
import UiManager from '../prefabs/UiManager.js';
import Cibo from '../prefabs/Cibo.js';
import Saponetta from '../prefabs/Saponetta.js';
import WhackACapy from '../prefabs/WhackACapy.js';
import ShopManager from '../prefabs/ShopManager.js';
import SaveManager from '../prefabs/SaveManager.js';

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

        // Carica la saponetta
        this.load.image('saponetta', 'assets/images/soap.png');
    }

    create() {
        // Inizializza il gestore per i salvataggi
        this.saveManager = new SaveManager(this);
        const datiCaricati = this.saveManager.caricaGame();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // -- INIZIALIZZAZIONE GRAFICA --

        // Inizializzazione dello sfondo
        const backgroundGraphics = this.add.graphics();
        backgroundGraphics.fillGradientStyle(0x2e1065, 0x2e1065, 0xfbcfe8, 0xfbcfe8, 1);
        backgroundGraphics.fillRect(0, 0, width, height);
        backgroundGraphics.setDepth(-1);

        // Overlay per la notte
        this.overlayNotte = this.add.graphics();
        this.overlayNotte.fillStyle(0x070a1e, 0.75); // Blu notte molto scuro
        this.overlayNotte.fillRect(0, 0, width, height);
        this.overlayNotte.setDepth(0); // Davanti allo sfondo, ma dietro a Capibara (depth 1+) e HUD
        this.overlayNotte.setVisible(false); // Di giorno è invisibile

        // Variabile flag della scena che ci dice se il capybara dorme o no
        this.isNotte = false;

        // Inizializzazione della scritta -- PROVVISORIO --
        this.add.text(width / 2, height / 4, 'Capybara Deh', {
            fontSize: '32px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        // Inizializzazione del Capybara
        this.capybara = new Capybara(this, width / 2, height * 0.75, 'player', datiCaricati);

        // Inizializzazione dell'UI Manager
        this.ui = new UiManager(this);

        //Inizializzazione del Minigioco
        this.minigiocoWhack = new WhackACapy(this);

        // Inizializza lo Shop
        this.shopManager = new ShopManager(this);

        // Inizializzazione della saponetta
        this.saponettaCorrente = null;

        // Inizializzazione dei confini del mondo fisico
        const altezzaMondoFisico = height - 120; // Blocco a 120 pixel dal fondo -- DATI PROVVISORI --
        this.physics.world.setBounds(0, 0, width, altezzaMondoFisico);

        // AUTO-SALVATAGGIO: Salva automaticamente il gioco ogni 10 secondi
        this.time.addEvent({
            delay: 10000,
            callback: () => this.saveManager.salvaGame(),
            callbackScope: this,
            loop: true
        });

        // SALVATAGGIO DI SICUREZZA: Salva anche se l'utente chiude la scheda all'improvviso
        window.addEventListener('beforeunload', () => {
            this.saveManager.salvaGame();
        });
    }

    update() {
        // Se il minigioco è in corso, blocchiamo temporaneamente il rendering dell'HUD standard
        if (this.minigiocoWhack.attivo) return;

        // Ridisegna il Capybara ogni frame
        if (this.capybara) {
            this.capybara.aggiorna();
        }

        // Ridisegna l'UI passandogli come parametri le statistiche del Capybara
        if (this.ui && this.capybara) {
            this.ui.disegna(this.capybara);
        }

    }

    // Gestore dell'infrastruttura del minigioco
    avviaMinigioco() {
        if (this.minigiocoWhack.attivo || this.isNotte) return;

        // Pulizia oggetti attivi
        if (this.ciboCorrente && this.ciboCorrente.active) this.ciboCorrente.destroy();
        if (this.saponettaCorrente && this.saponettaCorrente.active) this.saponettaCorrente.destroy();

        // Nasconde HUD globale
        if (typeof this.ui.setVisibile === "function") this.ui.setVisibile(false);
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                child.setVisible(false);
            }
        });

        // Avvia il Minigioco
        this.minigiocoWhack.avvia();
    }

    // Callback attivata da WhackACapy quando il gioco si conclude
    alTermineDelMinigioco(vittoria) {
        // Ripristina l'HUD globale e tutti i testi standard della scena
        if (typeof this.ui.setVisibile === "function") this.ui.setVisibile(true);
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                child.setVisible(true);
            }
        });

        // Nascondi il punteggio del minigioco
        this.ui.nascondiPunteggioMinigioco();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Forza il Capybara a tornare interattivo
        this.capybara.setInteractive();
        
        // Pulisce l'input del minigioco e reimposta quello standard
        this.capybara.removeAllListeners('pointerdown');
        this.capybara.setupInput();
        
        // Riposiziona a terra, riaccende la fisica e riattiva l'IA della camminata
        this.capybara.setPosition(width / 2, height * 0.75);
        this.capybara.setVisible(true);
        this.capybara.attivaIA();

        // Assegna il premio finale
        if (vittoria) {
            this.capybara.modificaMonete(3);
        }

        // Salvataggio di sicurezza
        this.saveManager.salvaGame();
    }

    // Funzione che modifica lo stato della scena da giorno a notte
    impostaNotte(attiva) {
        if (this.minigiocoWhack.attivo) return;

        this.isNotte = attiva;
        this.overlayNotte.setVisible(attiva);

        // Comunica il cambio di stato al Capibara
        this.capybara.setSonno(attiva);

        // Se diventa notte e c'è del cibo in aria, lo distruggiamo per pulizia
        if (attiva && this.ciboCorrente && this.ciboCorrente.active) {
            this.ciboCorrente.destroy();
        }
    }

    spawnCibo(idCibo, valoreRicarica) {
        // CONTROLLO: Se è notte non puoi far spawnare cibo
        if (this.isNotte) return;

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

    spawnSaponetta() {
        // CONTROLLO: Se c'è già una saponetta attiva o è notte, non fare nulla
        if (this.isNotte) return;
        if (this.saponettaCorrente && this.saponettaCorrente.active) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Randomizza lo spawn della saponetta sull'asse X e setto lo spawn sull'asse Y ad 1/3 dello schermo
        const spawnX = Phaser.Math.Between(50, width - 50);
        const spawnY = height * 0.33;

        // Spawna la saponetta
        this.saponettaCorrente = new Saponetta(this, spawnX, spawnY);

        // Gestione OVERLAP continuo (Finché si toccano e l'utente la trascina, lava)
        this.physics.add.overlap(this.capybara, this.saponettaCorrente, (capy, sapone) => {
            if (sapone.isBeingDragged) {
                // Attiva l'effetto grafico delle bolle
                sapone.attivaBolle(true);

                // Lava il capibara (+0.5 ad ogni frame di contatto)
                capy.lavati(0.5);

                // Riproduci un micro suono ogni tot frame
                if (Phaser.Math.Between(1, 20) === 1) {
                    this.sound.play('verso_2', { volume: 0.1, detune: 1200 }); // Suono distorto acuto come effetto schiuma - PROVVISORIO -
                }

                // Se il Capibara è pulito al 100%, la saponetta si consuma
                if (capy.pulizia >= 100) {
                    sapone.destroy();
                    // TODO: Aggiungi un sound effect per aver finito il lavaggio
                }
            } else {
                sapone.attivaBolle(false);
            }
        }, null, this);
    }

}