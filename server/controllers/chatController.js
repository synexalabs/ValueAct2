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

function buildContextBlock(context) {
  if (!context || typeof context !== 'object') return '';
  const lines = ['--- Aktuelle Berechnungsergebnisse ---'];
  const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : v);
  if (context.type) lines.push(`Berechnungstyp: ${context.type}`);
  if (context.csm != null) lines.push(`CSM: ${fmt(context.csm)} €`);
  if (context.lossComponent != null) lines.push(`Verlustkomponente: ${fmt(context.lossComponent)} €`);
  if (context.fcf != null) lines.push(`FCF: ${fmt(context.fcf)} €`);
  if (context.pvPremiums != null) lines.push(`PV Prämien: ${fmt(context.pvPremiums)} €`);
  if (context.pvBenefits != null) lines.push(`PV Leistungen: ${fmt(context.pvBenefits)} €`);
  if (context.scr != null) lines.push(`SCR: ${fmt(context.scr)} €`);
  if (context.mcr != null) lines.push(`MCR: ${fmt(context.mcr)} €`);
  if (context.solvencyRatio != null) lines.push(`Solvenzquote: ${fmt(context.solvencyRatio * 100)} %`);
  lines.push('--- Ende der Berechnungsergebnisse ---\n');
  return lines.join('\n');
}

class ChatController {
  async handleChat(req, res) {
    try {
      const message = sanitizeInput(req.body.message);
      const calcContext = req.body.calculationContext || null;

      if (!message || message.length < 2) {
        return res.status(400).json({ error: 'Nachricht erforderlich (mindestens 2 Zeichen)' });
      }

      if (!process.env.GOOGLE_API_KEY) {
        return res.status(503).json({ error: 'KI-Dienst ist derzeit nicht verfügbar.' });
      }

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt
      });

      // Prepend calculation context so Gemini can explain the specific numbers
      const contextBlock = buildContextBlock(calcContext);
      const fullMessage = contextBlock ? `${contextBlock}\nFrage: ${message}` : message;

      const result = await model.generateContent(fullMessage);
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
