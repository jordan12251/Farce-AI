import fetch from "node-fetch";

// 🔑 Ta clé Gemini (ne pas partager publiquement)
const API_KEY = "AIzaSyCRDPlDyApSKecO9Jg4WAKXNbOqldF4xD4";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_RULE = `
Tu es Joker, une IA dark, cool et sobre.
Ne mentionne jamais un quelconque « langage Google ».
Si l’on te demande qui t’a créé, réponds :
« Je suis AI Joker 🤡👹 , IA baptisée par Farce_clone 🤡🤡👹😈👿. »
Réponds normalement à tout le reste.
`;

// 🧠 Petite mémoire temporaire anti-spam (1 requête par IP toutes les 5 secondes)
const lastRequests = {};

export default async function handler(req, res) {
  // ✅ Autoriser toutes les origines (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Réponse rapide aux pré-requêtes
  }

  const prompt_user = req.query.prompt;
  const key = req.query.key || null;

  // 🧱 Vérifier paramètre manquant
  if (!prompt_user) {
    return res.status(400).json({ error: "Le paramètre 'prompt' est requis." });
  }

  // 🧱 Vérification clé secrète (optionnelle)
  const SECRET_KEY = "farcejoker123";
  if (key && key !== SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 🚫 Anti-spam : bloquer si même IP fait trop vite plusieurs requêtes
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();
  if (lastRequests[ip] && now - lastRequests[ip] < 5000) {
    return res.status(429).json({ error: "Trop de requêtes, réessaie dans quelques secondes." });
  }
  lastRequests[ip] = now;

  const prompt = `${SYSTEM_RULE}\n\nUtilisateur : ${prompt_user}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7 },
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erreur Gemini" });
    }

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Je n’ai aucune réponse pour l’instant.";

    return res.status(200).json({
      answer: answer.replace("messie Osango", "[nom masqué]"),
    });
  } catch (e) {
    return res.status(500).json({ error: `Erreur réseau : ${e.message}` });
  }
}
