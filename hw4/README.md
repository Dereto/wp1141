# 通勤地圖 (Commute Map) - HW#4

一個基於 Google Maps 的全端通勤路線管理應用程式，幫助使用者追蹤和管理日常通勤路線、交通選項和旅行時間。

## 專案簡介

通勤地圖是一個現代化的全端 Web 應用程式，採用前後端分離架構，整合 Google Maps API 提供豐富的地圖功能。使用者可以：

- 建立和管理個人通勤路線
- 查看路線的詳細資訊（距離、時間、交通方式）
- 在地圖上視覺化路線
- 收藏常用路線
- 搜尋地點和獲取路線指引

## 功能清單

### 核心功能
- ✅ 使用者註冊/登入系統（JWT 認證）
- ✅ 通勤路線 CRUD 操作
- ✅ Google Maps 整合（地圖顯示、地點搜尋、路線規劃）
- ✅ **路線視覺化**：點擊路線列表中的任何路線，地圖會顯示完整的路線路徑，包含起點（綠色標記）、終點（紅色標記）和藍色路線線條
- ✅ **地點搜尋功能**：在建立路線時可以搜尋地點，搜尋結果會以藍色標記顯示在地圖上，點擊標記即可選擇該地點
- ✅ 路線收藏功能
- ✅ 響應式設計

### 互動功能
- 🗺️ **路線視覺化**：點擊路線列表中的任何路線，地圖會自動顯示：
  - 🟢 起點標記（綠色）
  - 🔴 終點標記（紅色）
  - 🔵 完整路線路徑（藍色線條）
  - 📏 自動調整地圖視角以顯示完整路線
- 🔍 **地點搜尋**：建立路線時的搜尋功能：
  - 點擊地址欄位旁的搜尋圖標
  - 輸入地點名稱進行搜尋
  - 搜尋結果以藍色標記顯示在地圖上
  - 點擊地圖標記或下拉列表選擇地點
  - 自動填入選定的地址
- ⭐ **路線管理**：收藏、編輯、刪除路線
- 🧹 **清除功能**：清除地圖上的所有標記和路線

### 技術特色
- 前後端分離架構
- TypeScript 全端開發
- SQLite 資料庫持久化
- Google Maps JavaScript API + 伺服器端 API
- Material-UI 現代化介面
- JWT 安全認證

## 架構圖

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Backend       │
│   (React)       │                  │   (Node.js)     │
│                 │                  │                 │
│ • React Router  │                  │ • Express       │
│ • Material-UI   │                  │ • SQLite        │
│ • Google Maps   │                  │ • JWT Auth      │
│ • Axios         │                  │ • Google APIs   │
└─────────────────┘                  └─────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│  Google Maps    │                  │  Google Cloud   │
│  JavaScript API │                  │  Server APIs    │
│  (Browser Key)  │                  │  (Server Key)   │
└─────────────────┘                  └─────────────────┘
```

## 技術棧

### 前端
- **React 19** + **TypeScript**
- **Vite** (建置工具)
- **React Router** (路由管理)
- **Material-UI** (UI 框架)
- **Axios** (HTTP 客戶端)
- **Google Maps JavaScript API**

### 後端
- **Node.js** + **Express** + **TypeScript**
- **SQLite** (資料庫)
- **JWT** (身份驗證)
- **bcryptjs** (密碼雜湊)
- **Google Maps Server APIs** (Geocoding, Places, Directions)

## 安裝與設定

### 前置需求
- Node.js 18+ 
- npm 或 yarn
- Google Cloud Platform 帳號

### 1. 複製專案
```bash
git clone <repository-url>
cd wp1141/hw4
```

### 2. 設定 Google Maps API

#### 建立 Google Cloud 專案
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（例如：`commute-map-app`）
3. 啟用以下 APIs：
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Directions API

#### 建立 API Keys
1. **Browser Key** (前端用)：
   - 限制類型：HTTP 網域
   - 允許清單：`http://localhost:5173/*`, `http://127.0.0.1:5173/*`
   - 啟用 API：Maps JavaScript API

2. **Server Key** (後端用)：
   - 限制類型：無限制（⚠️ 僅用於開發環境）
   - 啟用 APIs：Geocoding API, Places API, Directions API

⚠️ **重要安全警告**：Server Key 未設定 IP 限制，存在以下風險：
- 🚨 **API 濫用風險**：Key 洩露可能導致 API 配額被惡意消耗
- 💰 **費用風險**：可能產生意外的 Google Maps API 使用費用
- 🔒 **安全建議**：生產環境請在 Google Cloud Console 中設定 IP 限制

### 3. 設定環境變數

