import Phaser from 'phaser';

// Configurazione globale del gioco Phaser
const config = {
    type: Phaser.AUTO, // Sceglie automaticamente WebGL o Canvas in base al dispositivo
    width: 800,        // Larghezza logica del gioco (Phaser la scalerà per il telefono)
    height: 600,       // Altezza logica del gioco
    parent: 'game-container', // L'ID del div che abbiamo creato in index.html
    backgroundColor: '#34495e', // Un bel colore grigio/blu per lo sfondo del gioco
    
    // Configurazione della fisica (essenziale per far muovere il Capibara!)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravità verso il basso (es. per un gioco a piattaforme)
            debug: true // Mostra i rettangoli di collisione (utilissimo in sviluppo)
        }
    },
    
    // Scena temporanea di test per verificare che tutto funzioni
    scene: {
        preload: function() {
            // Qui caricheremo gli asset in futuro
        },
        create: function() {
            // Testiamo se Phaser risponde stampando un testo a schermo
            this.add.text(400, 300, 'Capybara in Caricamento...', {
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        },
        update: function() {
            // Game Loop temporaneo
        }
    }
};

// Inizializziamo il gioco passando la configurazione
const game = new Phaser.Game(config);