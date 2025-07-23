import React, { useRef, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_URL = 'http://localhost:3000'; // Cambia si tu backend está en otro puerto
const TRANSLATION_URL = 'http://localhost:3000/traducir';

function App() {
  const [userId, setUserId] = useState(
    'user_' + Math.floor(Math.random() * 1000),
  );
  const [meetingId, setMeetingId] = useState('test-room');
  const [joined, setJoined] = useState(false);
  const [logs, setLogs] = useState([]);
  const signalingRef = useRef(null);
  const translationRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const addLog = (msg, data) => {
    setLogs((prev) => [
      { msg, data, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const joinCall = () => {
    // Conexión signaling
    const signaling = io(SIGNALING_URL, {
      query: { userId },
      transports: ['websocket'],
    });
    signalingRef.current = signaling;
    signaling.on('connect', () => {
      addLog('Conectado a signaling', signaling.id);
      signaling.emit('join-call', { meetingId });
    });
    signaling.on('user-joined-call', ({ userId }) => {
      addLog('Usuario se unió a la llamada', userId);
    });
    signaling.on('offer', (data) => addLog('Recibido offer', data));
    signaling.on('answer', (data) => addLog('Recibido answer', data));
    signaling.on('ice-candidate', (data) =>
      addLog('Recibido ice-candidate', data),
    );

    // Conexión traducción
    const translation = io(TRANSLATION_URL, {
      query: { userId },
      transports: ['websocket'],
    });
    translationRef.current = translation;
    translation.on('connect', () =>
      addLog('Conectado a traducción', translation.id),
    );
    translation.on('translated-text', (data) =>
      addLog('Texto traducido', data),
    );
    translation.on('translated-audio', (audio) =>
      addLog('Audio traducido recibido', audio),
    );

    setJoined(true);
  };

  const startRecording = async () => {
    if (!joined) {
      addLog('No se puede grabar: no unido a la llamada');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream, {
      mimeType: 'audio/webm',
    });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        addLog('Chunk de audio capturado', { size: e.data.size });
        e.data.arrayBuffer().then((buf) => {
          translationRef.current.emit('audio-chunk', buf);
          addLog('Audio chunk enviado', { size: buf.byteLength });
        });
      } else {
        addLog('Chunk de audio vacío, no se envía');
      }
    };
    mediaRecorder.start(250); // Envía cada 250ms
    addLog('Grabación iniciada');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      addLog('Grabación detenida');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Tester de Gateways (Signaling + Traducción)</h2>
      <div style={{ marginBottom: 16 }}>
        <label>User ID: </label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={joined}
        />
        <label style={{ marginLeft: 8 }}>Meeting ID: </label>
        <input
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          disabled={joined}
        />
        <button onClick={joinCall} disabled={joined} style={{ marginLeft: 8 }}>
          Unirse
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={startRecording} disabled={!joined}>
          Iniciar grabación
        </button>
        <button onClick={stopRecording} disabled={!joined}>
          Detener grabación
        </button>
      </div>
      <div
        style={{
          background: '#222',
          color: '#0f0',
          padding: 12,
          minHeight: 200,
          fontSize: 13,
          borderRadius: 8,
        }}
      >
        <b>Logs:</b>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {logs.map((log, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              <span style={{ color: '#888' }}>[{log.time}]</span>{' '}
              <b>{log.msg}:</b>{' '}
              {typeof log.data === 'object' ? (
                <pre style={{ display: 'inline', color: '#fff' }}>
                  {JSON.stringify(log.data)}
                </pre>
              ) : (
                String(log.data)
              )}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 16, color: '#888', fontSize: 12 }}>
        Abre esta app en varias pestañas y usa el mismo Meeting ID para simular
        una llamada grupal.
        <br />
        El audio se envía a Azure y la traducción se muestra en los logs.
      </div>
    </div>
  );
}

export default App;
