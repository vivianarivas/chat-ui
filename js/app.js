// Selección de elementos del DOM
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Autoajustar altura del textarea al escribir
input.addEventListener("input", () => {
    input.style.height = "auto"; // reinicia
    input.style.height = (input.scrollHeight) + "px"; // ajusta
});

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

//Subir Archivos
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const topicInput = document.getElementById("topic-input");

uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const topic = topicInput.value.trim();
    const user = "vrivas"; // lo podés parametrizar si querés

    if (!file || !topic) {
        alert("Por favor seleccioná un archivo y completá el topic.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const uploadStatus = document.getElementById("upload-status");
    uploadStatus.style.display = "flex"; // Mostrar spinner

    try {
        const response = await fetch(`http://localhost:5157/api/extracttext/upload-and-store?filePath=${encodeURIComponent(file.name)}&user=${user}&topic=${encodeURIComponent(topic)}`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        // Mostrar mensaje exitoso
        uploadStatus.innerHTML = '<span class="status-text" style="color: green;">✅ Archivo subido correctamente</span>';

        appendMessage("ai", `📄 Archivo procesado. Respuesta del servidor: ${result.message || "OK"}`);
    } catch (err) {
        uploadStatus.innerHTML = '<span class="status-text" style="color: red;">❌ Error al subir el archivo</span>';
        appendMessage("ai", "❌ Error al subir el archivo.");
        console.error(err);
    }
});