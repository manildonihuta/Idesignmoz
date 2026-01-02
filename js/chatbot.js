document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const chatWindow = document.getElementById('chatbot-window');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const inputField = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    let isOpen = false;
    
    // IMPORTANT: Replace with your actual Gemini API Key
    const API_KEY = 'YOUR_GEMINI_API_KEY'; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    // Toggle Chat Window
    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (isOpen && messagesContainer.children.length === 0) {
            addBotMessage("Olá! Sou o assistente virtual da IDesign Moz, alimentado por inteligência artificial. Como posso ajudar você a elevar seu negócio hoje?");
        }
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        chatWindow.style.display = 'none';
    });

    // Send Message Logic
    async function sendMessage() {
        const text = inputField.value.trim();
        if (text) {
            addUserMessage(text);
            inputField.value = '';
            
            // Show typing indicator
            const typingIndicator = showTypingIndicator();
            
            try {
                const response = await callGeminiAPI(text);
                messagesContainer.removeChild(typingIndicator);
                addBotMessage(response);
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                messagesContainer.removeChild(typingIndicator);
                addBotMessage("Desculpe, estou tendo problemas para me conectar ao meu cérebro digital no momento. Por favor, tente novamente mais tarde ou contate-nos pelo WhatsApp.");
            }
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function addBotMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        // Simple markdown parsing for bold text
        msgDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'typing-indicator';
        indicatorDiv.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        messagesContainer.appendChild(indicatorDiv);
        scrollToBottom();
        return indicatorDiv;
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function callGeminiAPI(userMessage) {
        if (API_KEY === 'YOUR_GEMINI_API_KEY') {
            return "⚠️ A chave da API Gemini não foi configurada. Por favor, adicione sua chave de API no arquivo chatbot.js para que eu possa funcionar corretamente.";
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: `Você é um assistente virtual útil e profissional da agência IDesign Moz (uma agência de web design, desenvolvimento e marketing em Moçambique). 
                    Responda às perguntas dos clientes de forma concisa, educada e persuasiva. 
                    Serviços que oferecemos: Web Design, Desenvolvimento de Software, Design Gráfico, Marketing Digital.
                    Contato: +258 864321240.
                    Usuário disse: ${userMessage}`
                }]
            }]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        
        // Safety check for response structure
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Desculpe, não consegui processar sua resposta.";
        }
    }
});
