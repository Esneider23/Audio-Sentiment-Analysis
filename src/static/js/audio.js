const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioPlayback = document.getElementById("audioPlayback");
const message = document.getElementById("message");
const waveform = document.getElementById("waveform");

let mediaRecorder;
let audioChunks = [];
let recordingTime = 0;
let timerInterval;
let transcription = "";
let isRecording = false;

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    recordingTime++;
    waveform.innerText = formatTime(recordingTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  recordingTime = 0;
  waveform.innerText = formatTime(recordingTime);
}

recordBtn.addEventListener("click", async () => {
  try {
    resetTimer();
    audioChunks = [];
    isRecording = true;

    // Solicitar acceso al micrófono
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Configurar MediaRecorder
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");

      const swalLoading = Swal.fire({
        title: "Transcribing...",
        text: "Please wait while we process your recording.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const fields_data = [
        {
            name: "paciente",
            description: "Nombre del paciente",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "motivo_consulta",
            description: "Motivo de la consulta",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Enfermedad_actual",
            description: "Síntomas principales",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "antecedentes_personales",
            description: "son una recopilación de información sobre la salud de una persona",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "antecedentes_familiares",
            description: "registro de enfermedades y afecciones de salud de una persona y los familiares",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Avsc OD",
            description: "Agudeza visual del ojo derecho sin corrección óptica. Ejemplo estándar: 20/100.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Avsc OI",
            description: "Agudeza Visual Sin Corrección del Ojo Izquierdo. Ejemplo estándar: 20/100.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Avsc cercana OD",
            description: "Agudeza Visual Sin Corrección Cercana del Ojo Derecho. Ejemplo estándar: 20/20.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Avsc cercana OI",
            description: "Agudeza Visual Sin Corrección Cercana del Ojo Izquierdo. Ejemplo estándar: 20/20",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Queratometría OD",
            description: "Señalamiento del meridiano corneal más plano y más curvo del Ojo Derecho. Ejemplo estándar: 42.75/47.75 * 179.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Queratometría OI",
            description: "Señalamiento del meridiano corneal más plano y más curvo del Ojo Izquierdo. Ejemplo estándar: 42.75/47.75 * 179.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "subjetivo OD",
            description: "Señalamiento del meridiano corneal más plano y más curvo del Ojo Derecho. basado en la respuesta del pasiente Ejemplo estándar: -3.25-3*0 20/20",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "subjetivo OI",
            description: "Señalamiento del meridiano corneal más plano y más curvo del Ojo Izquierdo. basado en la respuesta del paciente Ejemplo estándar: -3.25-3*0 20/20",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Retinoscopia OD",
            description: "Observación de reflejo reteoicoopico para determinar el poder interno del globo ocular ejemplo estandar del ojo derecho: -2.75-3.0*0",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Retinoscopia OI",
            description: "Observación de reflejo reteoicoopico para determinar el poder interno del globo ocular ejemplo estandar del ojo izquierdo: 2.75-3.0*0",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Motilidad Ocular",
            description: "Evaluación del movimiento de los ojos en todas las direcciones para determinar la funcionalidad de los músculos oculares y detectar posibles alteraciones como estrabismo o limitaciones en los movimientos. Ejemplo estándar: 'Movimientos completos y coordinados en todas las direcciones'.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Cover Test",
            description: "Prueba clínica utilizada para evaluar la alineación ocular y detectar desviaciones como estrabismo o forias. Se realiza cubriendo y descubriendo los ojos de forma alterna para observar el movimiento de corrección. Ejemplo estándar: 'Ojos alineados sin movimientos de corrección'.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Esteropsis",
            description: "Evaluación de la percepción de profundidad y visión tridimensional utilizando pruebas como figuras estereoscópicas o gafas polarizadas. Ejemplo estándar: 'Percepción tridimensional normal a 40 cm'.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Amsler",
            description: "Prueba para detectar alteraciones en la mácula o el campo visual central mediante una cuadrícula observada a corta distancia. Ejemplo estándar: 'Sin distorsiones ni puntos ciegos'.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "Ishihara",
            description: "Prueba para evaluar la percepción de los colores y detectar deficiencias como el daltonismo mediante láminas de puntos de colores que forman números o patrones. Ejemplo estándar: 'Percepción normal de los colores'.",
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
            name: "Diagnósticos",
            description: "Registro de los diagnósticos clínicos obtenidos tras la evaluación. Incluye un diagnóstico principal y hasta tres diagnósticos relacionados. Ejemplo estándar: Diagnóstico principal: 'Miopía'. Diagnósticos relacionados: 'Astigmatismo', 'Presbicia'.",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "lensometria OD",
            description: "Poder esférico y cilíndrico de un lente que corrige defectos refractivos del Ojo Derecho. Ejemplo estándar: -1.75-5.0*0",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "lensometria OI",
            description: "formula o prescripcion de los lentes actuales ejemplo estandar ojo izquierdo: -2.50-0.50*170",
            data_type: "string",
            is_dropdown: false,
            options: []
        },
        {
            name: "tipo de lente",
            description: "tipo de lente prescrito ejemplo estandar: monofocales, bifocales, progresivos ",
            data_type: "string",
            is_dropdown: false,
            options: []
        }
    ];

      const fields = JSON.stringify(fields_data);

      formData.append("fields", fields); // Como en el curl, se envía el JSON como string

      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXIiLCJleHAiOjE3MzU4Mjc1Mzd9.KlM_DehGp4squt4LAfZUfe-w3Hf_108vwEe0vHw9aSc";

      try {
        console.log("transmitiendo");
        const response = await fetch(
          "http://localhost:8000/api/v1/extract?worker=12",
          {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const result = await response.json();

        swalLoading.close();
        if (result.status === "success") {
          const extractedFields =
            result.data.information.extraction.extracted_fields;
          const fieldsTableBody = document.getElementById("fields");
          fieldsTableBody.innerHTML = ""; // Clear existing table rows

          extractedFields.forEach((field) => {
            const row = document.createElement("tr");

            const fieldNameCell = document.createElement("td");
            fieldNameCell.innerText = field.name;
            row.appendChild(fieldNameCell);

            const fieldValueCell = document.createElement("td");
            fieldValueCell.innerText = field.value
              ? field.value
              : "Not available";
            row.appendChild(fieldValueCell);

            fieldsTableBody.appendChild(row);
          });
        } else {
          message.innerText = "Error transcribing audio.";
        }
        // After receiving the response and ensuring it's successful
      } catch (error) {
        swalLoading.close();
        message.innerText = "Error while processing the transcription.";
        console.error("Transcription Error:", error);
      }
    });

    // Iniciar grabación y el temporizador
    mediaRecorder.start();
    startTimer();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (error) {
    message.innerText = "Error accessing microphone. Please check permissions.";
    console.error("Microphone Access Error:", error);
  }
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    isRecording = false;
    stopTimer();
  }
});
