export default class SaveManager {
    constructor(scene) {
        this.scene = scene;
        this.CHIAVE_SALVATAGGIO = 'CapybaraPet_SaveGame_v1';
    }

    // Salva lo stato attuale del Capybara nel localStorage
    salvaGame() {
        const capy = this.scene.capybara;
        if (!capy) return;

        // Creiamo un oggetto pulito con solo i dati che ci interessa mantenere
        const datiDaSalvare = {
            monete: capy.monete,
            inventario: capy.inventario,
            fame: capy.fame,
            felicita: capy.felicita,
            energia: capy.energia,
            pulizia: capy.pulizia,
            timestamp: Date.now()
        };

        try {
            // Trasformiamo l'oggetto in una stringa di testo e lo salviamo
            localStorage.setItem(this.CHIAVE_SALVATAGGIO, JSON.stringify(datiDaSalvare));
            console.log('SaveManager: Gioco salvato con successo!', datiDaSalvare);
        } catch (error) {
            console.error('SaveManager: Errore durante il salvataggio', error);
        }
    }

    // Carica i dati dal localStorage e restituisce l'oggetto, oppure null
    caricaGame() {
        try {
            const datiSalvati = localStorage.getItem(this.CHIAVE_SALVATAGGIO);
            if (datiSalvati) {
                return JSON.parse(datiSalvati);
            }
        } catch (error) {
            console.error('SaveManager: Errore durante il caricamento', error);
        }
        return null;
    }

    // Cancella il salvataggio per resettare il gioco
    cancellaSalvataggio() {
        localStorage.removeItem(this.CHIAVE_SALVATAGGIO);
        console.log('SaveManager: Salvataggio eliminato!');
    }
}