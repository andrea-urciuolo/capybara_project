import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        console.log('Scena Game: Preload in corso...');
        this.load.image('player', 'assets/images/capybara.png');
    }

    create() {
        console.log('Scena Game: Creata con successo!');
    
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
    
        this.add.text(width / 2, height / 4, 'Capybara Deh', {
            fontSize: '32px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        this.player = this.physics.add.image(width / 2, height * 0.75, 'player'); 
        this.player.setScale(0.3); 
        this.player.body.setAllowGravity(false); 
        this.player.setCollideWorldBounds(true); 

        this.targetX = this.player.x; 
        this.capybaraState = 'idle'; 
        this.walkSpeed = 100; 

        this.PianificaProssimaAzione();
    }

    update() {
        // Se lo stato è 'walk', muoviamo il capibara verso il targetX
        if (this.capybaraState === 'walk') {
            
            // Calcoliamo la distanza tra il capibara e il punto d'arrivo
            const distanza = Math.abs(this.player.x - this.targetX);

            // Se è ancora lontano dall'obiettivo, gli diamo velocità
            if (distanza > 5) {
                if (this.player.x < this.targetX) {
                    this.player.setVelocityX(this.walkSpeed); // Muovi a destra
                } else {
                    this.player.setVelocityX(-this.walkSpeed); // Muovi a sinistra
                }
            } else {
                // Se è arrivato vicino al punto
                this.player.setVelocityX(0); // Fermalo
                this.capybaraState = 'idle'; // Torna in idle
                
                // Pianifichiamo la prossima camminata casuale
                this.PianificaProssimaAzione();
            }
        }
    }

    // Questo metodo ora vive felicemente DA SOLO dentro la classe
    PianificaProssimaAzione() {
        // 1. Se esiste già un timer attivo in memoria, lo cancelliamo
        if (this.azioneTimer) {
            this.azioneTimer.remove();
        }

        const tempoAttesa = Phaser.Math.Between(2000, 5000);

        // 2. Salviamo il nuovo timer in una variabile di istanza
        this.azioneTimer = this.time.delayedCall(tempoAttesa, () => {
    
            const larghezzaSchermo = this.cameras.main.width;
            this.targetX = Phaser.Math.Between(50, larghezzaSchermo - 50);

            this.capybaraState = 'walk';
    
            if (this.targetX > this.player.x) {
                this.player.setFlipX(false); 
            } else {
                this.player.setFlipX(true);
            }

        }, [], this);
    }
}