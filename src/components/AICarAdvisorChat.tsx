'use client';

import React, { useState } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function AICarAdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Halo Sobat YukJalan! Mau roadtrip ke mana hari ini? Beritahu jumlah penumpang atau medan perjalananmu ya!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Maaf, koneksi ke AI Advisor sedang terganggu.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bobo-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ background: '#e6f6f4', color: '#00a896', padding: '8px 12px', borderRadius: 12, fontWeight: 800 }}>
          🤖 AI
        </span>
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>YukJalan Smart Car Advisor</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Asisten virtual pemilihan unit kendaraan</span>
        </div>
      </div>

      <div
        style={{
          height: 230,
          overflowY: 'auto',
          background: '#f5f8f7',
          padding: 14,
          borderRadius: 16,
          marginBottom: 14,
          border: '1px solid #e2e8f0'
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              textAlign: m.sender === 'user' ? 'right' : 'left',
              marginBottom: 10
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '10px 14px',
                borderRadius: 16,
                background: m.sender === 'user' ? '#00a896' : '#ffffff',
                color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                whiteSpace: 'pre-line',
                maxWidth: '85%',
                fontSize: 13.5,
                lineHeight: 1.5
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ fontSize: 12, color: '#00a896', fontWeight: 600 }}>Sedang mencarikan armada terbaik...</div>}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          className="bobo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya: Mobil keluarga 7 kursi atau mobil listrik..."
        />
        <button type="submit" className="bobo-btn-primary" style={{ padding: '12px 22px' }}>
          Kirim
        </button>
      </form>
    </div>
  );
}