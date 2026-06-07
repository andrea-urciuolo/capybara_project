import Phaser from 'phaser';
import { CIBI_DATABASE } from '../config/CiboConfig.js';

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

        // Variabile di stato per capire se il menu del cibo è aperto o chiuso
        this.menuCiboAperto = false;

        //Variabile di stato per capire se il menu delo shop è aperto o chiuso
        this.menuShopAperto = false;

        // Array che contiene i tasti dell'HUD
        this.pulsantiHUD = [];

        // Crea l'HUD dei pulsanti in basso
        this.creaPulsantiHUD();

        // Crea il tasto per lo Shop
        this.creaPulsanteShop();

        // Crea il menu per il cibo
        this.inizializzaPannelloCibo();

        // Crea il menu per lo shop
        this.inizializzaPannelloShop();

        // Mostra a schermo le monete possedute
        this.testoMonete = scene.add.text(this.x, this.y - 30, `🪙 Monete: ${this.scene.capybara.monete}`, {
            fontSize: '18px',
            fill: '#f1c40f',
            fontStyle: 'bold'
        });

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Crea il testo del punteggio del minigioco
        this.testoPunteggio = this.scene.add.text(width / 2, height / 4, '', {
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2e1065',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(20).setVisible(false);
    }

    // Attiva o disattiva la visibilità dell'HUD
    setVisibile(stato) {
        // Mostra/Nasconde il testo delle monete e il pulsante dello Shop
        this.testoMonete.setVisible(stato);
        if (this.btnShop) this.btnShop.setVisible(stato);

        // Mostra/Nasconde tutti i pulsanti dell'attività in basso
        this.pulsantiHUD.forEach(btn => btn.setVisible(stato));

        // Se dobbiamo nascondere tutto, forziamo la chiusura e il reset del pannello cibo
        if (!stato) {
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);
            this.menuShopAperto = false;
            this.pannelloShop.setVisible(false);

            // Pulisce visivamente le barre grafiche delle statistiche
            this.graphics.clear();
        }
    }

    // Questo metodo si occupa di disegnare le barre prendendo i dati dal capYbara
    disegna(capybara) {
        if (!capybara) return;

        // Aggiorna il valore del testo delle monete
        this.testoMonete.setText(`🪙 Monete: ${capybara.monete}`);

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

        // Definizione dei 4 nomi delle attività principali
        const attivita = ['CIBO', 'GIOCO', 'SONNO', 'LAVAGGIO'];

        // Calcolo lo spazio orizzontale in modo che i 4 pulsanti siano distribuiti equamente
        const spazioDisponibile = width - 40; // Margine di 20px ai lati
        const intervalloX = spazioDisponibile / 4;

        attivita.forEach((nome, index) => {
            // Calcolio la X di ogni pulsante per metterli in riga
            const pulsanteX = 20 + (intervalloX * index) + (intervalloX / 2);

            // Creo un testo cliccabile che faccia da pulsante -- PROVVISORIO --
            const btn = this.scene.add.text(pulsanteX, pulsantiY, nome, {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#4c1d95',
                padding: { x: 10, y: 10 },
                align: 'center'
            })
                .setOrigin(0.5).setInteractive({ useHandCursor: true }); // Cambia il cursore in una manina su PC

            // Gestione visiva dell'effetto "Hover" (quando ci passi sopra col mouse)
            btn.on('pointerover', () => btn.setStyle({ fill: '#f1c40f' }));
            btn.on('pointerout', () => btn.setStyle({ fill: '#ffffff' }));

            // Gestione del Click / Touch
            btn.on('pointerdown', () => this.gestisciClickPulsante(nome));

            this.pulsantiHUD.push(btn);
        });
    }

    // Questa funzione legge il nome del pulsante premuto, e in base ad esso si comporta di conseguenza
    gestisciClickPulsante(tipoAttivita) {
        if (tipoAttivita === 'SHOP') {
            // Impedisce lo shop di notte
            if (this.scene.isNotte) return;

            // Chiudo il menu cibo se aperto
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);

            // Inverto lo stato dello shop
            this.menuShopAperto = !this.menuShopAperto;

            if (this.menuShopAperto) {
                this.aggiornaEVisualizzaMenuShop();
            } else {
                this.pannelloShop.setVisible(false);
            }
        } else if (tipoAttivita === 'GIOCO') {
            // Chiudo il menu cibo se aperto
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);

            // Avvia il minigioco
            this.scene.avviaMinigioco();
        } else if (tipoAttivita === 'CIBO') {
            // Impedisce di aprire il menu cibo di notte
            if (this.scene.isNotte) return;

            // Chiude il menu dello shop
            this.menuShopAperto = false;
            this.pannelloShop.setVisible(false);

            // Invertiamo lo stato del menu (se è aperto si chiude, se è chiuso si apre)
            this.menuCiboAperto = !this.menuCiboAperto;

            if (this.menuCiboAperto) {
                this.aggiornaEVisualizzaMenuCibo();
            } else {
                this.pannelloCibo.setVisible(false);
            }
        } else if (tipoAttivita === 'SONNO') {
            // Chiudo il menu cibo se aperto
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);

            // Chiude il menu dello shop
            this.menuShopAperto = false;
            this.pannelloShop.setVisible(false);

            // Invertiamo lo stato del giorno/notte nella scena
            const nuovoStatoNotte = !this.scene.isNotte;
            this.scene.impostaNotte(nuovoStatoNotte);
        } else if (tipoAttivita === 'LAVAGGIO') {
            // Chiudo il menu cibo se aperto
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);

            // Chiude il menu dello shop
            this.menuShopAperto = false;
            this.pannelloShop.setVisible(false);

            // Chiama il metodo di spawn della saponetta nella scena di gioco
            this.scene.spawnSaponetta();
        } else {
            // Chiude il menu dello shop
            this.menuShopAperto = false;
            this.pannelloShop.setVisible(false);

            // Chiude il menu del cibo
            this.menuCiboAperto = false;
            this.pannelloCibo.setVisible(false);
        }
    }

    creaPulsanteShop() {
        // Posizioniamo il tasto Shop in alto a destra
        const shopX = this.scene.cameras.main.width - 40;
        const shopY = 50;

        // Creiamo il testo del pulsante Shop
        this.btnShop = this.scene.add.text(shopX, shopY, 'SHOP 🛒', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 12, y: 8 },
            align: 'center'
        })
            .setOrigin(1, 0).setInteractive({ useHandCursor: true });

        // Effetti visivi Hover
        this.btnShop.on('pointerover', () => this.btnShop.setStyle({ fill: '#f1c40f' }));
        this.btnShop.on('pointerout', () => this.btnShop.setStyle({ fill: '#ffffff' }));

        // Gestione del Click
        this.btnShop.on('pointerdown', () => this.gestisciClickPulsante('SHOP'));
    }

    // Prepara solo la struttura base del pannello
    inizializzaPannelloCibo() {
        // Creo il Contenitore principale del menu
        this.pannelloCibo = this.scene.add.container(0, 0);
        this.pannelloCibo.setVisible(false);
    }

    aggiornaEVisualizzaMenuCibo() {
        this.pannelloCibo.removeAll(true);

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const capy = this.scene.capybara;

        if (!capy) return;

        // Disegno lo sfondo del menu
        const sfondoY = height - 160;
        const graficoSfondo = this.scene.add.graphics();
        graficoSfondo.fillStyle(0x2e1065, 0.95);
        graficoSfondo.fillRect(10, sfondoY, width - 20, 60);
        this.pannelloCibo.add(graficoSfondo);

        // Trasformo le chiavi del database in un array per ciclarle
        const chiaviCibo = Object.keys(CIBI_DATABASE);
        const spazioDisponibile = width - 40;
        const intervalloX = spazioDisponibile / chiaviCibo.length;

        chiaviCibo.forEach((chiave, index) => {
            // Raccogli i dati e la quantità del cibo specifico
            const ciboData = CIBI_DATABASE[chiave]
            const quantitaAttuale = capy ? capy.inventario[chiave] : 0;

            // Definisco le coordinate per dove inserire il cibo specifico in funzione del suo index
            const ciboX = 20 + (intervalloX * index) + (intervalloX / 2);
            const ciboY = sfondoY + 30;

            // Definisco le proprietà del testo relativo al cibo
            const testoCibo = this.scene.add.text(ciboX, ciboY, `${ciboData.nome}\nx${quantitaAttuale}`, {
                fontSize: '14px',
                fill: '#ffffff',
                align: 'center',
                backgroundColor: '#5b21b6',
                padding: { x: 6, y: 4 }
            })
                .setOrigin(0.5).setInteractive({ useHandCursor: true });

            // Gestione effetto Hover
            testoCibo.on('pointerover', () => testoCibo.setStyle({ fill: '#f1c40f' }));
            testoCibo.on('pointerout', () => {
                // Cambio del colore in caso dell'assenza del cibo in inventario -- COLORI PROVVISORI --
                testoCibo.setStyle({ fill: this.scene.capybara.inventario[chiave] === 0 ? '#7f8c8d' : '#ffffff' });
            });

            // Gestioni del Click / Touch
            testoCibo.on('pointerdown', () => {
                const capy = this.scene.capybara;

                // Controllo l'inventario reale del Capibara
                if (capy.inventario[chiave] <= 0) {
                    // Effetto flash se il cibo selezionato è finito
                    this.scene.tweens.add({ targets: testoCibo, alpha: 0.3, duration: 100, yoyo: true, repeat: 1 });
                    return;
                }

                if (this.scene.ciboCorrente && this.scene.ciboCorrente.active) return;

                // Consumo il cibo dal Capibara
                capy.usaCibo(chiave);

                // Aggiorno il testo usando i dati del Database + il nuovo inventario
                testoCibo.setText(`${ciboData.nome}\nx${capy.inventario[chiave]}`);
                if (capy.inventario[chiave] === 0) {
                    testoCibo.setStyle({ fill: '#7f8c8d' });
                }

                // Spawna nella scena passando ID e Ricarica presi dal database
                this.scene.spawnCibo(ciboData.id, ciboData.ricarica);

                // Chiudo il menu
                this.menuCiboAperto = false;
                this.pannelloCibo.setVisible(false);
            });

            this.pannelloCibo.add(testoCibo);
        });

        this.pannelloCibo.setVisible(true);
    }

    // Funzioni per la visualizzazione dell'HUD del minigioco
    mostraPunteggioMinigioco(punti) {
        this.testoPunteggio.setText(`Punti: ${punti} / 10`);
        this.testoPunteggio.setVisible(true);
    }

    nascondiPunteggioMinigioco() {
        this.testoPunteggio.setVisible(false);
    }

    getCiboData(idCibo) {
        return CIBI_DATABASE[idCibo];
    }

    inizializzaPannelloShop() {
        this.pannelloShop = this.scene.add.container(0, 0);
        this.pannelloShop.setVisible(false);
    }

    aggiornaEVisualizzaMenuShop() {
        this.pannelloShop.removeAll(true);

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const capy = this.scene.capybara;

        if (!capy) return;

        // Disegna lo sfondo del menu dello shop (leggermente più in alto del menu cibo o sovrapposto)
        const sfondoY = height - 160;
        const graficoSfondo = this.scene.add.graphics();
        graficoSfondo.fillStyle(0x7c2d12, 0.95); // Colore marroncino/arancio scuro per lo shop
        graficoSfondo.fillRect(10, sfondoY, width - 20, 60);
        this.pannelloShop.add(graficoSfondo);

        const chiaviCibo = Object.keys(CIBI_DATABASE);
        const spazioDisponibile = width - 40;
        const intervalloX = spazioDisponibile / chiaviCibo.length;

        chiaviCibo.forEach((chiave, index) => {
            const ciboData = CIBI_DATABASE[chiave];
            
            const shopX = 20 + (intervalloX * index) + (intervalloX / 2);
            const shopY = sfondoY + 30;

            // Mostriamo il nome del cibo e il prezzo in monete
            const testoArticolo = this.scene.add.text(shopX, shopY, `${ciboData.nome}\n💰 ${ciboData.prezzo}`, {
                fontSize: '13px',
                fill: '#ffffff',
                align: 'center',
                backgroundColor: '#9a3412',
                padding: { x: 8, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            // Effetto Hover
            testoArticolo.on('pointerover', () => testoArticolo.setStyle({ fill: '#f1c40f' }));
            testoArticolo.on('pointerout', () => testoArticolo.setStyle({ fill: '#ffffff' }));

            // Al click invochiamo lo ShopManager della scena
            testoArticolo.on('pointerdown', () => {
                // Eseguiamo l'acquisto tramite il manager della scena
                const acquistato = this.scene.shopManager.acquistaCibo(chiave);

                if (acquistato) {
                    // Se l'acquisto va a buon fine, facciamo un piccolo effetto di rimbalzo visivo
                    this.scene.tweens.add({
                        targets: testoArticolo,
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 100,
                        yoyo: true,
                        ease: 'Quad.easeInOut'
                    });
                    
                    // Aggiorna anche il testo delle monete globale immediatamente
                    this.disegna(capy);
                } else {
                    // Effetto flash rosso/trasparente se non hai abbastanza monete
                    this.scene.tweens.add({
                        targets: testoArticolo,
                        alpha: 0.3,
                        duration: 100,
                        yoyo: true,
                        repeat: 1
                    });
                }
            });

            this.pannelloShop.add(testoArticolo);
        });

        this.pannelloShop.setVisible(true);
    }
}