require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const Y = require('yjs');
const { PrismaClient } = require('@prisma/client');
const { setupWSConnection, docs, getYDoc } = require('y-websocket/bin/utils');
const awareness = require('y-protocols/awareness');

const prisma = new PrismaClient();
const port = Number(process.env.WS_PORT || 1234);
const secret = process.env.JWT_SECRET || 'local-demo-only-change-me';
const instanceId = `${process.pid}-${Math.random().toString(36).slice(2)}`;
const remoteOrigin = Symbol('redis-update');
const wss = new WebSocket.Server({ noServer: true });
const server = http.createServer((_req, res) => { res.writeHead(200, { 'content-type': 'text/plain' }); res.end('CollabSpace realtime service'); });
const redisUrl = process.env.REDIS_URL;
let publisher, subscriber;
const bridged = new WeakSet();
const loaded = new WeakSet();
const persistenceTimers = new WeakMap();

function parseRoom(url) { return decodeURIComponent(new URL(url, 'http://localhost').pathname.replace(/^\//, '')); }
async function pageRole(userId, pageId) {
  const page = await prisma.page.findUnique({ where: { id: pageId }, include: { workspace: { include: { memberships: { where: { userId } } } } } });
  if (!page) return null;
  return page.workspace.ownerId === userId ? 'owner' : page.workspace.memberships[0]?.role || null;
}
async function authorize(req) {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  if (!token) return false;
  try { const user = jwt.verify(token, secret); const role = await pageRole(user.id, parseRoom(req.url)); return ['owner', 'edit', 'comment', 'view'].includes(role) ? role : null; }
  catch { return null; }
}
function isDocumentWrite(message) {
  try {
    const bytes = message instanceof ArrayBuffer ? new Uint8Array(message) : Buffer.isBuffer(message) ? new Uint8Array(message) : new Uint8Array(message.buffer, message.byteOffset, message.byteLength);
    if (bytes[0] === 1) return false;
    if (bytes[0] !== 0) return true;
    let offset = 1; let value = 0; let shift = 0;
    while (offset < bytes.length) { const byte = bytes[offset++]; value |= (byte & 0x7f) << shift; if ((byte & 0x80) === 0) break; shift += 7; }
    return value === 2;
  } catch { return true; }
}

async function bridgeRedis(docName, doc) {
  if (!publisher || bridged.has(doc)) return;
  bridged.add(doc);
  const channel = `collabspace:doc:${docName}`;
  const publish = payload => publisher.publish(channel, JSON.stringify({ source: instanceId, ...payload })).catch(err => console.error('Redis publish failed:', err.message));
  doc.on('update', (update, origin) => { if (origin !== remoteOrigin) publish({ type: 'update', data: Buffer.from(update).toString('base64') }); });
  doc.awareness.on('update', ({ added, updated, removed }, origin) => {
    if (origin === remoteOrigin) return;
    const clients = [...added, ...updated, ...removed];
    if (clients.length) publish({ type: 'awareness', data: Buffer.from(awareness.encodeAwarenessUpdate(doc.awareness, clients)).toString('base64') });
  });
  await subscriber.subscribe(channel);
}

async function loadAndPersistDocument(pageId) {
  const doc = getYDoc(pageId);
  if (loaded.has(doc)) return doc;
  const saved = await prisma.yDocument.findUnique({ where: { pageId } });
  if (saved?.state) Y.applyUpdate(doc, new Uint8Array(saved.state), remoteOrigin);
  loaded.add(doc);
  doc.on('update', () => {
    const previous = persistenceTimers.get(doc);
    if (previous) clearTimeout(previous);
    persistenceTimers.set(doc, setTimeout(async () => {
      try { await prisma.yDocument.upsert({ where: { pageId }, create: { pageId, state: Buffer.from(Y.encodeStateAsUpdate(doc)) }, update: { state: Buffer.from(Y.encodeStateAsUpdate(doc)) } }); }
      catch (err) { console.error(`Yjs persistence failed for ${pageId}:`, err.message); }
    }, 350));
  });
  return doc;
}

if (redisUrl) {
  publisher = new Redis(redisUrl, { lazyConnect: true });
  subscriber = new Redis(redisUrl, { lazyConnect: true });
  Promise.all([publisher.connect(), subscriber.connect()]).then(() => console.log('Redis pub/sub bridge connected')).catch(err => console.error('Redis unavailable:', err.message));
  subscriber.on('message', (channel, raw) => {
    try {
      const packet = JSON.parse(raw);
      if (packet.source === instanceId) return;
      const docName = channel.slice('collabspace:doc:'.length);
      const doc = docs.get(docName);
      if (!doc) return;
      const bytes = Buffer.from(packet.data, 'base64');
      if (packet.type === 'update') Y.applyUpdate(doc, bytes, remoteOrigin);
      else if (packet.type === 'awareness') awareness.applyAwarenessUpdate(doc.awareness, bytes, remoteOrigin);
    } catch (err) { console.error('Invalid Redis collaboration event:', err.message); }
  });
}

wss.on('connection', async (socket, req) => {
  const room = parseRoom(req.url);
  await loadAndPersistDocument(room);
  setupWSConnection(socket, req, { docName: room });
  const doc = docs.get(room);
  if (doc) await bridgeRedis(room, doc);
  if (req.collabRole === 'view' || req.collabRole === 'comment') socket.prependListener('message', message => { if (isDocumentWrite(message)) socket.close(1008, 'This workspace role cannot edit documents.'); });
});
server.on('upgrade', async (req, socket, head) => {
  const room = parseRoom(req.url);
  const role = await authorize(req);
  if (!room || !role) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); socket.destroy(); return; }
  try { await loadAndPersistDocument(room); }
  catch (err) { console.error('Unable to load collaborative document:', err.message); socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n'); socket.destroy(); return; }
  req.collabRole = role;
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});
server.listen(port, process.env.HOST || '0.0.0.0', () => console.log(`CollabSpace Yjs WebSocket listening on port ${port}`));
async function close() {
  server.close();
  for (const client of wss.clients) client.terminate();
  wss.close();
  await Promise.all(Array.from(docs.entries(), async ([pageId, doc]) => {
    const timer = persistenceTimers.get(doc);
    if (timer) clearTimeout(timer);
    try { await prisma.yDocument.upsert({ where: { pageId }, create: { pageId, state: Buffer.from(Y.encodeStateAsUpdate(doc)) }, update: { state: Buffer.from(Y.encodeStateAsUpdate(doc)) } }); }
    catch (err) { console.error(`Final Yjs persistence failed for ${pageId}:`, err.message); }
  }));
  if (publisher) await publisher.quit(); if (subscriber) await subscriber.quit();
  await prisma.$disconnect(); process.exit(0);
}
process.on('SIGINT', close); process.on('SIGTERM', close);
