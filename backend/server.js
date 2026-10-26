require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'local-demo-only-change-me';
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '1mb' }));

function sign(user) { return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' }); }
function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
}
async function pageAccess(userId, pageId, minimum = 'view') {
  const page = await prisma.page.findUnique({ where: { id: pageId }, include: { workspace: { include: { memberships: { where: { userId } } } } } });
  if (!page) return { page: null, role: null };
  const role = page.workspace.ownerId === userId ? 'owner' : page.workspace.memberships[0]?.role || null;
  const ranks = { view: 1, comment: 2, edit: 3, owner: 4 };
  return { page, role: ranks[role] >= ranks[minimum] ? role : null };
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'collabspace-api' }));
app.post('/register', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (username.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ message: 'Enter a name, valid email, and password with at least 8 characters.' });
    const user = await prisma.$transaction(async tx => {
      const created = await tx.user.create({ data: { username, email, passwordHash: await bcrypt.hash(password, 12) } });
      await tx.workspace.create({ data: { name: 'Design Studio', ownerId: created.id, memberships: { create: { userId: created.id, role: 'owner' } }, pages: { create: [{ title: 'Welcome to CollabSpace' }, { title: 'Product roadmap' }, { title: 'Team notes' }] } } });
      return created;
    });
    return res.status(201).json({ success: true, token: sign(user), user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'That username or email is already in use.' });
    console.error('Register failed:', error); return res.status(500).json({ message: 'Unable to create account. Check the database setup.' });
  }
});
app.post('/login', async (req, res) => {
  try {
    const identity = String(req.body.username || '').trim();
    const user = await prisma.user.findFirst({ where: { OR: [{ username: identity }, { email: identity.toLowerCase() }] } });
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ message: 'Invalid username or password.' });
    return res.json({ success: true, token: sign(user), user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) { console.error('Login failed:', error); return res.status(500).json({ message: 'Unable to sign in. Check the database setup.' }); }
});
app.get('/api/workspaces', auth, async (req, res) => {
  const workspaces = await prisma.workspace.findMany({ where: { OR: [{ ownerId: req.user.id }, { memberships: { some: { userId: req.user.id } } }] }, include: { pages: true, memberships: true, owner: { select: { username: true } } } });
  workspaces.sort((left, right) => Number(left.ownerId === req.user.id) - Number(right.ownerId === req.user.id));
  res.json(workspaces);
});
app.post('/api/workspaces', auth, async (req, res) => {
  const name = String(req.body.name || '').trim(); if (!name) return res.status(400).json({ message: 'Workspace name is required.' });
  const workspace = await prisma.workspace.create({ data: { name, ownerId: req.user.id, memberships: { create: { userId: req.user.id, role: 'owner' } } } }); res.status(201).json(workspace);
});
app.post('/api/workspaces/:id/members', auth, async (req, res) => {
  const role = String(req.body.role || 'edit');
  if (!['view', 'comment', 'edit'].includes(role)) return res.status(400).json({ message: 'Role must be view, comment, or edit.' });
  const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
  if (!workspace || workspace.ownerId !== req.user.id) return res.status(403).json({ message: 'Only the workspace owner can invite members.' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const invited = await prisma.user.findUnique({ where: { email } });
  if (!invited) return res.status(404).json({ message: 'That email needs to create an account before it can be added.' });
  const membership = await prisma.membership.upsert({ where: { userId_workspaceId: { userId: invited.id, workspaceId: workspace.id } }, create: { userId: invited.id, workspaceId: workspace.id, role }, update: { role } });
  res.status(201).json({ membership: { id: membership.id, role, username: invited.username, email: invited.email } });
});
app.post('/api/workspaces/:workspace/pages', auth, async (req, res) => {
  const ws = await prisma.workspace.findFirst({ where: { name: decodeURIComponent(req.params.workspace), OR: [{ ownerId: req.user.id }, { memberships: { some: { userId: req.user.id, role: { in: ['edit', 'owner'] } } } }] } });
  if (!ws) return res.status(404).json({ message: 'Workspace not found or not editable.' });
  const page = await prisma.page.create({ data: { title: String(req.body.title || 'Untitled page'), ...(req.body.id ? { id: String(req.body.id) } : {}), workspaceId: ws.id } }); res.status(201).json(page);
});
app.patch('/api/pages/:id', auth, async (req, res) => {
  const access = await pageAccess(req.user.id, req.params.id, 'edit'); if (!access.role) return res.status(403).json({ message: 'Edit access is required.' });
  const title = String(req.body.title || '').trim().slice(0, 180); if (!title) return res.status(400).json({ message: 'Page title is required.' });
  const page = await prisma.page.update({ where: { id: req.params.id }, data: { title } }); res.json(page);
});
app.get('/api/pages/:id/comments', auth, async (req, res) => {
  const access = await pageAccess(req.user.id, req.params.id); if (!access.role) return res.status(404).json([]);
  const comments = await prisma.comment.findMany({ where: { pageId: req.params.id }, include: { author: { select: { username: true } } }, orderBy: { createdAt: 'asc' } }); res.json(comments.map(c => ({ id: c.id, body: c.body, author: c.author.username, createdAt: c.createdAt })));
});
app.post('/api/pages/:id/comments', auth, async (req, res) => {
  const access = await pageAccess(req.user.id, req.params.id, 'comment'); if (!access.role) return res.status(403).json({ message: 'Comment access is required.' });
  const body = String(req.body.body || '').trim(); if (!body || body.length > 5000) return res.status(400).json({ message: 'Comment must be between 1 and 5000 characters.' });
  const comment = await prisma.comment.create({ data: { body, pageId: req.params.id, authorId: req.user.id }, include: { author: { select: { username: true } } } }); res.status(201).json({ id: comment.id, body: comment.body, author: comment.author.username, createdAt: comment.createdAt });
});
app.get('/api/pages/:id/snapshots', auth, async (req, res) => {
  const access = await pageAccess(req.user.id, req.params.id); if (!access.role) return res.status(404).json([]);
  const items = await prisma.snapshot.findMany({ where: { pageId: req.params.id }, include: { author: { select: { username: true } } }, orderBy: { createdAt: 'desc' } }); res.json(items.map(s => ({ id: s.id, label: s.label, author: s.author.username, createdAt: s.createdAt })));
});
app.post('/api/pages/:id/snapshots', auth, async (req, res) => {
  const access = await pageAccess(req.user.id, req.params.id, 'edit'); if (!access.role) return res.status(403).json({ message: 'Edit access is required.' });
  const label = String(req.body.label || '').trim().slice(0, 120) || 'Untitled snapshot';
  const yDocument = await prisma.yDocument.findUnique({ where: { pageId: req.params.id } });
  const snapshot = await prisma.snapshot.create({ data: { label, pageId: req.params.id, authorId: req.user.id, state: yDocument?.state || undefined } }); res.status(201).json(snapshot);
});
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Unexpected server error.' }); });

app.listen(PORT, () => console.log(`CollabSpace API listening on http://localhost:${PORT}`));
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
