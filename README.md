# Dağıtık Sistemler Projesi

Dağıtık sistem kavramlarını uygulayan full-stack proje: Spring Boot REST API (backend), React + TypeScript arayüzü (frontend), PostgreSQL ve Docker.

---

## Özellikler

- **Backend** — Node CRUD REST API, katmanlı mimari (Controller → Service → Repository), PostgreSQL, Swagger
- **Frontend** — React 19 + Vite + TypeScript (geliştirme ortamında backend’e proxy)
- **Docker** — Backend + veritabanı tek komutla ayağa kalkar
- **Health / Readiness / Liveness** — Dağıtık ortam için sağlık kontrolleri
- **Validation & Exception handling** — DTO validasyonu, merkezi hata yanıtları

---

## Teknoloji stack

| Bileşen        | Teknoloji                    |
|----------------|------------------------------|
| Backend        | Java 21, Spring Boot 3.4     |
| Frontend       | React 19, Vite 7, TypeScript |
| Veritabanı     | PostgreSQL 16                |
| API dokümantasyonu | SpringDoc OpenAPI (Swagger) |
| Derleme        | Maven (backend), npm (frontend) |
| Konteyner      | Docker, Docker Compose       |

---

## Proje yapısı

```
.
├── README.md                 # Bu dosya
├── docker-compose.yml        # Backend + PostgreSQL
├── backend/                  # Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/...          # controller, service, repository, entity, dto, exception
└── frontend/                 # React + Vite + TypeScript
    ├── package.json
    ├── vite.config.ts        # /api ve /actuator proxy → localhost:8081
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   └── ...
    └── public/
```

---

## Gereksinimler

- **Backend (Docker):** Docker ve Docker Compose
- **Backend (yerel):** Java 21+, Maven 3.8+, PostgreSQL
- **Frontend:** Node.js 18+ ve npm

---

## Hızlı başlangıç (Docker — önerilen)

Proje kök dizininde:

```bash
docker compose up -d
```

İlk seferde image build edilir; birkaç dakika sürebilir. Backend, PostgreSQL hazır olduktan sonra başlar.

### Erişim adresleri

| Ne | URL |
|----|-----|
| **Backend API** | http://localhost:8081 |
| **Swagger UI** | http://localhost:8081/swagger-ui.html |
| **OpenAPI JSON** | http://localhost:8081/v3/api-docs |
| **Readiness** (trafik hazır mı) | http://localhost:8081/actuator/health/readiness |
| **Liveness** (uygulama canlı mı) | http://localhost:8081/actuator/health/liveness |
| **Genel health** | http://localhost:8081/actuator/health |

### PostgreSQL

- **Port:** Host’ta `5433` (compose’da `5433:5432`). Başka bir şey kullanıyorsanız `docker-compose.yml` içinden değiştirin.
- **Veritabanı:** `distributed_db`
- **Kullanıcı / şifre:** `postgres` / `postgres`
- Tarayıcıda açılmaz; DBeaver, pgAdmin veya `psql` ile bağlanın.

### Yararlı komutlar

```bash
docker compose ps              # Container durumları
docker compose logs -f backend  # Backend logları
docker compose down            # Durdur
docker compose down -v          # Durdur + volume'ları sil (veritabanı verisi gider)
docker compose up -d --build    # Yeniden build ve başlat
```

---

## Frontend (React) çalıştırma

Backend’in çalışıyor olması gerekir (Docker veya yerel, port 8081). Sonra:

```bash
cd frontend
npm install
npm run dev
```

- **Arayüz:** http://localhost:5173  
- Geliştirme sırasında `/api` ve `/actuator` istekleri Vite proxy ile http://localhost:8081’e yönlendirilir (CORS sorunu olmaz).

Production build: `npm run build` (çıktı: `frontend/dist`).

---

## Yerel çalıştırma (Docker olmadan)

1. PostgreSQL’de veritabanı oluşturun:

   ```sql
   CREATE DATABASE distributed_db;
   ```

2. `backend/application.yml` içinde bağlantı bilgilerini kontrol edin (varsayılan: `localhost:5432`, kullanıcı `postgres`, şifre `postgres`).

3. Backend’i başlatın:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

Uygulama http://localhost:8081 üzerinde çalışır.

---

## API özeti

### Health ve sağlık kontrolleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/health` | Basit servis durumu |
| GET | `/actuator/health` | Tüm bileşenler (DB vb.) |
| GET | `/actuator/health/readiness` | **Readiness:** DB bağlantısı var mı, trafik kabul edilebilir mi? |
| GET | `/actuator/health/liveness` | **Liveness:** Uygulama canlı mı? (ping) |

Readiness ve liveness, Docker/Kubernetes gibi ortamlarda yük dengeleme ve restart kararları için kullanılır.

### Node API (CRUD)

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/nodes` | Tüm node’ları listele |
| GET | `/api/nodes/{id}` | ID ile node getir |
| POST | `/api/nodes` | Yeni node oluştur |
| PUT | `/api/nodes/{id}` | Node güncelle |
| DELETE | `/api/nodes/{id}` | Node sil |

**POST/PUT body örneği (Node):** `name`, `host`, `port` (zorunlu); `status` (isteğe bağlı: `ACTIVE`, `INACTIVE`, `MAINTENANCE`).

Tüm endpoint’leri Swagger UI üzerinden deneyebilirsiniz: http://localhost:8081/swagger-ui.html

---

## Backend mimarisi

Katmanlı yapı:

- **Controller** — HTTP istek/yanıt, sadece DTO kullanır.
- **Service** — İş mantığı, Entity ↔ DTO dönüşümü.
- **Repository** — JPA ile veri erişimi.
- **Entity** — Veritabanı modeli (örn. `Node`).
- **DTO** — `request` (oluşturma/güncelleme), `response` (API yanıtı).
- **Exception** — `GlobalExceptionHandler`, `ResourceNotFoundException`, `ErrorResponse` (404, validation hataları).

---

## Sağlık kontrolleri (Health / Readiness / Liveness)

- **Readiness:** Veritabanına bağlantı kontrolü. DOWN ise “trafik kabul etme” anlamında kullanılabilir; yük dengeleyici bu instance’a istek göndermez.
- **Liveness:** Uygulama yanıt veriyor mu? DOWN ise orchestrator (Docker/Kubernetes) container’ı yeniden başlatabilir.
- **Docker:** Backend container’ında healthcheck, readiness endpoint’ine göre yapılandırılmıştır; `docker compose ps` ile “healthy” görünür.

---

## Sorun giderme

- **Backend açılmıyor / “sayfa çalışmıyor”**  
  Spring Boot 1–2 dakika sürebilir. Tarayıcıda doğrudan http://localhost:8081/swagger-ui.html deneyin. `docker compose logs backend` ile hata mesajlarına bakın.

- **PostgreSQL portu**  
  Compose’da `5433:5432` ise, DB istemcisinde port **5433** kullanın.

- **Yeniden build**  
  Kod veya Dockerfile değiştiyse: `docker compose up -d --build`

---

## Lisans

Eğitim / proje amaçlı kullanım.
