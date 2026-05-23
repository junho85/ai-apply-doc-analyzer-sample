# AI Apply Doc Analyzer Sample

교환학생 입학 승인 서류를 Google Gemini AI로 검증하는 데모 애플리케이션입니다.

**🚀 Live Demo:** https://ai-apply-doc-analyzer-sample.vercel.app

---

## 개요

AI 이미지 생성으로 만든 가상의 입학 승인 서류 3개(정상 2개, 위조 1개)를 Gemini AI가 분석하여 유효성을 검증합니다.

### 검증 항목 (8개)

| 항목 | 설명 |
|------|------|
| Document Structure | 공식 서류 양식 구조 (레터헤드, 서명란, 연락처) |
| Program Period Validity | 프로그램 시작일 < 종료일 논리 확인 |
| Date Consistency | 날짜 형식 유효성 (월 1-12, 일 1-31) |
| Document Formatting | 폰트 일관성, 정렬, 전문성 |
| Official Seal / Signature | 공식 직인 및 서명 존재 여부 |
| Required Fields | 필수 항목 완비 (학생명, ID, 기간, 학과 등) |
| No Fraud Indicators | 위조 징후 (불가능한 날짜, 가짜 도메인, 비상식적 금액 등) |
| No Watermark | SAMPLE / NOT VALID 등 워터마크 감지 |

### 샘플 서류

| 파일 | 학생 | 기관 | 예상 결과 |
|------|------|------|-----------|
| `doc1_admission.png` | Emily Johnson | Hangang National University | ✅ Valid |
| `doc2_admission.png` | Lucas Müller | Donggang International University | ✅ Valid |
| `doc3_fake_admission.png` | James Kim | Korea International Excellence University | ❌ Invalid |

위조 서류(doc3)의 주요 문제점:
- 불가능한 발급일: `2026-15-45` (15월 45일)
- 종료일이 시작일보다 앞섬: `2023-01-01` ~ `2022-12-31`
- 비상식적 장학금: 999,999,999 KRW
- 가짜 이메일 도메인: `info@kieuniv.fake`
- `SAMPLE DOCUMENT` 워터마크
- 오타: `aprooved`, `Congratlation!`

---

## 기술 스택

- **Backend:** Node.js + Express
- **AI:** Google Gemini API (`gemini-3.5-flash`)
- **Frontend:** Vanilla HTML/CSS/JS (단일 페이지)
- **Deployment:** Vercel
- **Image Generation:** OpenAI Codex CLI (샘플 서류 이미지 생성)

---

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Gemini API 키를 입력합니다:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

> Gemini API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받을 수 있습니다.

### 3. 서버 실행

```bash
npm start
```

브라우저에서 http://localhost:3000 접속 후 **Analyze All Documents** 클릭

---

## 배포 동작 방식

| 환경 | `/api/analyze` 동작 |
|------|---------------------|
| 로컬 (`GEMINI_API_KEY` 있음) | Gemini API 실시간 분석 |
| Vercel (API 키 없음) | `public/results.json` 정적 결과 반환 |

Vercel 배포 시 토큰 비용 발생 없이 미리 분석한 결과를 제공합니다.  
결과를 갱신하려면 로컬에서 분석 후 `public/results.json`을 커밋하면 됩니다.

---

## 프로젝트 구조

```
├── api/
│   └── analyze.js          # Vercel serverless 함수
├── lib/
│   └── analyzer.js         # Gemini API 호출 및 프롬프트
├── public/
│   ├── index.html          # 결과 대시보드 UI
│   ├── results.json        # 사전 분석된 정적 결과
│   └── documents/          # 샘플 서류 이미지
├── server.js               # Express 서버 (로컬 개발용)
├── vercel.json             # Vercel 배포 설정
└── .env.example            # 환경변수 예시
```

---

## UI 기능

- **이미지 클릭** → 라이트박스로 원본 크기 확대 (ESC로 닫기)
- **SAMPLE 뱃지** → Gemini가 워터마크 감지 시 자동 표시
- **신뢰도(Confidence)** → Gemini의 판정 확신도 (0-100%)
- **검증 항목별 체크리스트** → 항목별 통과/실패 및 상세 설명
