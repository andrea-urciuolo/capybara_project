export default class ShopManager {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Tenta di acquistare un cibo dal database
     * @param {string} idCibo - L'id del cibo (pomodoro, foglia, anguria)
     * @returns {boolean} - true se l'acquisto è andato a buon fine, false altrimenti
     */
    acquistaCibo(idCibo) {
        const capy = this.scene.capybara;
        const ciboData = this.scene.ui.getCiboData(idCibo);

        if (!capy || !ciboData) return false;

        // Verifica se il Capybara ha abbastanza monete e sottrae il prezzo
        const transazioneRiuscita = capy.modificaMonete(-ciboData.prezzo);

        if (transazioneRiuscita) {
            // Aggiungi il cibo all'inventario del Capybara
            if (capy.inventario[idCibo] !== undefined) {
                capy.inventario[idCibo]++;
            } else {
                capy.inventario[idCibo] = 1;
            }

            // Riproduci un effetto sonoro di feedback -- VERSO PROVVISORIO (SCARICANE DI PIU') --
            this.scene.sound.play('verso_2', { volume: 0.5 });
            
            return true;
        } else {
            return false;
        }
    }
}