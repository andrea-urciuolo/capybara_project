import Phaser from 'phaser';

export default class Cibo extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, idCibo, ricarica) {
        // idCibo corrisponde alla texture
        super(scene, x, y, idCibo);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.idCibo = idCibo;
        this.ricarica = ricarica;

        // Configurazioni fisiche
        this.setScale(0.08);
        this.setCollideWorldBounds(true);
        this.setBounce(0.3);
        this.body.setAllowGravity(true);

        // Rendi interattivo per il Drag & Drop
        this.setInteractive({ draggable: true });
        this.setupDragEvents();
    }

    // Funzione per la gestione del Drag & Drop
    setupDragEvents() {
        this.on('dragstart', () => {
            this.body.setAllowGravity(false);
            this.setVelocity(0, 0);
        });

        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        });

        this.on('dragend', () => {
            this.body.setAllowGravity(true);
        });
    }
}