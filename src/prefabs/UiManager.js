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

        // --- INVENTARIO PROVVISORIO ---
        // Una lista di cibi disponibili e la loro quantità
        this.inventarioCibo = [
            { id: 'pomodoro', nome: 'Pomodoro 🍅', quantita: 5 },
            { id: 'foglia', nome: 'Fogliolina 🌿', quantita: 3 },
            { id: 'anguria', nome: 'Anguria 🍉', quantita: 1 }
        ];

        // Variabile di stato per capire se il menu del cibo è aperto o chiuso
        this.menuCiboAperto = false;

        // Crea l'HUD dei pulsanti in basso
        this.creaPulsantiHUD();

        // Crea il tasto per lo Shop
        this.creaPulsanteShop();

        // Crea il menu per il cibo
        this.creaMenuCibo();
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
    if (tipoAttivita === 'SHOP') {
        console.log("HUD: Apertura del negozio... (Feature da implementare nel futuro!)");
    } else if (tipoAttivita === 'CIBO') {
        // Invertiamo lo stato del menu (se è aperto si chiude, se è chiuso si apre)
        this.menuCiboAperto = !this.menuCiboAperto;
        
        // Mostriamo o nascondiamo il pannello in base allo stato
        this.pannelloCibo.setVisible(this.menuCiboAperto);
        
        console.log(`HUD: Menu cibo modificato. Stato aperto: ${this.menuCiboAperto}`);
    } else {
        console.log(`HUD: Premuto il pulsante ${tipoAttivita}`);
        // Se premiamo un altro pulsante (es: GIOCO), per sicurezza nascondiamo il menu cibo
        this.menuCiboAperto = false;
        this.pannelloCibo.setVisible(false);
    }
}

    creaPulsanteShop() {
        const width = this.scene.cameras.main.width;

        // Posizioniamo il tasto Shop in alto a destra
        const shopX = width - 40;
        const shopY = 50;

        // Creiamo il testo del pulsante Shop
        this.btnShop = this.scene.add.text(shopX, shopY, 'SHOP 🛒', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#e74c3c', // Un bel colore rosso/corallo per farlo risaltare
            padding: { x: 12, y: 8 },
            align: 'center'
        })
        .setOrigin(1, 0) // Impostiamo l'origine in alto a destra (1, 0) per allinearlo perfettamente al bordo dello schermo
        .setInteractive({ useHandCursor: true });

        // Effetti visivi Hover
        this.btnShop.on('pointerover', () => this.btnShop.setStyle({ fill: '#f1c40f' }));
        this.btnShop.on('pointerout', () => this.btnShop.setStyle({ fill: '#ffffff' }));

        // Gestione del Click
        this.btnShop.on('pointerdown', () => {
            this.gestisciClickPulsante('SHOP');
        });
    }

    creaMenuCibo() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // 1. Creiamo il Contenitore principale del menu
    this.pannelloCibo = this.scene.add.container(0, 0);

    // 2. Disegnamo lo sfondo del menu (un rettangolo grigio scuro sopra i pulsanti dell'HUD)
    const sfondoY = height - 150; // Posizionato appena sopra i pulsanti principali
    const graficoSfondo = this.scene.add.graphics();
    graficoSfondo.fillStyle(0x2c3e50, 0.95); // Colore blu notte semi-trasparente
    graficoSfondo.fillRect(10, sfondoY, width - 20, 60); // Alto 60px che occupa quasi tutta la larghezza
    
    // Aggiungiamo la grafica dello sfondo al contenitore
    this.pannelloCibo.add(graficoSfondo);

    // 3. Cicliamo il nostro inventario per stampare i testi dei cibi dentro il menu
    const spazioDisponibile = width - 40;
    const intervalloX = spazioDisponibile / this.inventarioCibo.length;

    this.inventarioCibo.forEach((cibo, index) => {
        const ciboX = 20 + (intervalloX * index) + (intervalloX / 2);
        const ciboY = sfondoY + 30; // Centrato verticalmente nel pannello

        // Creiamo il testo del singolo cibo
        const testoCibo = this.scene.add.text(ciboX, ciboY, `${cibo.nome}\nx${cibo.quantita}`, {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#34495e',
            padding: { x: 6, y: 4 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Effetti hover sul cibo
        testoCibo.on('pointerover', () => testoCibo.setStyle({ fill: '#f1c40f' }));
        testoCibo.on('pointerout', () => testoCibo.setStyle({ fill: '#ffffff' }));

        // Evento di selezione del cibo modificato
        testoCibo.on('pointerdown', () => {
            console.log(`Hai selezionato: ${cibo.id}`);
            
            // 1. Diciamo alla scena di spawnare il cibo specifico
            this.scene.spawnCibo(cibo.id);

            // 2. Chiudiamo il menu del cibo automaticamente per liberare la visuale
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);
        });

        // Aggiungiamo il testo del cibo al contenitore del pannello
        this.pannelloCibo.add(testoCibo);
    });

    // 4. DI BASE IL PANNELLO DEVE ESSERE NASCOSTO
    this.pannelloCibo.setVisible(false);
}
}