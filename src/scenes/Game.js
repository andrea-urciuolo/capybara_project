import Phaser from 'phaser';

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
        this.player.setInteractive();

        // 2. Gestiamo l'evento del click/touch sul personaggio
        this.player.on('pointerdown', () => {
            console.log('Hai toccato il Capibara!');

            const sceltaSuono = Phaser.Math.Between(1, 2);
    
            // Fai partire il verso
            this.sound.play(`verso_${sceltaSuono}`, { volume: 0.5 }); // Volume da 0.0 a 1.0

            // EFFETTO EXTRA: Facciamo sobbalzare leggermente il Capibara quando lo tocchi (effetto Tamagotchi)
            this.player.setVelocityX(0); // Lo fermiamo
            this.capybaraState = 'idle'; // Lo rimettiamo in stato di attesa
    
            // Creiamo una piccola animazione di "sobbalzo" (Tween)
            this.tweens.add({
                targets: this.player,
                y: this.player.y - 20, // Sale di 20 pixel
                duration: 100,         // In 100 millisecondi
                yoyo: true,            // Torna giù alla posizione iniziale
                ease: 'Quad.easeInOut',
                onComplete: () => {
                    // Finito il sobbalzo, riprogramma il movimento casuale dopo un po'
                    this.PianificaProssimaAzione();
                }
            });
        });

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