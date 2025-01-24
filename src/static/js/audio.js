const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioPlayback = document.getElementById("audioPlayback");
const message = document.getElementById("message");
const waveform = document.getElementById("waveform");


let mediaRecorder;
let audioChunks = [];
let recordingTime = 0;
let timerInterval;
let isRecording = false;
let originalFields = []; // Initialize this variable to store original fields data
let updatedFields = [];
let transcription

const fields_data = [
  {
    name: "Motivo de Consulta",
    description: "Es la causa principal por la cual el paciente acude al médico.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Enfermedad Actual",
    description: "Descripción lo más detallada posible de los síntomas o molestias principales asociados al motivo de consulta, incluyendo circunstancias que los exacerban o alivian.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Antecedentes Personales",
    description: "Información sobre enfermedades sistémicas (como hipertensión o diabetes) o antecedentes oftalmológicos relevantes (cirugías o traumas oculares) propias. Ejemplo estándar: 'Hipertensión arterial controlada con medicación'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Antecedentes Familiares",
    description: "Historia familiar de enfermedades sistémicas (como hipertensión o diabetes) o visuales (como glaucoma o ceguera). Ejemplo estándar: 'Madre con diabetes tipo 2'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Tonometria OD",
    description: "Es la Presión que se ejerce en el interior del Ojo Derecho, y es medida en milímetros de mercurio (mm Hg). Ejemplo: 7.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Tonometria OI",
    description: "Es la Presión que se ejerce en el interior del Ojo Izquierdo, y es medida en milímetros de mercurio (mm Hg). Ejemplo: 7.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Anexos y Parpados OD",
    description: "Examen de los anexos oculares y párpados del Ojo Derecho para detectar alteraciones como blefaritis o chalazión. Ejemplo estándar: 'Párpados simétricos, sin lesiones, sin secreciones'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Biomicroscopia OD",
    description: "Examen ocular que utiliza una lámpara de hendidura para evaluar estructuras como córnea, iris y cristalino en detalle del Ojo Derecho. Ejemplo estándar: 'Córnea transparente, sin lesiones, cámara anterior profunda, cristalino transparente'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Biomicroscopia OI",
    description: "Examen ocular que utiliza una lámpara de hendidura para evaluar estructuras como córnea, iris y cristalino en detalle del Ojo Izquierdo. Ejemplo estándar: 'Córnea transparente, sin lesiones, cámara anterior profunda, cristalino transparente'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Gonioscopia OD",
    description: "Examen oftalmológico que evalúa el ángulo de drenaje del ojo entre la córnea y el iris mediante un lente de contacto especial del Ojo Derecho. Este examen es clave para diagnosticar y clasificar el glaucoma. Ejemplo estándar: 'Ángulo abierto en 360 grados'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Gonioscopia OI",
    description: "Examen oftalmológico que evalúa el ángulo de drenaje del ojo entre la córnea y el iris mediante un lente de contacto especial. Este examen es clave para diagnosticar y clasificar el glaucoma. Ejemplo estándar: 'Ángulo abierto en 360 grados'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Fondo de Ojo OD",
    description: "Examina la retina, nervio óptico y vasos sanguíneos del Ojo Derecho, detectando enfermedades como retinopatía o glaucoma.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Fondo de Ojo OI",
    description: "Examina la retina, nervio óptico y vasos sanguíneos del Ojo Izquierdo, detectando enfermedades como retinopatía o glaucoma.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Observaciones",
    description: "Espacio para registrar comentarios adicionales, hallazgos relevantes o información complementaria sobre los resultados de las pruebas. Ejemplo estándar: 'No se preescribe correccion optica, se recomienda cicloplejia'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Plan y conducta",
    description: "Detallan los pasos terapéuticos, diagnósticos o preventivos a seguir según la evaluación clínica, adaptados a las necesidades del paciente.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
  {
    name: "Procedimientos Ordenados",
    description: "Registro de procedimientos médicos, exámenes o tratamientos recomendados para el paciente. Ejemplo estándar: 'Control de presión intraocular cada 6 meses', 'ABERROMETRIA OCULAR; CANTIDAD: 1', 'BIOMETRIA OCULAR; CANTIDAD: 1'.",
    data_type: "string",
    is_dropdown: false,
    options: []
  },
];

function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    waveform.innerText = formatTime(++recordingTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  recordingTime = 0;
  waveform.innerText = formatTime(recordingTime);
}

async function handleRecording() {
  try {
    resetTimer();
    audioChunks = [];
    isRecording = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener("dataavailable", event => audioChunks.push(event.data));
    mediaRecorder.addEventListener("stop", handleStopRecording);

    mediaRecorder.start();
    startTimer();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (error) {
    message.innerText = "Error accessing microphone. Please check permissions.";
    console.error("Microphone Access Error:", error);
  }
}

async function handleStopRecording() {
  try {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    audioPlayback.src = URL.createObjectURL(audioBlob);

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    formData.append("fields", JSON.stringify(fields_data));

    const swalLoading = Swal.fire({
      title: "Transcribing...",
      text: "Please wait while we process your recording.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => Swal.showLoading(),
    });

    const token = "YOUR_AUTH_TOKEN";
    const response = await fetch("http://localhost:8000/api/v1/extract?worker=8", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    swalLoading.close();

    if (result.status === "success") {
      transcription = result.data.information.transcription.text;
      displayExtractedFields(result.data.information.extraction.extracted_fields);
    } else {
      message.innerText = "Error transcribing audio.";
    }
  } catch (error) {
    Swal.close();
    message.innerText = "Error while processing the transcription.";
    console.error("Transcription Error:", error);
  }
}

function displayExtractedFields(extractedFields) {
  const fieldsTableBody = document.getElementById("fields");
  fieldsTableBody.innerHTML = ""; // Limpiar contenido anterior

  // Guardar los campos originales sin modificarlos
  originalFields = extractedFields.map(field => ({
    name: field.name,
    value: field.value ? field.value : ""
  }));

  extractedFields.forEach((field) => {
    const row = document.createElement("tr");
  
    // Crear celda para el nombre del campo
    const fieldNameCell = document.createElement("td");
    fieldNameCell.innerText = field.name;
    row.appendChild(fieldNameCell);
  
    // Crear celda para el valor del campo (presentado inicialmente como texto)
    const fieldValueCell = document.createElement("td");
    fieldValueCell.innerText = field.value ? field.value : " ";
    row.appendChild(fieldValueCell);
  
    // Crear celda para el botón "Editar"
    const editButtonCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.innerText = "Editar";
    editButton.classList.add("edit-btn");
  
    // Evento para habilitar/deshabilitar la edición
    editButton.addEventListener("click", () => {
      // Verificar si la celda contiene un textarea
      const currentText = fieldValueCell.querySelector("textarea");
      
      if (currentText) {
        // Si ya hay un textarea (modo de edición), guardar el nuevo valor
        const newValue = currentText.value;
        // Reemplazar el contenido del textarea con el nuevo valor
        fieldValueCell.innerText = newValue; // Mostrar el nuevo valor en formato de texto
        updateFieldValue(field.name, newValue); // Enviar al servidor
  
        editButton.innerText = "Editar"; // Cambiar el botón a "Editar"
      } else {
        // Si no hay un textarea (modo de visualización), cambiar a modo de edición
        const textArea = document.createElement("textarea");
        textArea.value = field.value ? field.value : "";  // Usar el valor original si está disponible
        textArea.rows = 4;  // Ajusta el número de filas (tamaño del textarea)
        textArea.cols = 30;  // Ajusta el número de columnas
        fieldValueCell.innerHTML = ""; // Limpiar la celda
        fieldValueCell.appendChild(textArea); // Agregar el textarea
  
        editButton.innerText = "Guardar"; // Cambiar el botón a "Guardar"
      }
    });
  
    editButtonCell.appendChild(editButton);
    row.appendChild(editButtonCell);
  
    fieldsTableBody.appendChild(row);
  });
}

async function updateFieldValue(fieldName, newValue) {
  try {
    // Buscar el campo original en originalFields
    const originalField = originalFields.find(field => field.name === fieldName);
    
    if (originalField) {
      // Si el valor fue modificado, agregarlo a updatedFields
      const updatedField = {
        name: fieldName,
        value: newValue
      };

      // Comprobar si el campo ya está en la lista de actualizados
      const existingUpdatedField = updatedFields.find(field => field.name === fieldName);
      if (existingUpdatedField) {
        existingUpdatedField.value = newValue; // Actualizar el valor si ya está en la lista
      } else {
        updatedFields.push(updatedField); // Si no está, agregarlo a la lista de actualizados
      }
    }

    console.log("Campo actualizado:", fieldName);
  } catch (error) {
    console.error("Error al actualizar el campo:", error);
  }
}

async function sendFields() {
  try {
    const formData = new FormData();
    
    // Enviar los campos originales
    formData.append("original_field", JSON.stringify(originalFields));
    
    // Enviar los campos actualizados
    formData.append("feedback_field", JSON.stringify(updatedFields));

    formData.append("text_transcription", transcription);

    const token = "your-token-here"; // Usa el token real para la autenticación

    const response = await fetch("http://localhost:8000/api/v1/feedback", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (result.status === "success") {
      console.log("Campos enviados correctamente!");
    } else {
      console.error("Error al enviar los campos:", result.message);
    }
  } catch (error) {
    console.error("Error al enviar los campos:", error);
  }
}



recordBtn.addEventListener("click", handleRecording);

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    isRecording = false;
    stopTimer();
  }
});

document.getElementById("sendBtn").addEventListener("click", sendFields);