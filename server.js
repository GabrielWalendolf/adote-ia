import express from 'express'
import sqlite3pkg from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const { verbose } = sqlite3pkg
const sqlite3 = verbose()

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()
app.use(express.json())

const db = new sqlite3.Database(path.join(__dirname, 'database.db'))

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL,
      especie     TEXT    NOT NULL,
      raca        TEXT,
      idade       TEXT,
      sexo        TEXT,
      porte       TEXT    DEFAULT 'medio',
      status      TEXT    DEFAULT 'disponivel',
      vacinado    INTEGER DEFAULT 0,
      castrado    INTEGER DEFAULT 0,
      vermifugado INTEGER DEFAULT 0,
      descricao   TEXT,
      contato     TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

// ─── Estatísticas ────────────────────────────────────────────────────────────

app.get('/api/pets/stats', (req, res) => {
  db.all('SELECT * FROM pets', [], (err, pets) => {
    if (err) return res.status(500).json({ erro: err.message })
    res.json({
      total:       pets.length,
      disponiveis: pets.filter(p => p.status === 'disponivel').length,
      adotados:    pets.filter(p => p.status === 'adotado').length,
      cachorros:   pets.filter(p => p.especie === 'cachorro').length,
      gatos:       pets.filter(p => p.especie === 'gato').length,
    })
  })
})

// ─── Listar pets ─────────────────────────────────────────────────────────────

app.get('/api/pets', (req, res) => {
  db.all('SELECT * FROM pets ORDER BY created_at DESC', [], (err, pets) => {
    if (err) return res.status(500).json({ erro: err.message })
    res.json(pets)
  })
})

// ─── Buscar pet por ID ────────────────────────────────────────────────────────

app.get('/api/pets/:id', (req, res) => {
  db.get('SELECT * FROM pets WHERE id = ?', [req.params.id], (err, pet) => {
    if (err)  return res.status(500).json({ erro: err.message })
    if (!pet) return res.status(404).json({ erro: 'Pet não encontrado' })
    res.json(pet)
  })
})

// ─── Cadastrar pet ────────────────────────────────────────────────────────────

app.post('/api/pets', (req, res) => {
  const {
    nome, especie, raca, idade, sexo, porte, status,
    vacinado, castrado, vermifugado, descricao, contato,
  } = req.body

  if (!nome || !especie) {
    return res.status(400).json({ erro: 'Nome e espécie são obrigatórios.' })
  }

  db.run(
    `INSERT INTO pets
      (nome, especie, raca, idade, sexo, porte, status, vacinado, castrado, vermifugado, descricao, contato)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, especie, raca, idade, sexo,
     porte || 'medio', status || 'disponivel',
     vacinado ? 1 : 0, castrado ? 1 : 0, vermifugado ? 1 : 0,
     descricao, contato],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message })
      res.json({ id: this.lastID })
    }
  )
})

// ─── Atualizar pet ────────────────────────────────────────────────────────────

app.put('/api/pets/:id', (req, res) => {
  const {
    nome, especie, raca, idade, sexo, porte, status,
    vacinado, castrado, vermifugado, descricao, contato,
  } = req.body

  db.run(
    `UPDATE pets
     SET nome=?, especie=?, raca=?, idade=?, sexo=?, porte=?, status=?,
         vacinado=?, castrado=?, vermifugado=?, descricao=?, contato=?
     WHERE id=?`,
    [nome, especie, raca, idade, sexo, porte, status,
     vacinado ? 1 : 0, castrado ? 1 : 0, vermifugado ? 1 : 0,
     descricao, contato, req.params.id],
    function (err) {
      if (err)           return res.status(500).json({ erro: err.message })
      if (!this.changes) return res.status(404).json({ erro: 'Pet não encontrado' })
      res.json({ ok: true })
    }
  )
})

// ─── Remover pet ──────────────────────────────────────────────────────────────

app.delete('/api/pets/:id', (req, res) => {
  db.run('DELETE FROM pets WHERE id = ?', [req.params.id], function (err) {
    if (err)           return res.status(500).json({ erro: err.message })
    if (!this.changes) return res.status(404).json({ erro: 'Pet não encontrado' })
    res.json({ ok: true })
  })
})

// ─── Servir o React em produção ───────────────────────────────────────────────

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ─── Iniciar servidor ─────────────────────────────────────────────────────────

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})
