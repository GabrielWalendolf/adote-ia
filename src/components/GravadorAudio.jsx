import { useState, useRef } from 'react'

export default function GravadorAudio({ onGravacao, desabilitado }) {
  const [gravando, setGravando] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const recorderRef = useRef(null)
  const chunksRef   = useRef([])
  const timerRef    = useRef(null)

  const iniciar = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onGravacao(blob)
      }

      recorder.start()
      setGravando(true)
      setSegundos(0)
      timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000)
    } catch (e) {
      alert('Não foi possível acessar o microfone: ' + e.message)
    }
  }

  const parar = () => {
    recorderRef.current?.stop()
    clearInterval(timerRef.current)
    setGravando(false)
  }

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (gravando) {
    return (
      <button
        onClick={parar}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
      >
        <span className="w-3 h-3 rounded-sm bg-red-500 animate-pulse flex-shrink-0" />
        Parar gravação ({fmt(segundos)})
      </button>
    )
  }

  return (
    <button
      onClick={iniciar}
      disabled={desabilitado}
      className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold"
    >
      <i className="ti ti-microphone text-base" />
      Gravar Áudio
    </button>
  )
}
