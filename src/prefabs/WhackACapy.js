import Phaser from 'phaser';

export default class WhackACapy {
    constructor(scene) {
        this.scene = scene;
        this.attivo = false;
        this.punteggio = 0;
        this.timerScomparsa = null;
        
        // Configurazione tempi (espressi in millisecondi)
        this.tempoLimiteAparizione = 1200; 
        this.pausaTraApparizioni = 400;
        this.pausaDopoCattura = 300;
    }

    avvia() {
        if (this.attivo) return;

        this.attivo = true;
        this.punteggio = 0;

        const capy = this.scene.capybara;

        // Configura il testo del punteggio nella scena tramite UiManager
        this.scene.ui.mostraPunteggioMinigioco(0);

        // Disattiva l'IA e spegne il corpo fisico rigido
        capy.disattivaIA();

        // Rimuove i vecchi listener e aggancia l'evento del minigioco
        capy.removeAllListeners('pointerdown');
        capy.on('pointerdown', () => this.gestisciCattura());

        // Fai partire il gioco
        this.generaApparizione();
    }

    generaApparizione() {
        if (!this.attivo) return;

        // Controllo vittoria
        if (this.punteggio >= 10) {
            this.disattivaETermina(true);
            return;
        }

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const capy = this.scene.capybara;

        // Calcola coordinate random all'interno della schermata
        const randomX = Phaser.Math.Between(100, width - 100);
        const randomY = Phaser.Math.Between(150, height - 150);

        // Sposta lo sprite in modo diretto (funziona istantaneamente perché il body è disattivato)
        capy.setPosition(randomX, randomY);
        capy.setVisible(true);

        // Riattiva l'interattività specifica per questo turno
        capy.setInteractive();

        // Timer di scomparsa automatica se l'utente non lo clicca in tempo
        this.timerScomparsa = this.scene.time.delayedCall(this.tempoLimiteAparizione, () => {
            capy.setVisible(false);
            this.scene.time.delayedCall(this.pausaTraApparizioni, () => this.generaApparizione());
        });
    }

    gestisciCattura() {
        if (!this.attivo) return;

        // Disattiva momentaneamente il click per evitare doppi click sullo stesso spawn
        this.scene.capybara.disableInteractive();

        if (this.timerScomparsa) this.timerScomparsa.remove();

        this.punteggio++;
        this.scene.ui.mostraPunteggioMinigioco(this.punteggio);

        // Feedback economico e sonoro intermedi
        this.scene.capybara.modificaMonete(1);
        this.scene.sound.play('moneta_suono_1', { volume: 0.6 });

        this.scene.capybara.setVisible(false);

        this.scene.time.delayedCall(this.pausaDopoCattura, () => this.generaApparizione());
    }

    disattivaETermina(vittoria) {
        this.attivo = false;
        if (this.timerScomparsa) this.timerScomparsa.remove();

        // Passa il controllo del fine gioco alla scena principale
        this.scene.alTermineDelMinigioco(vittoria);
    }
}