import Phaser from 'phaser';
import Capybara from '../prefabs/Capybara.js';
import UiManager from '../prefabs/UiManager.js';
import Cibo from '../prefabs/Cibo.js';
import Saponetta from '../prefabs/Saponetta.js';

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
        this.capybara = new Capybara(this, width / 2, height * 0.75, 'player');

        // Inizializzazione dell'UI Manager
        this.ui = new UiManager(this);

        // Inizializzazione della saponetta
        this.saponettaCorrente = null;

        // Inizializzazione dei confini del mondo fisico
        const altezzaMondoFisico = height - 120; // Blocco a 120 pixel dal fondo -- DATI PROVVISORI --
        this.physics.world.setBounds(0, 0, width, altezzaMondoFisico);

        // Inizializzazione variabili per il minigioco
        this.minigiocoAttivo = false;
        this.punteggioMinigioco = 0;
        this.minigameTimer = null;

        // Testo del punteggio
        this.testoPunteggio = this.add.text(width / 2, 80, '', {
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2e1065',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(20).setVisible(false);
    }

    update() {
        // Se il minigioco è in corso, blocchiamo temporaneamente il rendering dell'HUD standard
        if (this.minigiocoAttivo) return;

        // Ridisegna il Capybara ogni frame
        if (this.capybara) {
            this.capybara.aggiorna();
        }

        // Ridisegna l'UI passandogli come parametri le statistiche del Capybara
        if (this.ui && this.capybara) {
            this.ui.disegna(this.capybara);
        }

    }

    // Funzione che gestisce la logica di attivazione del minigioco
    avviaMinigioco() {
        if (this.minigiocoAttivo || this.isNotte) return;

        this.minigiocoAttivo = true;
        this.punteggioMinigioco = 0;

        // Pulizia e interruzione elementi attivi a schermo
        if (this.ciboCorrente && this.ciboCorrente.active) this.ciboCorrente.destroy();
        if (this.saponettaCorrente && this.saponettaCorrente.active) this.saponettaCorrente.destroy();

        // Nascondi l'interfaccia utente standard
        if (typeof this.ui.setVisibile === "function") {
            this.ui.setVisibile(false); 
        }
        // Forza una pulizia dello schermo cancellando i vecchi testi dell'UI se necessario
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && child !== this.testoPunteggio) {
                child.setVisible(false);
            }
        });

        // Mostra e resetta la grafica del punteggio del minigioco
        this.testoPunteggio.setText(`Punti: 0 / 10`);
        this.testoPunteggio.setVisible(true);

        // Disattiva i movimenti casuali dell'IA del Capybara
        this.capybara.disattivaIA();
        
        // Rimuove l'evento pointerdown del salto
        this.capybara.removeAllListeners('pointerdown');

        // Aggancia la logica di cattura del minigioco
        this.capybara.on('pointerdown', () => {
            this.gestisciCatturaCapybara();
        });

        // Inizia il loop delle apparizioni
        this.generaApparizione();
    }

    // Funzione che gestisce la logica di apparizione dei target nel minigioco
    generaApparizione() {
        if (!this.minigiocoAttivo) return;

        // Controllo vittoria: se ha raggiunto 10 punti il gioco finisce
        if (this.punteggioMinigioco >= 10) {
            this.terminaMinigioco(true);
            return;
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Calcola una posizione completamente casuale nello schermo lasciando margini di sicurezza
        const randomX = Phaser.Math.Between(100, width - 100);
        const randomY = Phaser.Math.Between(150, height - 150);

        // Posiziona il capybara e forzane la visibilità
        this.capybara.setPosition(randomX, randomY);
        this.capybara.setVisible(true);

        // Imposta un tempo massimo per cliccare (1.2 secondi) prima che si nasconda
        this.minigameTimer = this.time.delayedCall(1200, () => {
            this.capybara.setVisible(false);
            
            // Pausa a schermo vuoto di 400 millisecondi prima della prossima ricomparsa
            this.time.delayedCall(400, () => {
                this.generaApparizione();
            });
        });
    }

    // Funzione che gestisce il click del capybara nel minigame
    gestisciCatturaCapybara() {
        // Il giocatore ha fatto in tempo: elimina il timer di sparizione automatica
        if (this.minigameTimer) this.minigameTimer.remove();

        // Incrementa punteggio e aggiorna interfaccia
        this.punteggioMinigioco++;
        this.testoPunteggio.setText(`Punti: ${this.punteggioMinigioco} / 10`);
        this.capybara.modificaMonete(1);

        // Riproduce un verso random di feedback positivo
        const suonoFeedback = Phaser.Math.Between(1, 2);
        this.sound.play(`verso_${suonoFeedback}`, { volume: 0.6 });

        // Nasconde il capybara all'istante
        this.capybara.setVisible(false);

        // Breve attesa e poi genera la prossima posizione
        this.time.delayedCall(300, () => {
            this.generaApparizione();
        });
    }

    terminaMinigioco(vittoria) {
        this.minigiocoAttivo = false;
        if (this.minigameTimer) this.minigameTimer.remove();

        // Nascondi la grafica del minigioco
        this.testoPunteggio.setVisible(false);

        // Ripristina la visibilità di tutti i testi e dell'HUD standard
        if (typeof this.ui.setVisibile === "function") {
            this.ui.setVisibile(true);
        }
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && child !== this.testoPunteggio) {
                child.setVisible(true);
            }
        });

        // Riposiziona il Capybara alle coordinate fisse iniziali della terra ferma
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.capybara.setPosition(width / 2, height * 0.75);
        this.capybara.setVisible(true);

        // Reset dei listener di input del minigioco e ripristino del comportamento standard (salto)
        this.capybara.removeAllListeners('pointerdown');
        this.capybara.setupInput();

        // Riattiva l'intelligenza artificiale per i movimenti casuali a terra
        this.capybara.attivaIA();

        if (vittoria) {
            this.capybara.modificaMonete(3);
        }
    }

    // Funzione che modifica lo stato della scena da giorno a notte
    impostaNotte(attiva) {
        if (this.minigiocoAttivo) return;

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