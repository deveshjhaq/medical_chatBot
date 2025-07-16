import { useState } from "react";
import Message from "./Message";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const loadingMsg = { text: "Thinking...", sender: "bot" };
    setMessages((prev) => [...prev, loadingMsg]);

    const userInput = input.toLowerCase();
let botReply = "Sorry, I couldn't understand that.";

try {
  const symptomKeywords = ["fever", "cough", "pain", "headache", "fatigue", "tired", "throat", "chest"];
  const isSymptom = symptomKeywords.some((kw) => userInput.includes(kw));

  if (!isSymptom) {
    // Medicine search
    let res = await fetch(
      `https://api.fda.gov/drug/label.json?search=active_ingredient:${userInput}`
    );
    let data = await res.json();

    if (!data.results || data.results.length === 0) {
      res = await fetch(
        `https://api.fda.gov/drug/label.json?search=generic_name:${userInput}`
      );
      data = await res.json();
    }

    if (data.results && data.results.length > 0) {
      const medInfo = data.results[0];
      botReply =
        medInfo.purpose?.[0] ||
        medInfo.description?.[0] ||
        medInfo.indications_and_usage?.[0] ||
        medInfo.warnings?.[0] ||
        "Medicine found, but no detailed info available.";
    } else {
      botReply = "❗ I couldn't find that medicine. Please check the spelling.";
    }
  } else {
    // Symptom detection block — this will finally work!
    const cleaned = userInput.replace(/[^\w\s]/gi, " ");
    if (cleaned.includes("fever") && cleaned.includes("cough")) {
      botReply = "🤒 You might have the flu or a viral infection.";
    } else if (cleaned.includes("fever")) {
      botReply = "🌡️ You may have a mild infection or flu.";
    } else if (cleaned.includes("headache")) {
      botReply = "🧠 It could be a migraine or dehydration.";
    } else if (cleaned.includes("sore throat")) {
      botReply = "🗣️ Possible throat infection.";
    } else if (cleaned.includes("chest pain")) {
      botReply = "⚠️ Chest pain is serious, please consult a doctor.";
    } else if (cleaned.includes("fatigue") || cleaned.includes("tired")) {
      botReply = "😴 Could be fatigue from stress or lack of sleep.";
    } else {
      botReply = "🤔 I'm not sure. Please consult a doctor.";
    }
  }
} catch (error) {
  botReply = "❌ No data found or something went wrong.";
}


    setMessages((prev) => [
      ...prev.slice(0, -1),
      { text: botReply, sender: "bot" },
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded-xl shadow bg-white">
      <div className="h-96 overflow-y-auto mb-4 border-b pb-4">
        {messages.map((msg, idx) => (
          <Message key={idx} text={msg.text} sender={msg.sender} />
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-xl"
          placeholder="Enter medicine or symptoms..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
