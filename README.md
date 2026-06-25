# Telegram Bot — MVP V1

Chatbot de Telegram con flujo de preguntas guiadas, construido con
[Telegraf](https://telegraf.js.org/) y Node.js. Diseñado con arquitectura
limpia y modular para evolucionar hacia versiones comerciales más complejas
(persistencia en base de datos, integración con IA, CRM, Google Sheets,
Trello, WhatsApp Business API, etc.).

---

## Índice

1. [Revisión de arquitectura y decisiones de diseño](#revisión-de-arquitectura-y-decisiones-de-diseño)
2. [Estructura de carpetas](#estructura-de-carpetas)
3. [Instalación](#instalación)
4. [Creación del bot en Telegram](#creación-del-bot-en-telegram)
5. [Flujo conversacional](#flujo-conversacional)
6. [Personalización](#personalización)
7. [Manejo de errores y validaciones](#manejo-de-errores-y-validaciones)
8. [Despliegue en producción](#despliegue-en-producción)
9. [Docker](#docker)
10. [Escalabilidad: cómo conectar futuras integraciones](#escalabilidad-cómo-conectar-futuras-integraciones)
11. [Calidad de código](#calidad-de-código)
12. [Recomendaciones para una V2 comercial](#recomendaciones-para-una-v2-comercial)

---

## Revisión de arquitectura y decisiones de diseño

Antes de escribir código se definieron los siguientes principios para que el
proyecto soporte miles de usuarios concurrentes en el futuro:

- **Separación Telegram / lógica de negocio**: `ConversationService` no
  importa Telegraf. Conoce únicamente `userId`, estados y respuestas. Esto
  permite reutilizar la misma lógica desde otro canal (WhatsApp, web chat,
  etc.) sin duplicar código.
- **Repository Pattern para persistencia**: `UserStateRepository` es una
  interfaz; `InMemoryUserStateRepository` es la única implementación de la
  V1. Migrar a PostgreSQL en el futuro implica crear
  `PostgresUserStateRepository` y cambiar **una sola línea** en
  `src/services/index.js`. El resto del código (handlers, servicio de
  conversación) no se modifica.
- **Configuración como dato, no como código**: las preguntas viven en
  `src/config/questions.js` como un array de objetos. Agregar, quitar o
  reordenar preguntas no requiere tocar handlers ni lógica de estados.
- **Máquina de estados explícita**: el estado de cada usuario
  (`START`, `QUESTION_1`...`QUESTION_4`, `COMPLETED`) se guarda junto con sus
  respuestas. Si el usuario abandona la conversación y vuelve más tarde
  (incluso después de reiniciar el proceso, una vez migrado a una base de
  datos persistente), el bot retoma exactamente donde quedó.
- **Validación centralizada y desacoplada**: `utils/validators.js` expone
  validadores reutilizables (`notEmpty`, `phone`) referenciados por nombre
  desde `questions.js`, evitando lógica de validación dispersa en los
  handlers.
- **Middleware de errores global**: ningún error de un handler puede
  tumbar el proceso ni dejar al usuario sin respuesta; se loguea con
  contexto (`userId`, tipo de update, stack) y se informa un mensaje genérico.
- **Stateless a nivel de proceso**: toda la app es funciones puras +
  repositorio inyectado. Esto facilita correr múltiples réplicas detrás de
  un balanceador en el futuro (long polling debe ser de una sola instancia,
  pero al migrar a **webhooks** + **store compartido** —Postgres/Redis— se
  puede escalar horizontalmente sin cambios en la lógica de negocio).
- **Logger con niveles e interfaz estable**: `utils/logger.js` expone
  `debug/info/warn/error`. Reemplazarlo por Winston/Pino en el futuro no
  requiere tocar el resto del código.

### Para soportar miles de usuarios concurrentes (roadmap técnico)

| Aspecto | V1 (actual) | Recomendado a escala |
|---|---|---|
| Transporte | Long polling | Webhooks (HTTPS) detrás de un reverse proxy (Nginx) |
| Persistencia | Memoria (Map) | PostgreSQL (vía `PostgresUserStateRepository`) o Redis para sesión efímera |
| Instancias | 1 proceso | Múltiples réplicas + balanceador, con store compartido |
| Logs | Consola | Agregador centralizado (ELK, Loki, Datadog) |
| Observabilidad | — | Métricas (Prometheus) + healthcheck endpoint |
| Colas | — | Cola de mensajes (BullMQ/RabbitMQ) para integraciones externas (CRM, Sheets) y evitar bloquear el handler del update |

---

## Estructura de carpetas

```
telegram-bot/
│
├── src/
│   ├── bot/
│   │   ├── handlers/          # Lógica de manejo de updates de Telegram
│   │   │   ├── startHandler.js
│   │   │   ├── cancelHandler.js
│   │   │   ├── textHandler.js
│   │   │   ├── callbackHandler.js
│   │   │   ├── questionRenderer.js
│   │   │   └── summary.js
│   │   ├── scenes/             # Reservado para flujos avanzados (V2+)
│   │   ├── keyboards/          # Construcción de teclados inline
│   │   │   └── questionKeyboard.js
│   │   ├── middleware/         # Logging y manejo global de errores
│   │   │   ├── requestLogger.js
│   │   │   └── errorHandler.js
│   │   └── index.js            # Registro del bot (Telegraf)
│   │
│   ├── config/
│   │   ├── env.js              # Variables de entorno centralizadas
│   │   ├── states.js           # Estados de la máquina de estados
│   │   └── questions.js        # ⭐ Panel único de configuración de preguntas
│   │
│   ├── services/
│   │   ├── ConversationService.js   # Lógica de negocio del flujo
│   │   ├── storage/
│   │   │   ├── UserStateRepository.js          # Interfaz/contrato
│   │   │   └── InMemoryUserStateRepository.js  # Implementación V1
│   │   └── index.js            # Composición de dependencias
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── validators.js
│   │
│   └── app.js                  # Entry point
│
├── .env.example
├── .gitignore
├── .dockerignore
├── package.json
├── README.md
├── Dockerfile
└── docker-compose.yml
```

---

## Instalación

### Requisitos

- Node.js **20 LTS** o superior
- npm 10+
- Una cuenta de Telegram para crear el bot vía BotFather

### Dependencias principales

- [`telegraf`](https://www.npmjs.com/package/telegraf) — framework para bots de Telegram
- [`dotenv`](https://www.npmjs.com/package/dotenv) — carga de variables de entorno

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd telegram-bot

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env

# 4. Completar BOT_TOKEN en .env (ver sección siguiente)

# 5. Iniciar el bot
npm start

# (opcional) modo desarrollo con auto-reload
npm run dev
```

---

## Creación del bot en Telegram

### 1. Crear el bot mediante BotFather

1. Abrí Telegram y buscá **@BotFather**.
2. Enviá el comando `/newbot`.
3. Elegí un **nombre visible** para tu bot (ej: `Mi Empresa Bot`).
4. Elegí un **username** único que termine en `bot` (ej: `mi_empresa_bot`).

### 2. Obtener el Token

Al finalizar el paso anterior, BotFather te entrega un token con este formato:

```
123456789:ABCDefGhIJKlmNoPQRstuVwxYZ
```

Guardalo: es la credencial de acceso a la API de tu bot. **Nunca lo subas a
un repositorio público.**

### 3. Configurar el `.env`

Editá el archivo `.env` (creado a partir de `.env.example`) y completá:

```env
BOT_TOKEN=123456789:ABCDefGhIJKlmNoPQRstuVwxYZ
NODE_ENV=development
LOG_LEVEL=info
```

### 4. Iniciar el proyecto

```bash
npm start
```

Si todo está bien configurado vas a ver en consola:

```
[2026-06-25T12:00:00.000Z] [INFO] Bot iniciado correctamente en modo "development"
```

Abrí una conversación con tu bot en Telegram y enviá `/start` para probar el flujo.

---

## Flujo conversacional

```
/start
  └─> Mensaje de bienvenida
  └─> QUESTION_1: ¿Cuál es tu nombre?
        └─> QUESTION_2: ¿Cuál es tu teléfono?
              └─> QUESTION_3: ¿Qué servicio necesitás? (botones)
                    └─> QUESTION_4: Describí brevemente tu necesidad.
                          └─> COMPLETED: Resumen + mensaje de cierre
```

Comandos disponibles:

| Comando | Descripción |
|---|---|
| `/start` | Inicia o reinicia el flujo de preguntas |
| `/cancel` | Abandona la conversación actual y borra las respuestas guardadas |

Si el usuario cierra el chat y vuelve más tarde sin haber completado el
flujo, al escribir cualquier texto el bot reconoce su estado guardado y
**continúa exactamente desde la pregunta en la que había quedado** (no hace
falta reiniciar con `/start`).

---

## Personalización

Toda la personalización del flujo se hace en **un único archivo**:
`src/config/questions.js`. No es necesario tocar ningún handler.

### Cambiar el texto de una pregunta

```js
{
  state: STATES.QUESTION_1,
  field: 'name',
  text: '¿Cómo te llamás?', // <- editar acá
  type: 'text',
  validator: 'notEmpty',
  nextState: STATES.QUESTION_2,
}
```

### Cambiar las opciones de los botones

```js
options: [
  { label: 'Instalación', value: 'Instalación' },
  { label: 'Soporte 24/7', value: 'Soporte' }, // <- label visible distinto del value guardado
]
```

### Agregar una pregunta nueva

1. Agregá un nuevo estado en `src/config/states.js`, por ejemplo `QUESTION_5`.
2. Agregá el objeto de la pregunta en `src/config/questions.js`:

```js
{
  state: STATES.QUESTION_5,
  field: 'email',
  text: '¿Cuál es tu email?',
  type: 'text',
  validator: 'notEmpty',
  nextState: STATES.COMPLETED,
}
```

3. Ajustá el `nextState` de la pregunta anterior para que apunte a `QUESTION_5`
   en lugar de `COMPLETED`.
4. Si querés mostrar el nuevo campo en el resumen final, agregalo en
   `src/bot/handlers/summary.js`.

### Eliminar una pregunta

1. Quitá el objeto correspondiente del array en `questions.js`.
2. Ajustá el `nextState` de la pregunta anterior para que apunte directamente
   al estado que seguía después de la eliminada.

### Cambiar botones por texto libre (o viceversa)

Cambiá `type: 'buttons'` por `type: 'text'` (o viceversa). Si pasás a
`'buttons'`, agregá el array `options`.

### Modificar los mensajes finales

- Mensaje de bienvenida: `src/bot/handlers/startHandler.js` → constante `WELCOME_MESSAGE`.
- Resumen y mensaje de cierre: `src/bot/handlers/summary.js` → `buildSummaryText` y `CLOSING_MESSAGE`.

---

## Manejo de errores y validaciones

- **Validación de respuestas vacías**: validador `notEmpty` (`src/utils/validators.js`).
- **Validación de teléfono**: validador `phone`, acepta dígitos, espacios,
  guiones, paréntesis y `+` opcional, con 7 a 15 dígitos.
- **Control de errores global**: middleware `errorHandler`
  (`src/bot/middleware/errorHandler.js`) captura cualquier excepción no
  manejada en los handlers, la loguea con contexto y responde al usuario sin
  exponer detalles internos.
- **Logs descriptivos**: `src/utils/logger.js`, con niveles `debug/info/warn/error`
  y timestamp ISO. Nivel configurable vía `LOG_LEVEL` en `.env`.

Para agregar un nuevo validador, definí una función en `validators.js` que
devuelva `{ valid: boolean, errorMessage?: string }`, agregala al objeto
`VALIDATORS`, y referenciala por nombre desde `questions.js`.

---

## Despliegue en producción

### En un VPS (sin Docker)

```bash
# Instalar Node.js 20 LTS en el servidor (ejemplo con nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20

# Clonar y configurar
git clone <url-del-repositorio>
cd telegram-bot
npm install --omit=dev
cp .env.example .env
# completar .env con NODE_ENV=production y el BOT_TOKEN real

# Ejecutar con un gestor de procesos (recomendado: pm2)
npm install -g pm2
pm2 start src/app.js --name telegram-bot
pm2 save
pm2 startup
```

### Recomendaciones de producción

- Usar `pm2` (o `systemd`) para reinicio automático ante caídas.
- Configurar `NODE_ENV=production`.
- Restringir el archivo `.env` con permisos `600`.
- Monitorear logs (`pm2 logs telegram-bot`).

---

## Docker

### Build y ejecución manual

```bash
docker build -t telegram-bot .
docker run -d --name telegram-bot --env-file .env --restart unless-stopped telegram-bot
```

### Con docker-compose (recomendado)

```bash
docker-compose up -d --build
```

El `docker-compose.yml` incluye, comentado, un servicio de PostgreSQL listo
para descomentar cuando se implemente la persistencia en base de datos (V2).

---

## Escalabilidad: cómo conectar futuras integraciones

La arquitectura está preparada para que cada integración se agregue como un
nuevo módulo en `src/services/`, sin modificar `ConversationService` ni los
handlers de Telegram.

### PostgreSQL

1. Instalar el driver: `npm install pg`.
2. Crear `src/services/storage/PostgresUserStateRepository.js` implementando
   los mismos métodos que `UserStateRepository`
   (`getState`, `setState`, `clearState`), persistiendo `state` y `answers`
   (por ejemplo en una tabla `user_states` con una columna `JSONB` para
   `answers`).
3. En `src/services/index.js`, reemplazar:
   ```js
   const userStateRepository = new InMemoryUserStateRepository();
   ```
   por:
   ```js
   const userStateRepository = new PostgresUserStateRepository(pool);
   ```
4. Usar `DATABASE_URL` (ya definida en `.env.example`) para la conexión.

Ningún otro archivo necesita cambios.

### OpenAI

Crear `src/services/AiService.js` que use `OPENAI_API_KEY` (ya reservada en
`.env.example`) para, por ejemplo, generar respuestas dinámicas o clasificar
la descripción del usuario (`answers.description`) antes de derivarla a un
asesor. Invocarlo desde `ConversationService.submitAnswer` cuando
`isCompleted === true`, sin acoplar Telegraf a la lógica de IA.

### Google Sheets

Crear `src/services/GoogleSheetsService.js` usando `googleapis`, autenticado
con `GOOGLE_SHEETS_CREDENTIALS_PATH`. Llamarlo desde el handler que procesa
la finalización del flujo (`sendSummary` en `summary.js`, o mejor, desde
`ConversationService` para mantener Telegraf desacoplado) para volcar cada
respuesta completada como una fila nueva.

### Trello

Crear `src/services/TrelloService.js` usando `TRELLO_API_KEY`,
`TRELLO_API_TOKEN` y `TRELLO_BOARD_ID` para crear una tarjeta por cada
solicitud completada, con las respuestas del usuario en la descripción.

### CRM genérico

Crear `src/services/CrmService.js` que haga un `POST` a `CRM_API_URL` con
`CRM_API_KEY` en los headers, enviando el resumen de la solicitud al
completarse el flujo.

### WhatsApp Business API

Gracias a que `ConversationService` no depende de Telegraf, se puede crear
un adaptador `src/whatsapp/` que reciba webhooks de WhatsApp y llame a los
mismos métodos (`start`, `submitAnswer`, `getCurrentQuestion`) usando el
número de teléfono como `userId`. La lógica de preguntas y validaciones se
reutiliza sin duplicar código.

> **Patrón común a todas las integraciones**: agregar el servicio nuevo,
> inyectarlo en `src/services/index.js`, y consumirlo desde el punto del
> flujo correspondiente (normalmente al completarse la conversación). Los
> handlers de Telegram y la configuración de preguntas no deberían
> necesitar cambios.

---

## Calidad de código

- **Clean Code**: nombres descriptivos, funciones pequeñas con una sola
  responsabilidad, sin código muerto.
- **SOLID**:
  - *S*: cada módulo tiene una responsabilidad (renderizado, validación, persistencia, orquestación).
  - *O*: se pueden agregar preguntas/validadores sin modificar código existente.
  - *L*: cualquier implementación de `UserStateRepository` es intercambiable.
  - *I*: el contrato de `UserStateRepository` expone solo los métodos necesarios.
  - *D*: `ConversationService` depende de la abstracción `UserStateRepository`, no de la implementación en memoria.
- **DRY**: lógica de preguntas centralizada en `questions.js`; validación centralizada en `validators.js`.
- **Tipado mediante JSDoc**: todas las funciones públicas documentan tipos de parámetros y retorno, facilitando una futura migración a TypeScript (`@typedef`, `@param`, `@returns`).
- **Preparado para TypeScript**: al migrar, los `@typedef` de este proyecto se convierten directamente en `interface`/`type`, y la estructura de carpetas no necesita cambios.

---

## Recomendaciones para una V2 comercial

1. **Persistencia real**: migrar de memoria a PostgreSQL (o Redis para
   sesiones + Postgres para histórico) usando el patrón Repository ya definido.
2. **Webhooks en lugar de long polling**: requiere un servidor HTTP (Express/Fastify)
   y certificado TLS; permite escalar horizontalmente con balanceador.
3. **Internacionalización (i18n)**: extraer los textos de `questions.js` a
   archivos de idioma (`es.json`, `en.json`) si se planea soportar múltiples mercados.
4. **Panel de administración**: UI web para editar preguntas sin tocar código
   ni redeployar (leyendo `questions.js` desde una base de datos o CMS headless).
5. **Métricas de conversión**: registrar en qué pregunta abandonan más
   usuarios, para optimizar el flujo.
6. **Multi-tenant**: si se comercializa a múltiples clientes, aislar
   configuración de preguntas y tokens de bot por cliente (`tenantId`).
7. **Tests automatizados**: suite de tests unitarios sobre
   `ConversationService` y `validators.js` (lógica pura, fácil de testear
   sin mockear Telegram), y tests de integración con `telegraf-test`.
8. **Rate limiting y anti-spam**: middleware para limitar mensajes por
   usuario en ventanas de tiempo cortas.
9. **Cola de trabajos** para integraciones externas (CRM, Sheets, Trello),
   evitando que una API externa lenta bloquee la respuesta al usuario en Telegram.
10. **Migración a TypeScript**: aprovechar los JSDoc ya existentes como base
    para tipar el proyecto de forma incremental.
