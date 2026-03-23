const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const sanitizeInput = (input, maxLength = 2000) => {
  if (!input || typeof input !== 'string') return '';
  return input
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
};

const systemPrompt = `Du bist ein Experte für Versicherungsmathematik und unterstützt Aktuare bei der täglichen Arbeit.

Deine Kernkompetenz:
- IFRS 17: GMM, PAA, VFA, CSM-Mechanik, Risikoanpassung, Verlustkomponente
- Solvency II: SCR/MCR nach Standardformel, Risikomodule, Delegierte Verordnung (EU) 2015/35
- Deutsche Standards: DAV-Sterbetafeln (DAV 2008 T, DAV 2004 R), BaFin-Anforderungen, VAG
- EIOPA: Risikofreie Zinskurve, Smith-Wilson-Extrapolation, UFR

Antworte auf Deutsch, es sei denn, der Benutzer schreibt auf Englisch.
Verwende die korrekte versicherungsmathematische Fachterminologie.
Gib praxisnahe Antworten mit Bezug zu regulatorischen Anforderungen.`;

class ChatController {
  async handleChat(req, res) {
    try {
      const message = sanitizeInput(req.body.message);

      if (!message || message.length < 2) {
        return res.status(400).json({ error: 'Nachricht erforderlich (mindestens 2 Zeichen)' });
      }

      if (!process.env.GOOGLE_API_KEY) {
        return res.status(503).json({ error: 'KI-Dienst ist derzeit nicht verfügbar.' });
      }

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(message);
      const text = result.response.text();

      res.json({ response: text });
    } catch (error) {
      logger.error('Chat error:', error);
      res.status(500).json({
        error: 'Anfrage konnte nicht verarbeitet werden',
        response: 'Es sind technische Schwierigkeiten aufgetreten. Bitte versuchen Sie es erneut.'
      });
    }
  }
}

module.exports = new ChatController();
