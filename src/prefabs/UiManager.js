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

        // Crea l'HUD dei pulsanti in basso
        this.creaPulsantiHUD();
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

    creaPulsantiHUD() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Posiziono i pulsanti nella parte bassa
        const pulsantiY = height - 80; 

        // Definisco i nomi delle 4 attività principali del nostro Tamagotchi
        const attivita = ['CIBO', 'GIOCO', 'SONNO', 'LAVAGGIO'];
        
        // Calcolio lo spazio orizzontale in modo che i 4 pulsanti siano distribuiti equamente
        const spazioDisponibile = width - 40; // Margine di 20px ai lati
        const intervalloX = spazioDisponibile / 4;

        this.pulsanti = [];

        attivita.forEach((nome, index) => {
            // Calcoliamo la X di ogni pulsante per metterli in riga
            const pulsanteX = 20 + (intervalloX * index) + (intervalloX / 2);

            // Creiamo un testo cliccabile che faccia da pulsante provvisorio
            const btn = this.scene.add.text(pulsanteX, pulsantiY, nome, {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#34495e',
                padding: { x: 10, y: 10 },
                align: 'center'
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }); // Cambia il cursore in una manina su PC

            // Gestione visiva dell'effetto "Hover" (quando ci passi sopra col mouse)
            btn.on('pointerover', () => btn.setStyle({ fill: '#f1c40f' }));
            btn.on('pointerout', () => btn.setStyle({ fill: '#ffffff' }));

            // Gestione del Click / Touch
            btn.on('pointerdown', () => {
                this.gestisciClickPulsante(nome);
            });

            this.pulsanti.push(btn);
        });
    }

    gestisciClickPulsante(tipoAttivita) {
        // Per ora stampiamo solo un log in console per verificare che funzioni.
        // In futuro qui faremo comunicare l'UI con il Capibara o lanceremo eventi!
        console.log(`HUD: Premuto il pulsante ${tipoAttivita}`);
    }
}