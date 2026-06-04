import Phaser from 'phaser';

export default class Saponetta extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'saponetta');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurazione Fisica
        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(false);
        this.setInteractive({ draggable: true });
        this.setScale(0.25);
        this.setTint(0xe0f2fe);

        this.isBeingDragged = false;

        // Configurazione dei vettori di Drag
        this.setupDrag();
        
        // Creo un micro-emettitore di particelle via codice per le bolle
        this.creaEmettitoreBolle();
    }

    // Funzione che gestisce la logica di Drag & Drop
    setupDrag() {
        this.on('dragstart', () => {
            this.isBeingDragged = true;
            this.body.setAllowGravity(false);
            this.setVelocity(0, 0);
        });

        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        });

        this.on('dragend', () => {
            this.isBeingDragged = false;
            this.body.setAllowGravity(true);
        });
    }

    creaEmettitoreBolle() {
        // Genero una piccolissima texture bianca circolare per le bollicine
        if (!this.scene.textures.exists('bollicina')) {
            const canvas = this.scene.textures.createCanvas('bollicina', 8, 8);
            const ctx = canvas.context;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI * 2); ctx.fill();
            canvas.refresh();
        }

        // Creo l'emettitore attaccato alla scena
        this.bolleParticles = this.scene.add.particles(0, 0, 'bollicina', {
            speed: { min: 20, max: 60 },
            angle: { min: 240, max: 300 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            frequency: -1, // Le bollicine vengono emesse manualmente
            alpha: 0.6
        });
        this.bolleParticles.setDepth(2);
    }

    // Funzione che attiva l'emissione di bolle di sapone
    attivaBolle(attive) {
        if (attive) {
            this.bolleParticles.emitParticleAt(this.x, this.y - 10, 2);
        }
    }

    // Funzione che cancella le bolle di sapone
    destroy() {
        if (this.bolleParticles) this.bolleParticles.destroy();
        super.destroy();
    }
}