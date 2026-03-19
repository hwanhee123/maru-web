'use client'

import { useEffect, useState } from 'react'
import mqtt from 'mqtt'

const BROKER_URL = 'ws://43.202.237.62:9001'
const TOPIC_COMMAND = 'home/light/command'
const TOPIC_STATUS = 'home/light/status'

// MQTT 인증 정보
const MQTT_USERNAME = 'maru'
const MQTT_PASSWORD = 'maru1234'

export default function Home() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [lightOn, setLightOn] = useState(false)
  const [brightness, setBrightness] = useState(255)

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
    })

    mqttClient.on('connect', () => {
      console.log('MQTT 연결 완료')
      setConnected(true)
      mqttClient.subscribe(TOPIC_STATUS)
    })

    mqttClient.on('message', (topic, payload) => {
      const message = payload.toString()
      if (topic === TOPIC_STATUS) {
        try {
          const data = JSON.parse(message)
          setLightOn(data.status === 'ON')
          if (data.brightness !== undefined) setBrightness(data.brightness)
        } catch {
          setLightOn(message.includes('ON'))
        }
      }
    })

    mqttClient.on('disconnect', () => setConnected(false))
    setClient(mqttClient)
    return () => { mqttClient.end() }
  }, [])

  const sendCommand = (action: string, value?: number) => {
    if (!client || !connected) return
    const payload = value !== undefined
      ? JSON.stringify({ action, value })
      : JSON.stringify({ action })
    client.publish(TOPIC_COMMAND, payload)
  }

  const toggleLight = (on: boolean) => {
    sendCommand(on ? 'ON' : 'OFF')
    setLightOn(on)
  }

  const handleBrightness = (value: number) => {
    setBrightness(value)
    sendCommand('BRIGHTNESS', value)
    setLightOn(value > 0)
  }

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-4xl font-bold text-white">maru 스마트홈</h1>

      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-gray-300">{connected ? '브로커 연결됨' : '연결 중...'}</span>
      </div>

      <div
        className="text-9xl transition-all duration-300"
        style={{ opacity: lightOn ? brightness / 255 * 0.8 + 0.2 : 0.15 }}
      >
        💡
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => toggleLight(true)}
          disabled={!connected || lightOn}
          className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-xl disabled:opacity-40 hover:bg-yellow-300 transition"
        >
          켜기
        </button>
        <button
          onClick={() => toggleLight(false)}
          disabled={!connected || !lightOn}
          className="px-8 py-4 bg-gray-600 text-white font-bold rounded-xl text-xl disabled:opacity-40 hover:bg-gray-500 transition"
        >
          끄기
        </button>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex justify-between text-gray-300 text-sm">
          <span>밝기</span>
          <span>{Math.round(brightness / 255 * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          value={brightness}
          onChange={(e) => handleBrightness(Number(e.target.value))}
          disabled={!connected}
          className="w-full accent-yellow-400 disabled:opacity-40"
        />
        <div className="flex justify-between text-gray-500 text-xs">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </main>
  )
}
