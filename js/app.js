// Selección de elementos del DOM
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Función para mostrar mensajes en el chat
function appendMessage(sender, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender === "user" ? "user" : "ai");
    messageElement.innerText = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Manejo del formulario (envío de mensaje)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userInput = input.value.trim();
    if (!userInput) return;

    appendMessage("user", userInput);
    input.value = "";

    appendMessage("ai", "Pensando...");

    try {
        const response = await fetch("http://localhost:5157/api/querywithlearning", {                                      
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: userInput,
                n_results: 3,
                model:"meta-llama-3.1-8b-instruct"//"deepseek-r1-distill-qwen-7b" //"meta-llama-3.1-8b-instruct"
            })
        });

        const data = await response.json();

        // Elimina el "Pensando..." antes de mostrar la respuesta real
        const thinkingMsg = chatBox.querySelector(".message.ai:last-child");
        if (thinkingMsg && thinkingMsg.innerText === "Pensando...") {
            thinkingMsg.remove();
        }

        appendMessage("ai", data.response || "No recibí respuesta.");
    } catch (err) {
        appendMessage("ai", "Error al comunicarse con el servidor.");
        console.error(err);
    }
});