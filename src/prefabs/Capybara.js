/*
* Questo modulo contiene tutta la logica relativa al Capybara (movimento, animazioni, sound-effect, ia, ...)
*/

import Phaser from 'phaser';
import { CIBI_DATABASE } from '../config/CiboConfig.js';

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
        this.isJumping = false;

        // Statistiche del Capybara (da 0 a 100)
        this.fame = 100;
        this.felicita = 80;
        this.energia = 100;
        this.pulizia = 100;

        // Inventario iniziale del Capybara
        this.inventario = {
            pomodoro: 5,
            foglia: 3,
            anguria: 1
        };
        this.monete = 15;

        // Avvio il ciclo di degrado dei bisogni
        this.avviaCicloBisogni();

        // Gestione degli eventi di input
        this.setupInput();

        // L'ia del Capybara
        this.pianificaProssimaAzione();
    }

    setupInput() {
        this.on('pointerdown', () => {
            // CONTROLLO: Se il capybara sta saltando gli impedisce di saltare di nuovo
            if (this.isJumping) return;

            // STATO: DORMENDO
            if (this.capybaraState === 'sleep') {
                this.isJumping = true;
                this.scene.sound.play('verso_1', { volume: 0.7 });

                // Riduce le statistiche del capybara se il risveglio è forzato
                this.felicita = Math.max(0, this.felicita - 15);
                this.fame = Math.max(0, this.fame - 3);

                this.capybaraState = 'idle';

                // Memorizziamo la Y di partenza reale a terra prima del salto
                const quotaTerra = this.y;

                // Animazione di sobbalzo di spavento
                this.scene.tweens.add({
                    targets: this,
                    angle: 0,
                    scaleY: 0.3,
                    y: quotaTerra - 40,
                    duration: 250,
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: this,
                            y: quotaTerra,
                            duration: 200,
                            ease: 'Bounce.easeOut',
                            onComplete: () => {
                                this.isJumping = false;
                                this.scene.impostaNotte(false);
                            }
                        });
                    }
                });

                return;
            }

            // STATO: SVEGLIO
            this.isJumping = true;

            // Modifica le statistiche del capybara
            this.felicita = Math.min(100, this.felicita + 5);
            this.fame = Math.max(0, this.fame - 2);
            this.energia = Math.max(0, this.energia - 1);

            // Scelta random del verso
            const sceltaSuono = Phaser.Math.Between(1, 2);
            this.scene.sound.play(`verso_${sceltaSuono}`, { volume: 0.5 });

            this.setVelocityX(0);
            this.capybaraState = 'idle';

            // Memorizziamo la Y di partenza reale prima del salto
            const quotaTerraStandard = this.y;

            // Codice del sobbalzo
            this.scene.tweens.add({
                targets: this,
                y: quotaTerraStandard - 20,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut',
                onComplete: () => {
                    this.y = quotaTerraStandard;
                    this.isJumping = false;
                    this.pianificaProssimaAzione();
                }
            });
        });
    }

    // Loop di movimento
    aggiorna() {
        if (this.capybaraState === 'sleep') {
            this.setVelocityX(0);
            return;
        } 

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
        if (this.capybaraState === 'sleep') return;

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

    avviaCicloBisogni() {
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.capybaraState === 'sleep') {
                    // MENTRE DORME: L'energia sale, la fame scende meno velocemente, la felicità non cala
                    this.energia = Math.min(100, this.energia + 6);
                    this.fame = Math.max(0, this.fame - 1);
                    this.pulizia = Math.max(0, this.pulizia - 0.5);
                } else if (this.capybaraState === 'walk' || this.capybaraState === 'idle') {
                    // MENTRE È SVEGLIO: Tutte le statistiche calano
                    this.fame = Math.max(0, this.fame - 2);
                    this.energia = Math.max(0, this.energia - 1);
                    this.pulizia = Math.max(0, this.pulizia - 1.5);

                    // Se è molto affamato, molto stanco o molto sporco: la felicità deve calare più velocemente
                    if (this.fame < 30 || this.energia < 30 || this.pulizia < 40) {
                        this.felicita = Math.max(0, this.felicita - 3);
                    } else {
                        this.felicita = Math.max(0, this.felicita - 0.5);
                    }
                }

                // DEBUG -- PROVVISORIO --
                console.log(`Stato Capibara -> Fame: ${this.fame} | Energia: ${this.energia} | Felicità: ${this.felicita} |Pulizia: ${this.pulizia} |`);
            },
            callbackScope: this,
            loop: true
        });
    }

    mangia(cibo) {
        if (!cibo || !cibo.active) return;

        // Incrementa la fame usando il valore specifico del cibo
        this.fame = Math.min(100, this.fame + cibo.ricarica);

        // Suono e animazione (gestiti dal Capybara)
        const versoCasuale = Phaser.Math.Between(1, 2);
        this.scene.sound.play(`verso_${versoCasuale}`, { volume: 0.6 });

        this.scene.tweens.add({
            targets: this,
            scaleX: 0.35,
            scaleY: 0.25,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });

        // Il cibo viene distrutto
        cibo.destroy();
    }

    usaCibo(idCibo) {
        if (this.inventario[idCibo] && this.inventario[idCibo] > 0) {
            this.inventario[idCibo]--;
            return true; // Cibo consumato con successo
        }
        return false; // Cibo esaurito
    }

    // Questa funzione attiva o disattiva il sonno anche graficamente
    setSonno(dorme) {
        if (dorme) {
            this.capybaraState = 'sleep';
            this.setVelocityX(0);
            if (this.azioneTimer) this.azioneTimer.remove();
            
            // Effetto grafico: lo sdraiamo ruotandolo leggermente e rimpicciolendolo sull'asse Y
            this.scene.tweens.add({
                targets: this,
                angle: 90,
                scaleY: 0.2,
                duration: 300,
                ease: 'Quad.easeOut'
            });
        } else {
            this.capybaraState = 'idle';
            
            // Lo rimettiamo in piedi
            this.scene.tweens.add({
                targets: this,
                angle: 0,
                scaleY: 0.3,
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => this.pianificaProssimaAzione()
            });
        }
    }
    
    lavati(puntiPulizia) {
        this.pulizia = Math.min(100, this.pulizia + puntiPulizia);
        
        // Se si sta pulendo ed esce dalla zona di pericolo, si toglie subito il filtro negativo
        if (this.pulizia >= 40) {
            this.clearTint();
        }
    }

    modificaMonete(quantita) {
        // Se stiamo spendendo e non abbiamo abbastanza soldi, blocca l'azione
        if (quantita < 0 && this.monete + quantita < 0) {
            return false;
        }
        
        this.monete += quantita;
        return true;
    }
}