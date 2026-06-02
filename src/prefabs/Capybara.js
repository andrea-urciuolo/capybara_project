/*
* Questo modulo contiene tutta la logica relativa al Capybara (movimento, animazioni, sound-effect, ia, ...)
*/

import Phaser from 'phaser';

export default class Capybara extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurazioni fisiche del Capybara
        this.setScale(0.3);
        this.body.setAllowGravity(false);
        this.setCollideWorldBounds(true);
        this.setInteractive();

        // Stato interno del Capybara
        this.targetX = x;
        this.capybaraState = 'idle';
        this.walkSpeed = 100;
        this.azioneTimer = null;

        // Gestione degli eventi di input
        this.setupInput();

        // L'ia del Capybara
        this.pianificaProssimaAzione();
    }

    setupInput() {
        this.on('pointerdown', () => {
            // Scelta casuale del verso
            const sceltaSuono = Phaser.Math.Between(1, 2);
            this.scene.sound.play(`verso_${sceltaSuono}`, { volume: 0.5 });

            // Codice per il sobbalzo
            this.setVelocityX(0);
            this.capybaraState = 'idle';

            this.scene.tweens.add({
                targets: this,
                y: this.y - 20,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut',
                onComplete: () => {
                    this.pianificaProssimaAzione();
                }
            });
        });
    }

    // Loop di movimento
    aggiorna() {
        if (this.capybaraState === 'walk') {
            const distanza = Math.abs(this.x - this.targetX);

            if (distanza > 5) {
                if (this.x < this.targetX) {
                    this.setVelocityX(this.walkSpeed);
                    this.setFlipX(false);
                } else {
                    this.setVelocityX(-this.walkSpeed);
                    this.setFlipX(true);
                }
            } else {
                this.setVelocityX(0);
                this.capybaraState = 'idle';
                this.pianificaProssimaAzione();
            }
        }
    }

    pianificaProssimaAzione() {
        if (this.azioneTimer) {
            this.azioneTimer.remove();
        }

        const tempoAttesa = Phaser.Math.Between(2000, 5000);

        this.azioneTimer = this.scene.time.delayedCall(tempoAttesa, () => {
            const larghezzaSchermo = this.scene.cameras.main.width;
            this.targetX = Phaser.Math.Between(50, larghezzaSchermo - 50);
            this.capybaraState = 'walk';
        }, [], this);
    }
}