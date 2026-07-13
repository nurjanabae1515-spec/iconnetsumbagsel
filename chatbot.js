
(function () {

  const WEBHOOK_URL = 'https://nurjana.app.n8n.cloud/webhook/iconnet-bot';
  const CONI_IMG   = 'Maskot...png';

  const style = document.createElement('style');
  style.textContent = `
    coni-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(135deg, #0057B8, #00A6E0);
      box-shadow: 0 4px 20px rgba(0,87,184,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    coni-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(0,87,184,0.55);
    }
    coni-btn img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }
    coni-box {
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 9999;
      width: 350px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.18);
      display: none;
      flex-direction: column;
      font-family: 'Poppins', 'Segoe UI', sans-serif;
      font-size: 13px;
      animation: coniSlideUp 0.25s ease;
    }
    @keyframes coniSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    coni-header {
      background: linear-gradient(135deg, #0057B8, #00A6E0);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }
    coni-header img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.6);
      object-fit: cover;
    }
    coni-header .coni-info .coni-name {
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.3px;
    }
    coni-header .coni-info .coni-status {
      font-size: 11px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .coni-dot {
      width: 7px;
      height: 7px;
      background: #4ade80;
      border-radius: 50%;
      display: inline-block;
    }
    coni-close {
      margin-left: auto;
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    coni-close:hover {
      background: rgba(255,255,255,0.3);
    }
    #coni-messages {
      background: #f0f4f8;
      padding: 16px;
      height: 310px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    coni-messages::-webkit-scrollbar { width: 4px; }
    coni-messages::-webkit-scrollbar-thumb { background: #c0cfe0; border-radius: 4px; }
    .coni-bot, .coni-user {
      max-width: 80%;
      padding: 10px 14px;
      line-height: 1.55;
      font-size: 13px;
      word-break: break-word;
    }
    .coni-bot {
      background: white;
      border-radius: 4px 16px 16px 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      align-self: flex-start;
      color: #1e293b;
    }
    .coni-user {
      background: linear-gradient(135deg, #0057B8, #00A6E0);
      color: white;
      border-radius: 16px 16px 4px 16px;
      align-self: flex-end;
    }
    coni-input-area {
      background: white;
      padding: 10px 12px;
      display: flex;
      gap: 8px;
      align-items: center;
      border-top: 1px solid #e5e7eb;
    }
    coni-input {
      flex: 1;
      padding: 10px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 22px;
      outline: none;
      font-size: 13px;
      font-family: inherit;
      transition: border 0.2s;
      color: #1e293b;
    }
    coni-input:focus { border-color: #0057B8; }
    coni-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #0057B8, #00A6E0);
      color: white;
      cursor: pointer;
      font-size: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s;
      flex-shrink: 0;
    }
    coni-send:hover { transform: scale(1.08); }
  `;
  document.head.appendChild(style);

  const html = `
    <button id="coni-btn" onclick="coniToggle()" title="Chat dengan Coni">
      <img src="${CONI_IMG}" alt="Coni">
    </button>

    <div id="coni-box">
      <div id="coni-header">
        <img src="${CONI_IMG}" alt="Coni">
        <div class="coni-info">
          <div class="coni-name">Coni</div>
          <div class="coni-status">
            <span class="coni-dot"></span> ICONNET Assistant
          </div>
        </div>
        <button id="coni-close" onclick="coniToggle()">✕</button>
      </div>

      <div id="coni-messages">
        <div class="coni-bot">
          Halo! Saya <b>Coni</b> 👋<br>
          Asisten virtual ICONNET Sumbagsel.<br>
          Ada yang bisa saya bantu?
        </div>
      </div>

      <div id="coni-input-area">
        <input
          id="coni-input"
          type="text"
          placeholder="Ketik pertanyaan..."
          onkeypress="if(event.key==='Enter') coniSend()"
        >
        <button id="coni-send" onclick="coniSend()">➤</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  window.coniToggle = function () {
    const box = document.getElementById('coni-box');
    const btn = document.getElementById('coni-btn');
    const open = box.style.display === 'flex';
    box.style.display = open ? 'none' : 'flex';
    btn.style.display = open ? 'flex' : 'none';
    if (!open) document.getElementById('coni-input').focus();
  };

  window.coniSend = async function () {
    const input = document.getElementById('coni-input');
    const msgs  = document.getElementById('coni-messages');
    const text  = input.value.trim();
    if (!text) return;

    msgs.innerHTML += `<div class="coni-user">${text}</div>`;
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;

    const loading = document.createElement('div');
    loading.className   = 'coni-bot';
    loading.id          = 'coni-loading';
    loading.textContent = '⏳ Mengetik...';
    msgs.appendChild(loading);
    msgs.scrollTop = msgs.scrollHeight;

try {
      const res  = await fetch(WEBHOOK_URL, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ message: text })
      });

      const raw = await res.text();
      let reply;
      try {
        const data = JSON.parse(raw);
        reply = data.reply || data.output || data.message || raw;
      } catch {
        reply = raw; // kalau bukan JSON, pakai teks mentahnya langsung
      }

      // ubah **teks** jadi <b>teks</b> (bold beneran, tanpa tanda bintang)
      const cleanReply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

      document.getElementById('coni-loading').remove();
      msgs.innerHTML += `<div class="coni-bot">${cleanReply.replace(/\n/g, '<br>')}</div>`;
    } catch {
      document.getElementById('coni-loading').remove();
      msgs.innerHTML += `<div class="coni-bot" style="color:red">Maaf, terjadi kesalahan. Coba lagi!</div>`;
    }
    msgs.scrollTop = msgs.scrollHeight;
  };

})();
