import { Router } from 'express'
import pool from '../db'
import { extractToken } from '../auth'

const router = Router()

function rowToAppointment(r: Record<string, unknown>) {
  const rawDate = r.date
  const dateStr =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : String(rawDate).slice(0, 10)

  return {
    id:          r.id,
    userId:      r.user_id,
    clientName:  r.client_name,
    clientPhone: r.client_phone,
    clientEmail: r.client_email,
    services:    r.services,
    date:        dateStr,
    time:        r.time,
    status:      r.status,
    notes:       r.notes ?? undefined,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  }
}

// GET /api/appointments
router.get('/', async (req, res) => {
  const payload = extractToken(req)
  if (!payload) { res.status(401).json({ error: 'Não autenticado' }); return }

  const { rows } =
    payload.role === 'admin'
      ? await pool.query('SELECT * FROM appointments ORDER BY date, time')
      : await pool.query('SELECT * FROM appointments WHERE user_id = $1 ORDER BY date, time', [payload.userId])

  res.json(rows.map(rowToAppointment))
})

// POST /api/appointments
router.post('/', async (req, res) => {
  const payload = extractToken(req)
  if (!payload) { res.status(401).json({ error: 'Não autenticado' }); return }

  const { clientName, clientPhone, clientEmail, services, date, time, status, notes } = req.body ?? {}
  if (!clientName || !clientPhone || !services || !date || !time) {
    res.status(400).json({ error: 'Campos obrigatórios ausentes' }); return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO appointments
         (user_id, client_name, client_phone, client_email, services, date, time, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        payload.userId,
        clientName,
        String(clientPhone).replace(/\D/g, ''),
        clientEmail,
        JSON.stringify(services),
        date,
        time,
        status ?? 'pending',
        notes ?? null,
      ],
    )
    res.status(201).json(rowToAppointment(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  const payload = extractToken(req)
  if (!payload) { res.status(401).json({ error: 'Não autenticado' }); return }

  const { id } = req.params
  const { rows: existing } = await pool.query('SELECT * FROM appointments WHERE id = $1', [id])
  if (!existing[0]) { res.status(404).json({ error: 'Agendamento não encontrado' }); return }
  if (payload.role !== 'admin' && existing[0].user_id !== payload.userId) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  const { clientName, clientPhone, clientEmail, services, date, time, status, notes } = req.body ?? {}
  try {
    const { rows } = await pool.query(
      `UPDATE appointments SET
         client_name  = COALESCE($1, client_name),
         client_phone = COALESCE($2, client_phone),
         client_email = COALESCE($3, client_email),
         services     = COALESCE($4, services),
         date         = COALESCE($5, date),
         time         = COALESCE($6, time),
         status       = COALESCE($7, status),
         notes        = COALESCE($8, notes),
         updated_at   = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        clientName   ?? null,
        clientPhone  ? String(clientPhone).replace(/\D/g, '') : null,
        clientEmail  ?? null,
        services     ? JSON.stringify(services) : null,
        date         ?? null,
        time         ?? null,
        status       ?? null,
        notes        ?? null,
        id,
      ],
    )
    res.json(rowToAppointment(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  const payload = extractToken(req)
  if (!payload) { res.status(401).json({ error: 'Não autenticado' }); return }

  const { id } = req.params
  const { rows: existing } = await pool.query('SELECT * FROM appointments WHERE id = $1', [id])
  if (!existing[0]) { res.status(404).json({ error: 'Agendamento não encontrado' }); return }
  if (payload.role !== 'admin' && existing[0].user_id !== payload.userId) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  await pool.query('DELETE FROM appointments WHERE id = $1', [id])
  res.status(204).end()
})

export default router
