'use client'

import { useEffect, useState } from 'react'
import mqtt from 'mqtt'

const BROKER_URL = 'ws://3.38.211.16:9001'
const TOPIC_COMMAND = 'home/light/command'
const TOPIC_STATUS = 'home/light/status'

export default function Home() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [lightOn, setLightOn] = useState(false)

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL)

    mqttClient.on('connect', () => {
      console.log('MQTT 연결 완료')
      setConnected(true)
      mqttClient.subscribe(TOPIC_STATUS)
    })

    mqttClient.on('message', (topic, payload) => {
      const message = payload.toString()
      console.log(`수신 [${topic}]: ${message}`)
      if (topic === TOPIC_STATUS) {
        setLightOn(message.includes('ON'))
      }
    })

    mqttClient.on('disconnect', () => {
      setConnected(false)
    })

    setClient(mqttClient)

    return () => {
      mqttClient.end()
    }
  }, [])

  const toggleLight = (on: boolean) => {
    if (!client || !connected) return
    const payload = JSON.stringify({ action: on ? 'ON' : 'OFF' })
    client.publish(TOPIC_COMMAND, payload)
    setLightOn(on)
  }

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-white">maru 스마트홈</h1>

      {/* 연결 상태 */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-gray-300">{connected ? '브로커 연결됨' : '연결 중...'}</span>
      </div>

      {/* 전구 아이콘 */}
      <div className={`text-9xl transition-all duration-300 ${lightOn ? 'opacity-100' : 'opacity-20'}`}>
        💡
      </div>

      {/* 제어 버튼 */}
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
    </main>
  )
}
