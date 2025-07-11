import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const port = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static('public'));


const userData = {
  searches: [
    { destination: "Barcelona", date: "2025-06-28", filters: ["pool", "4 stars"] },
    { destination: "Mallorca", date: "2025-07-01", filters: ["sea view"] }
  ],
  views: [
    { hotel: "Hotel Isla Mallorca", duration_sec: 45, price_per_night: 120 },
    { hotel: "Barceló Raval", duration_sec: 70, price_per_night: 160 }
  ]
};

app.get('/api/summary', async (req, res) => {
  const prompt = `
You are a smart travel assistant. Here is the user's recent hotel interaction data:

Searches:
${userData.searches.map(s => `- Destination: ${s.destination}, Date: ${s.date}, Filters: ${s.filters.join(', ')}`).join('\n')}

Hotel views:
${userData.views.map(v => `- Hotel: ${v.hotel}, Time viewed: ${v.duration_sec}s, Price per night: €${v.price_per_night}`).join('\n')}

Based on this data, generate a short, personalized and inspiring travel summary as if you're suggesting what kind of vacation they are dreaming of.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
    });

    const summary = response.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
