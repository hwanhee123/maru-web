# 🦆 maru — IoT 스마트홈 웹 컨트롤러

> MQTT over WebSocket 기반의 실시간 IoT 제어 웹 애플리케이션

## 프로젝트 개요

**maru**는 ESP32 마이크로컨트롤러와 AWS EC2 MQTT 브로커를 연동하여, 어디서든 인터넷만 있으면 스마트홈 기기를 제어할 수 있는 풀스택 IoT 프로젝트입니다.

웹 UI에서 버튼 하나를 누르면 AWS 서버를 통해 집 안의 ESP32 기기로 신호가 전달되어 LED를 제어합니다.

---

## 시스템 아키텍처

```
[Next.js 웹 UI]
      |
  WebSocket (port 9001)
      |
[AWS EC2 - Aedes MQTT 브로커]
      |
    MQTT (port 1883)
      |
[ESP32 DevkitC V1]
      |
    GPIO
      |
[LED / 스마트홈 기기]
```

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| 통신 | MQTT over WebSocket (mqtt.js) |
| 브로커 | Aedes (Node.js), AWS EC2 |
| 하드웨어 | ESP32 DevkitC V1, Arduino (C++) |
| 인프라 | AWS EC2 (Ubuntu 24.04), PM2 |

---

## 주요 기능

- 실시간 LED ON/OFF 제어
- 브로커 연결 상태 실시간 표시
- LED 상태 피드백 (ESP32 → 브로커 → 웹 UI)
- 어디서든 인터넷만 있으면 접속 가능

---

## MQTT 토픽 구조

| 토픽 | 방향 | 페이로드 |
|------|------|---------|
| `home/light/command` | 웹 → ESP32 | `{ "action": "ON" }` |
| `home/light/status` | ESP32 → 웹 | `{ "status": "ON" }` |

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 환경 변수

`app/page.tsx` 상단에서 브로커 주소 설정:

```ts
const BROKER_URL = 'ws://YOUR_EC2_IP:9001'
```

---

## 하드웨어 연결

- ESP32 코드: [maru_light](../maru_light/maru_light.ino)
- 사용 부품: ESP32 DevkitC V1, 브레드보드, LED, 220Ω 저항, 점퍼케이블

---

## 로드맵

- [x] MQTT 브로커 구축 (AWS EC2 + Aedes)
- [x] WebSocket 포트 추가 (port 9001)
- [x] Next.js 웹 UI 구현
- [x] ESP32 내장 LED 제어
- [ ] 실제 LED 연결 (빵판 회로)
- [ ] 다중 기기 제어
- [ ] 밝기 조절 (PWM)
- [ ] RGB LED 색상 제어
- [ ] WiFiManager 적용 (동적 WiFi 설정)
- [ ] 갸우뚱오리 무드등 IoT 개조
- [ ] 포터블 배터리 모듈 추가
