/**
 * MOTEUR DE CALCUL GÉOPOLITIQUE
 * Ce fichier gère l'extraction et la transformation des données mondiales
 * pour calculer les scores de puissance et de menace en temps réel.
 */

export default async function handler(req, res) {
    // Autoriser uniquement les requêtes POST depuis l'interface
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée.' });
    }

    const { country } = req.body;

    if (!country) {
        return res.status(400).json({ error: 'Paramètre [country] manquant.' });
    }

    try {
        // Récupération des données brutes depuis l'API mondiale
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
        
        if (!response.ok) {
            throw new Error('Erreur de communication avec la base de données pays.');
        }

        const data = await response.json();
        const countryData = data[0];

        // LOGIQUE DE SCORING PROPRIÉTAIRE
        const population = countryData.population || 0;
        const area = countryData.area || 0;
        const neighbors = countryData.borders ? countryData.borders.length : 0;
        const isLandlocked = countryData.landlocked || false;

        // Calcul de la puissance (Logarithmique basé sur pop et surface)
        const powerScore = Math.min(100, (Math.log10(population + 1) * 6 + Math.log10(area + 1) * 3)).toFixed(1);

        // Calcul de la vulnérabilité (Basé sur les frontières et l'accès à la mer)
        const threatScore = (neighbors * 5 + (isLandlocked ? 20 : 0) + (population < 1000000 ? 30 : 0)).toFixed(1);

        // Synthèse du rapport stratégique
        const report = `[ANALYSE_ALPHA] ${countryData.name.common.toUpperCase()} // ` +
                       `RÉGION: ${countryData.region} // ` +
                       `STATUT_FRONTALIER: ${neighbors} CONTACTS // ` +
                       `LOGISTIQUE: ${isLandlocked ? 'ENCLAVÉ' : 'ACCÈS_MARITIME'}.`;

        // Renvoi des données formatées pour le Canvas
        return res.status(200).json({
            name: countryData.name.common,
            code: countryData.cca3,
            stats: {
                power: parseFloat(powerScore),
                threat: parseFloat(threatScore),
                domino: neighbors * 12
            },
            analysis: report
        });

    } catch (error) {
        console.error("Erreur Moteur:", error);
        return res.status(500).json({ 
            error: 'Échec du calcul des paramètres géopolitiques.',
            details: error.message 
        });
    }
}
