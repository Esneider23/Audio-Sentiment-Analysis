const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const analyzeBtnTranscrition = document.getElementById(
  "analyzeBtnTranscrition"
);
const analizeBtnAudio = document.getElementById("analizeBtnAudio");
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
  resetTimer();
  audioChunks = [];
  isRecording = true;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });

  mediaRecorder.addEventListener("stop", async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayback.src = audioUrl;

    const formData = new FormData();
    formData.append("audio_data", audioBlob, "audio.wav");

    const swalLoading = Swal.fire({
      title: "Transcribing...",
      text: "Please wait while we process your recording.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("/transcribe", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    swalLoading.close();

    console.log(
      `Transcription ${result.status}: ${
        result.status === "success" ? result.data : result.message
      }`
    );
    if (result.status === "success") {
      transcription = result.data;
      message.innerText = transcription;
      analyzeBtnTranscrition.disabled = false;
      analyzeBtnTranscrition.style.backgroundColor = "green";
      analyzeBtnTranscrition.style.color = "white";
      analizeBtnAudio.disabled = false;
      analizeBtnAudio.style.backgroundColor = "green";
      analizeBtnAudio.style.color = "white";
    } else {
      message.innerText = "Error transcribing audio.";
    }

    stopTimer();
    isRecording = false;
  });

  mediaRecorder.start();
  startTimer();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
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

analyzeBtnTranscrition.addEventListener("click", async () => {
  if (isRecording) {
    message.innerText = "It cannot be analyzed while recording.";
    return;
  }

  if (transcription) {
    const swalLoading = Swal.fire({
      title: "Analizando...",
      text: "Por favor espera mientras analizamos la transcripción.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("/analyze-transcription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcription: transcription }),
    });

    const result = await response.json();

    swalLoading.close();

    if (result.status === "success") {
      message.innerHTML = `The transcription is: ${transcription} <br> Sentiment found: ${result.data}`;
    } else {
      message.innerText = "Error analyzing sentiment.";
    }
  } else {
    message.innerText = "No transcription available for analysis.";
  }
});

analizeBtnAudio.addEventListener("click", async () => {
  const formData = new FormData();
  formData.append(
    "audio_data",
    new Blob(audioChunks, { type: "audio/wav" }),
    "audio.wav"
  );

  if (isRecording) {
    message.innerText = "It cannot be analyzed while recording.";
    return;
  }
  if (transcription) {
    const swalLoading = Swal.fire({
      title: "Analyzing Emotion...",
      text: "Please wait while we analyze your recording.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("/predict-emotion", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);
      swalLoading.close();
      

      if (result.status === "success") {
        message.innerHTML = `The transcription is: ${transcription} <br> Emotion found: ${result.data}`;
      } else {
        Swal.fire({
          title: "Error",
          text: "Error analyzing emotion.",
          icon: "error",
        });
      }
    } catch (error) {
      swalLoading.close();
      Swal.fire({
        title: "Error",
        text: "An error occurred while processing the audio.",
        icon: "error",
      });
    }
  } else {
    message.innerText = "No transcription available for analysis.";
  }
});
const socket = io("http://127.0.0.1:8000"); // Cambia la URL según tu configuración

// Conexión al servidor WebSocket
socket.on("connect", () => {
  console.log("Conectado al servidor WebSocket");
});

socket.on("transcription", (data) => {
  console.log("Transcripción recibida:", data.text);
  message.innerText += `\n${data.text}`;
});

socket.on("error", (data) => {
  console.error("Error recibido:", data.message);
  message.innerText = "Error al procesar el audio.";
});

recordBtn.addEventListener("click", async () => {
  audioChunks = [];
  isRecording = true;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0 && isRecording) {
      socket.emit("audio_chunk", event.data);
    }
  });

  mediaRecorder.addEventListener("stop", () => {
    isRecording = false;
    console.log("Grabación detenida.");
  });

  mediaRecorder.start(250); // Graba fragmentos de 250ms
  recordBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
  }
});
