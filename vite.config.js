import { defineConfig } from 'vite';

export default defineConfig({
    // './' assicura che i percorsi dei file siano relativi. 
    // È fondamentale per far funzionare l'app quando Capacitor la caricherà sul telefono.
    base: './', 
    
    build: {
        outDir: 'dist', // La cartella in cui Vite salverà il gioco pronto per il mobile
        assetsDir: 'assets',
        minify: 'terser', // Ottimizza e rimpicciolisce il codice finale
    },
    
    server: {
        port: 3000, // Il gioco girerà su http://localhost:3000
        open: true  // Apre automaticamente il browser quando avvii il server
    }
});