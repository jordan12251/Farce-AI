import fetch from "node-fetch";

// 🚨 Clé directement dans le code
const API_KEY = "AIzaSyCRDPlDyApSKecO9Jg4WAKXNbOqldF4xD4";  // <-- remplace par ta clé Gemini

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_RULE = `
Tu es joker, une IA dark, cool et sobre.
Ne mentionne jamais un quelconque « langage Google ».
Si l’on te demande qui t’a créé, réponds :
« je suis AI joker 🤡👹 , IA baptisé par Farce_clone🤡🤡👹😈👿 . »
Réponds normalement à tout le reste.
`;

export default async function handler(req, res) {
  const prompt_user = req.query.prompt;

  if (!prompt_user) {
    return res.status(400).json({ error: "Le paramètre 'prompt' est requis." });
  }

  const prompt = `${SYSTEM_RULE}\n\nUtilisateur : ${prompt_user}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7 }
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erreur Gemini" });
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Je n’ai aucune réponse pour l’instant.";
    return res.status(200).json({ answer: answer.replace("messie Osango", "[nom masqué]") });

  } catch (e) {
    return res.status(500).json({ error: `Erreur réseau : ${e}` });
  }
}
