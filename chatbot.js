(function () {

  const WEBHOOK_URL = 'https://nurjana.app.n8n.cloud/webhook/iconnet-bot';
  const CONI_IMG    = 'coni.png';
  const STORAGE_KEY = 'coni_chat_history';

  const style = document.createElement('style');
  style.textContent = `

    coni-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px 8px 8px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    coni-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.18);
    }

    coni-btn .coni-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    coni-btn img {
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      border-radius: 50%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

    coni-btn .coni-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      background: #0096b8;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: white;
    }

    coni-btn .coni-btn-label {
      font-family: 'Poppins', 'Segoe UI', sans-serif;
      font-weight: 700;
      font-size: 13px;
      color: #1e293b;
    }

    coni-box {
      position: fixed;
      bottom: 92px;
      right: 24px;
      z-index: 9999;
      width: 355px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      font-family: 'Poppins', 'Segoe UI', sans-serif;
      font-size: 13px;
      background: #ffffff;
      animation: coniSlideUp 0.22s ease;
    }

    @keyframes coniSlideUp {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    coni-header {
      background: linear-gradient(135deg, #007fa3, #00b4d8);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    coni-header img {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      border-radius: 50%;
      object-fit: cover;
      object-position: center;
      border: 2px solid rgba(255,255,255,0.5);
      display: block;
    }

    coni-header .coni-info .coni-name {
      font-weight: 700;
      font-size: 14px;
    }

    coni-header .coni-info .coni-sub {
      font-size: 11px;
      opacity: 0.88;
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
      animation: coniPulse 2s infinite;
    }

    @keyframes coniPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }

    coni-close {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      opacity: 0.85;
    }

    coni-close:hover {
      opacity: 1;
    }

    coni-messages {
      background: #f4f7f9;
      padding: 14px;
      height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    coni-messages::-webkit-scrollbar {
      width: 3px;
    }

    coni-messages::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .coni-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .coni-row.right {
      justify-content: flex-end;
    }

    .coni-av {
      width: 26px;
      height: 26px;
      min-width: 26px;
      min-height: 26px;
      border-radius: 50%;
      object-fit: cover;
      object-position: center;
      flex-shrink: 0;
      display: block;
    }

    .coni-bot-bubble,
    .coni-user-bubble {
      max-width: 78%;
      padding: 10px 14px;
      line-height: 1.55;
      font-size: 13px;
      word-break: break-word;
    }

    .coni-bot-bubble {
      background: #ffffff;
      border: 1px solid #e8ecf0;
      border-radius: 2px 14px 14px 14px;
      color: #27303a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .coni-user-bubble {
      background: linear-gradient(135deg, #007fa3, #00b4d8);
      color: white;
      border-radius: 14px 14px 2px 14px;
    }

    #coni-input-area {
      background: white;
      padding: 10px 12px;
      display: flex;
      gap: 8px;
      align-items: center;
      border-top: 1px solid #eef0f3;
    }

    coni-input {
      flex: 1;
      padding: 9px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      outline: none;
      font-size: 13px;
      font-family: inherit;
      color: #27303a;
      transition: border 0.2s;
      background: #fafafa;
    }

    coni-input:focus {
      border-color: #00b4d8;
      background: white;
    }

    coni-send {
      width: 36px;
      height: 36px;
      border: none;
      background: none;
      color: #007fa3;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s;
      flex-shrink: 0;
    }

    coni-send:hover {
      transform: scale(1.15);
    }

    coni-footer {
      background: white;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      padding: 6px;
      border-top: 1px solid #f1f5f9;
    }

  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="coni-btn" onclick="coniToggle()" title="Chat dengan Coni">
      <span class="coni-avatar-wrap">
        <img src="${CONI_IMG}" alt="Coni">
        <span class="coni-badge">💬</span>
      </span>
      <span class="coni-btn-label">Coni</span>
    </button>

    <div id="coni-box">
      <div id="coni-header">
        <img src="${CONI_IMG}" alt="Coni">
        <div class="coni-info">
          <div class="coni-name">Coni</div>
          <div class="coni-sub">
            <span class="coni-dot"></span> ICONNET Assistant
          </div>
        </div>
        <button id="coni-close" onclick="coniToggle()">✕</button>
      </div>

      <div id="coni-messages"></div>

      <div id="coni-input-area">
        <input
          id="coni-input"
          type="text"
          placeholder="Ketik pertanyaan..."
          onkeypress="if(event.key==='Enter') coniSend()"
        >
        <button id="coni-send" onclick="coniSend()">➤</button>
      </div>

      <div id="coni-footer">Powered by ICONNET Sumbagsel</div>
    </div>
  `);


  function renderMessage(type, text) {
    const msgs = document.getElementById('coni-messages');
    if (type === 'bot') {
      msgs.innerHTML += `
        <div class="coni-row">
          <img src="${CONI_IMG}" class="coni-av" alt="Coni">
          <div class="coni-bot-bubble">${text}</div>
        </div>`;
    } else {
      msgs.innerHTML += `
        <div class="coni-row right">
          <div class="coni-user-bubble">${text}</div>
        </div>`;
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  function loadHistory() {
    const history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    if (history.length === 0) {
      renderMessage('bot', 'Halo! Saya <b>Coni</b> 👋<br>Asisten virtual ICONNET Sumbagsel.<br>Ada yang bisa saya bantu?');
    } else {
      history.forEach(item => renderMessage(item.type, item.text));
    }
  }

  function saveHistory(type, text) {
    const history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    history.push({ type, text });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }


  window.coniToggle = function () {
    const box  = document.getElementById('coni-box');
    const btn  = document.getElementById('coni-btn');
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

    renderMessage('user', text);
    saveHistory('user', text);
    input.value = '';

    const loading = document.createElement('div');
    loading.className = 'coni-row';
    loading.id        = 'coni-loading';
    loading.innerHTML = `
      <img src="${CONI_IMG}" class="coni-av" alt="Coni">
      <div class="coni-bot-bubble">⏳ Mengetik...</div>
    `;
    msgs.appendChild(loading);
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const res = await fetch(WEBHOOK_URL, {
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
        reply = raw;
      }

      let clean = reply
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/^###?\s*(.*$)/gm, '<b>$1</b>')
        .replace(/\n/g, '<br>');

      document.getElementById('coni-loading').remove();
      renderMessage('bot', clean);
      saveHistory('bot', clean);

    } catch {
      document.getElementById('coni-loading').remove();
      renderMessage('bot', '<span style="color:#ef4444">Maaf, terjadi kesalahan. Coba lagi!</span>');
    }
  };

  // ================================================
  // INIT
  // ================================================
  loadHistory();

})();
