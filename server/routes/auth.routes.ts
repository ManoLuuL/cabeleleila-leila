import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db'
import { signToken } from '../auth'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body ?? {}
  if (!name || !phone || !email || !password) {
    res.status(400).json({ error: 'Campos obrigatórios ausentes' }); return
  }

  const digits = String(phone).replace(/\D/g, '')

  try {
    const exists = await pool.query(
      'SELECT id FROM users WHERE phone = $1 OR email = $2',
      [digits, String(email).toLowerCase()],
    )
    if (exists.rows.length > 0) {
      res.status(409).json({ error: 'Telefone ou e-mail já cadastrado' }); return
    }

    const hash = await bcrypt.hash(String(password), 10)
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
    const role = String(email).toLowerCase() === adminEmail ? 'admin' : 'client'

    const { rows } = await pool.query(
      `INSERT INTO users (name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, phone, email, role`,
      [name, digits, String(email).toLowerCase(), hash, role],
    )

    const token = signToken({ userId: rows[0].id, role: rows[0].role })
    res.status(201).json({ token, user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios' }); return
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, phone, email, role, password_hash FROM users WHERE email = $1',
      [String(email).toLowerCase()],
    )
    const user = rows[0]
    if (!user) { res.status(401).json({ error: 'E-mail ou senha inválidos' }); return }

    const valid = await bcrypt.compare(String(password), user.password_hash)
    if (!valid) { res.status(401).json({ error: 'E-mail ou senha inválidos' }); return }

    const token = signToken({ userId: user.id, role: user.role })
    const { password_hash: _, ...safeUser } = user
    res.status(200).json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const auth = req.headers['authorization']
  if (!auth?.startsWith('Bearer ')) { res.status(401).json({ error: 'Não autenticado' }); return }

  try {
    const { verifyToken } = await import('../auth')
    const payload = verifyToken(auth.slice(7))
    const { rows } = await pool.query(
      'SELECT id, name, phone, email, role FROM users WHERE id = $1',
      [payload.userId],
    )
    if (!rows[0]) { res.status(404).json({ error: 'Usuário não encontrado' }); return }
    res.status(200).json({ user: rows[0] })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
