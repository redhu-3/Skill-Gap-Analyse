import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { MessageCircle, X } from "lucide-react";

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi 👋 I’m your AI assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/ai/chat", {
        message: input
      });

      setMessages(prev => [
        ...prev,
        { role: "ai", text: res.data.reply }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "⚠️ AI failed. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-[450px] bg-white dark:bg-gray-900 shadow-2xl rounded-xl flex flex-col z-50">
          
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-purple-600 text-white rounded-t-xl">
            <span className="font-semibold">AI Assistant</span>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  m.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded-lg max-w-[90%] ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-400">Typing...</div>}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-3 py-1 bg-purple-600 text-white rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
