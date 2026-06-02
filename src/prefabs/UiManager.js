import Phaser from 'phaser';

export default class UiManager {
    constructor(scene) {
        this.scene = scene;

        // Inizializzo l'oggetto grafico sulla scena
        this.graphics = scene.add.graphics();

        // Configurazione geometrica fissa delle barre
        this.x = 50;
        this.y = 50;
        this.larghezzaMax = 150;
        this.altezza = 15;
    }

    // Questo metodo si occupa di disegnare le barre prendendo i dati dal capYbara
    disegna(capybara) {
        if (!capybara) return;

        // Puliamo lo schermo dai disegni del fotogramma precedente
        this.graphics.clear();

        // 1. BARRA DELLA FAME (Arancione)
        this.disegnaBarraSingola(this.y, capybara.fame, 0xe67e22);

        // 2. BARRA DELLA FELICITÀ (Rosa)
        this.disegnaBarraSingola(this.y + 25, capybara.felicita, 0xe91e63);

        // 3. BARRA DELL'ENERGIA (Giallo)
        this.disegnaBarraSingola(this.y + 50, capybara.energia, 0xf1c40f);
    }

    // Metodo di utilità interno per evitare di duplicare il codice del disegno
    disegnaBarraSingola(posizioneY, valoreStatistica, colore) {
        // Sfondo grigio della barra
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(this.x, posizioneY, this.larghezzaMax, this.altezza);

        // Barra colorata dinamica
        const larghezzaDinamica = (valoreStatistica / 100) * this.larghezzaMax;
        this.graphics.fillStyle(colore, 1);
        this.graphics.fillRect(this.x, posizioneY, larghezzaDinamica, this.altezza);
    }
}