/**
 * RELAIS SÉCURISÉ S.Y.B.I.L. (IA)
 * Ce fichier gère la communication avec l'API Google Gemini.
 * La clé API est récupérée côté serveur via les variables d'environnement Vercel.
 */

export default async function handler(req, res) {
    // Autoriser uniquement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
    }

    // Récupération de la clé API (configurée dans le dashboard Vercel)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Configuration serveur incomplète : GEMINI_API_KEY non détectée.' 
        });
    }

    try {
        // Point de terminaison du modèle Gemini 2.5 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // Préparation du prompt système pour forcer la personnalité de l'IA
        const systemInstruction = {
            parts: [{ 
                text: "Tu es S.Y.B.I.L., l'intelligence centrale du Strategic Overlord. Ton identité est technologique, étatique et froide. Tu es cynique, analytique et pragmatique. Réponds en français, avec un ton sec et militaire. Maximum 3 phrases. Pas de politesse." 
            }]
        };

        // Fusion de l'instruction système avec le corps de la requête du client
        const payload = {
            ...req.body,
            systemInstruction: systemInstruction
        };

        // Appel à l'API distante
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erreur API Gemini:", data);
            return res.status(response.status).json({ 
                error: "Échec de la synthèse neuronale.",
                details: data 
            });
        }

        // Renvoi de la réponse formatée au client
        return res.status(200).json(data);

    } catch (error) {
        console.error("Erreur Critique Sybil:", error);
        return res.status(500).json({ 
            error: 'Interruption du lien de données avec l\'unité S.Y.B.I.L.' 
        });
    }
}
