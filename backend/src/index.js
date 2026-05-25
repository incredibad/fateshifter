import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import pool, { initDb } from './db/index.js';
import authRouter from './routes/auth.js';
import commandersRouter from './routes/commanders.js';
import generateRouter from './routes/generate.js';
import { requireAuth } from './middleware/requireAuth.js';

const app = express();
const PORT = process.env.PORT || 7283;
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicPath = join(__dirname, '../public');
const PgSession = connectPgSimple(session);
const SESSION_SECRET = process.env.SESSION_SECRET || 'espergen-dev-secret-change-in-production';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
  store: new PgSession({ pool, tableName: 'session', createTableIfMissing: false }),
  name: 'espergen.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true',
  },
}));

app.use('/api/auth', authRouter);
app.use('/api/commanders', requireAuth, commandersRouter);
app.use('/api/generate', requireAuth, generateRouter);

app.get('/health', (_, res) => res.json({ ok: true }));

if (existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (_, res) => res.sendFile(join(publicPath, 'index.html')));
}

async function start() {
  await initDb();
  app.listen(PORT, () => console.log(`EsperGen running on :${PORT}`));
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
