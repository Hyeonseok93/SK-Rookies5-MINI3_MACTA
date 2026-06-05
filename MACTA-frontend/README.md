# 🔨 MACTA: 실시간 경매 플랫폼 - Frontend

<div align="center">
  <p align="center">
    <strong>"마감 직전 짜릿한 입찰 경쟁, 실시간 소통과 안전한 거래의 시작"</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.2.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8.0.10-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Zustand-5.0.13-blue?style=for-the-badge" alt="Zustand" />
    <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
  </p>
</div>

---

## 🚀 프로젝트 개요 (Overview)

**MACTA Frontend**는 사용자가 간편하게 경매 상품을 등록하고 실시간으로 입찰 경쟁에 참여할 수 있도록 구현된 반응형 웹 애플리케이션입니다. 

경매 마감 직전 트래픽이 몰리는 동적 환경에서 사용자 경험을 극대화하기 위해, 실시간 상태 동기화 및 즉각적인 UI 피드백을 제공합니다. 또한 JWT 인증 체계를 기반으로 개인화된 대시보드(마이페이지)와 결제/배송 흐름 제어, 실시간 웹소켓 알림 수신 인터페이스를 구성하였습니다.

---

## ✨ 핵심 기능 (Key Features)

### 🏠 실시간 경매 탐색 (Home & Search)
- **카테고리 필터 및 검색**: 관심 있는 상품 카테고리를 필터링하고 검색어 입력을 통해 상품을 빠르게 검색합니다.
- **인기 & 마감 임박 상품**: 현재 조회수나 입찰 참여도가 높은 인기 경매 상품 및 곧 마감될 상품들을 메인 화면에 우선 노출합니다.

### 🔐 사용자 인증 및 인가 (Authentication)
- **JWT 기반 로그인/회원가입**: 로그인 성공 시 획득한 토큰을 기반으로 인가된 요청을 서버로 전달합니다.
- **API Interceptor**: Axios Interceptor를 구성하여 API 요청 헤더에 토큰을 자동으로 주입하고 만료에 대응합니다.

### 🔍 경매 상세 및 입찰 경쟁 (Product Details & Bidding)
- **실시간 입찰**: 최고가 검증 로직에 맞추어 사용자가 즉시 입찰을 시도할 수 있으며, 입찰 성공 시 최고 입찰가 상태가 실시간으로 반영됩니다.
- **문의 및 소통**: 상품 하단에 Q&A 형태의 댓글 및 답글 등록 기능을 제공하여 판매자와 구매자 간 자유로운 의사소통이 가능합니다.

### 🔨 경매 상품 출품 (Register Auction)
- **정보 설정**: 상품 이미지 등록, 경매 시작 가격, 카테고리 설정, 그리고 경매 마감 시점을 달력 컴포넌트로 지정하여 상품을 간편하게 등록합니다.

### 💳 결제 및 거래 진행 (Checkout & Delivery)
- **낙찰 거래 관리**: 경매 마감 후 낙찰자로 확정되면 결제 대기 상태로 전환되며, 배송 정보(주소지 등)를 입력하고 최종 결제를 수행합니다.
- **배송 상태 트래킹**: 판매자는 결제 완료된 건에 대해 배송 처리를 진행하고, 구매자는 화면에서 이를 실시간으로 모니터링할 수 있습니다.

### 🔔 실시간 이벤트 알림 (Notifications Hub)
- **실시간 알림 목록**: 다른 사용자가 더 높은 금액으로 입찰하여 내 입찰이 상회당했거나(Outbid), 내 경매가 낙찰되었을 때의 실시간 이벤트를 모아 확인합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Core Libraries
- **Framework & Runtime**: React 19 (Vite 기반 개발환경)
- **Language**: TypeScript
- **Routing**: React Router Dom v7

### Styling & UI Components
- **CSS Engine**: Tailwind CSS v4 (최신 기능 및 빠른 빌드 지원)
- **Design Utility**: Shadcn UI, Radix UI Primitive
- **Icons**: Lucide React

### State & Data Client
- **Server State Management**: TanStack Query v5 (React Query) - 캐싱, 동적 리프레시 및 자동 동기화 처리
- **Global Client State**: Zustand v5 - 클라이언트 사이드 글로벌 상태 관리
- **Network Client**: Axios - API 비동기 통신 및 공통 설정 관리
- **Form & Validation**: React Hook Form, Zod

---

## 📂 프로젝트 구조 (Directory Structure)

```text
MACTA-frontend/
├── public/                 # 정적 에셋 및 파비콘
├── src/
│   ├── api/                # Axios 인스턴스, Interceptor 및 API 엔드포인트 정의
│   ├── assets/             # 컴포넌트 내부 사용 이미지/정적 파일
│   ├── components/         # 재사용 가능한 공통 UI 및 레이아웃 컴포넌트
│   │   └── ui/             # Shadcn UI 기반 원자 컴포넌트 (Button, Input, Dialog 등)
│   ├── hooks/              # 커스텀 훅 및 공통 비즈니스 로직
│   ├── pages/              # 라우터 매핑 페이지 컴포넌트
│   │   ├── HomePage.tsx            # 경매 홈/검색 페이지
│   │   ├── LoginPage.tsx           # 로그인 페이지
│   │   ├── SignupPage.tsx          # 회원가입 페이지
│   │   ├── ProductDetailPage.tsx   # 상품 상세 및 입찰/댓글 페이지
│   │   ├── RegisterAuctionPage.tsx # 경매 등록 페이지
│   │   ├── CheckoutPage.tsx        # 결제 및 배송 관리 페이지
│   │   ├── MyPage.tsx              # 마이페이지 대시보드
│   │   ├── NotificationsPage.tsx   # 실시간 알림 센터 페이지
│   │   └── ErrorPage.tsx           # 예외 처리 페이지
│   ├── store/              # Zustand Store 정의 (Auth 상태 등)
│   ├── styles/             # 전역 테마 및 스타일 설정
│   ├── utils/              # 포맷터 및 공통 헬퍼 함수
│   ├── App.tsx             # 라우팅 및 전역 Provider 설정
│   ├── main.tsx            # React 렌더링 진입점
│   ├── App.css
│   └── index.css
├── eslint.config.js        # ESLint 린터 설정
├── package.json            # 의존성 및 스크립트 구성
├── tsconfig.json           # TypeScript 빌드 설정
└── vite.config.ts          # Vite 번들러 설정
```

---

## ⚙️ 실행 및 빌드 가이드 (Getting Started)

### 1. 의존성 패키지 설치
프로젝트 루트 폴더 혹은 `MACTA-frontend` 폴더로 이동한 뒤 아래 명령어를 입력하여 필요한 패키지를 설치합니다:
```bash
npm install
```

### 2. 로컬 개발 서버 실행
Vite 핫 모듈 교체(HMR)가 적용된 로컬 서버를 구동합니다:
```bash
npm run dev
```

### 3. 프로덕션 빌드
배포용 프로덕션 번들을 생성합니다:
```bash
npm run build
```

---

## ⚙️ Vite Template Default Reference

> [!NOTE]
> 아래 내용은 Vite React 템플릿 기본 생성 안내문입니다.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
