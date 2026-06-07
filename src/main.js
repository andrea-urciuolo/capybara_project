import Phaser from 'phaser';
import Game from './scenes/Game.js';

// Configurazione globale del gioco Phaser
const config = {
    type: Phaser.AUTO, // Sceglie automaticamente WebGL o Canvas in base al dispositivo
    width: 600,        // Larghezza logica del gioco (Phaser la scalerà per il telefono)
    height: 800,       // Altezza logica del gioco
    parent: 'game-container', // L'ID del div che abbiamo creato in index.html
    backgroundColor: '#34495e', // Un bel colore grigio/blu per lo sfondo del gioco
    pixelArt: true,

    scale: {
        mode: Phaser.Scale.FIT, // Adatta il gioco allo schermo mantenendo le proporzioni
        autoCenter: Phaser.Scale.CENTER_BOTH // Centra il gioco sia in orizzontale che in verticale
    },
    
    // Configurazione della fisica (essenziale per far muovere il Capibara!)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravità verso il basso (es. per un gioco a piattaforme)
            debug: false // Mostra i rettangoli di collisione (utilissimo in sviluppo)
        }
    },
    
    scene: [Game]
};

// Inizializziamo il gioco passando la configurazione
const game = new Phaser.Game(config);