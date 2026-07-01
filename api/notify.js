export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID" });
    return;
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Пустой текст сообщения" });
    return;
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4000), // лимит Telegram на длину сообщения
      }),
    });

    if (!tgRes.ok) {
      const details = await tgRes.text();
      res.status(502).json({ error: "Telegram API error", details });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Unexpected error", details: String(e) });
  }
}
