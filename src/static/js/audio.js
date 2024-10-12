const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const audioPlayback = document.getElementById("audioPlayback");
const message = document.getElementById("message");
const waveform = document.getElementById("waveform");

let mediaRecorder;
let audioChunks = [];
let recordingTime = 0;
let timerInterval;
let transcription = "";

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

    // Mostrar SweetAlert2 spinner
    const swalLoading = Swal.fire({
      title: 'Transcribiendo...',
      text: 'Por favor espera mientras procesamos tu grabación.',
      allowOutsideClick: false,
      showConfirmButton: false, // Ocultar botón de confirmación
      willOpen: () => {
        Swal.showLoading(); // Mostrar el loading spinner
      }
    });

    const response = await fetch("/transcribe", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    // Ocultar SweetAlert2 spinner
    swalLoading.close();

    console.log(
      `Transcription ${result.status}: ${
        result.status === "success" ? result.data : result.message
      }`
    );
    if (result.status === "success") {
      transcription = result.data;
      message.innerText = transcription;
      analyzeBtn.disabled = false;
      analyzeBtn.style.backgroundColor = "green";
      analyzeBtn.style.color = "white";
    }
    if (result.status === "error") {
      message.innerText = "Error transcribing audio.";
    }
    stopTimer();
  });

  mediaRecorder.start();
  startTimer();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
});

analyzeBtn.addEventListener("click", async () => {
  if (transcription) {
    const swalLoading = Swal.fire({
      title: 'Analizando...',
      text: 'Por favor espera mientras analizamos la transcripción.',
      allowOutsideClick: false,
      showConfirmButton: false, // Ocultar botón de confirmación
      willOpen: () => {
        Swal.showLoading(); // Mostrar el loading spinner
      }
    });

    const response = await fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcription: transcription }),
    });

    const result = await response.json();

    // Ocultar SweetAlert2 spinner
    swalLoading.close();

    if (result.status === "success") {
      message.innerText = `Sentiment found: ${result.data}`;
    } else {
      message.innerText = "Error analyzing sentiment.";
    }
  } else {
    message.innerText = "No transcription available for analysis.";
  }
});