#### 前端環境變數
```bash
# frontend/.env
VITE_GOOGLE_MAPS_JS_KEY=YOUR_BROWSER_KEY
VITE_API_BASE_URL=http://localhost:3000
```

#### 後端環境變數
```bash
# backend/.env
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=file:./dev.db
JWT_SECRET=your_jwt_secret_here
GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY
```

### 4. 安裝依賴並啟動

#### 後端
```bash
cd backend
npm install
npm run build
npm run dev
```

#### 前端
```bash
cd frontend
npm install
npm run dev
```

### 5. 存取應用程式
- 前端：http://localhost:5173
- 後端 API：http://localhost:3000

## API 文件

### 認證端點

#### 註冊
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

#### 登入
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 取得使用者資料
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 通勤路線端點

#### 取得所有路線
```bash
curl -X GET http://localhost:3000/api/commute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 建立新路線
```bash
curl -X POST http://localhost:3000/api/commute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "上班路線",
    "description": "從家到公司的路線",
    "startAddress": "台北車站",
    "endAddress": "信義區",
    "transportMode": "driving"
  }'
```

#### 取得特定路線
```bash
curl -X GET http://localhost:3000/api/commute/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 更新路線
```bash
curl -X PUT http://localhost:3000/api/commute/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新後的路線名稱",
    "isFavorite": true
  }'
```

#### 刪除路線
```bash
curl -X DELETE http://localhost:3000/api/commute/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Google Maps 整合端點

#### 搜尋地點
```bash
curl -X GET "http://localhost:3000/api/commute/search/places?query=台北101&lat=25.0330&lng=121.5654" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 取得路線指引
```bash
curl -X GET "http://localhost:3000/api/commute/directions?origin=台北車站&destination=信義區&mode=driving" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 資料庫結構

### Users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Commute Routes 表
```sql
CREATE TABLE commute_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_address TEXT NOT NULL,
  end_address TEXT NOT NULL,
  start_lat REAL NOT NULL,
  start_lng REAL NOT NULL,
  end_lat REAL NOT NULL,
  end_lng REAL NOT NULL,
  transport_mode TEXT NOT NULL DEFAULT 'driving',
  duration_seconds INTEGER,
  distance_meters INTEGER,
  is_favorite BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 安全性考量

### 已實作的安全措施
- ✅ 密碼使用 bcryptjs 雜湊
- ✅ JWT token 認證
- ✅ CORS 白名單限制
- ✅ 輸入驗證和錯誤處理
- ✅ SQL 注入防護（使用參數化查詢）

### 安全風險說明
⚠️ **重要安全警告**：本專案為學習用途，存在以下安全風險，**僅適用於本地開發環境**：

#### 🚨 **Google Maps Server Key 安全風險**
- **未設定 IP 限制**：後端使用的 `GOOGLE_MAPS_SERVER_KEY` 未限制特定 IP 位址
- **潛在濫用風險**：如果 Server Key 洩露，可能被惡意使用導致 API 配額耗盡
- **費用風險**：Google Maps API 有使用量限制和費用，未限制的 Key 可能產生意外費用

#### 🛡️ **生產環境安全建議**
在生產環境中，請務必：
- ✅ **設定 IP 限制**：在 Google Cloud Console 中限制 Server Key 只能從特定 IP 使用
- ✅ **使用環境變數**：將所有敏感資訊存放在環境變數中
- ✅ **實作更嚴格的輸入驗證**：加強 API 輸入驗證和錯誤處理
- ✅ **定期更新依賴套件**：保持所有套件為最新版本
- ✅ **監控 API 使用量**：設定 Google Cloud 使用量警報
- ✅ **使用 HTTPS**：確保所有通訊都經過加密
- ✅ **實作 Rate Limiting**：限制 API 請求頻率防止濫用

## 已知問題與未來改進

### 已知問題
- Google Maps API 需要有效的 API Key 才能正常運作
- 部分瀏覽器可能對 Google Maps 載入有限制

### 未來改進方向
- [ ] 實作路線歷史記錄功能
- [ ] 加入交通狀況即時更新
- [ ] 支援多種地圖樣式
- [ ] 加入路線分享功能
- [ ] 實作離線地圖支援
- [ ] 加入路線評分和評論系統

## 開發者資訊

- **課程**：台大電機系網路服務程式設計
- **作業**：HW#4 - Google Maps 全端應用
- **主題**：通勤地圖 (Commute Map)

## 授權

本專案採用 MIT 授權，詳見 [LICENSE](LICENSE) 檔案。

---

**注意**：使用前請確保已正確設定 Google Maps API Keys，並遵守 Google Maps API 的使用條款和計費政策。
