import express from 'express'
import sqlite3pkg from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const { verbose } = sqlite3pkg
const sqlite3 = verbose()

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

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
      adotado_por TEXT,
      data_adocao TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Migrations for existing databases
  db.run(`ALTER TABLE pets ADD COLUMN adotado_por TEXT`, () => {})
  db.run(`ALTER TABLE pets ADD COLUMN data_adocao TEXT`, () => {})

  db.run(`
    CREATE TABLE IF NOT EXISTS pet_memories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id     INTEGER NOT NULL,
      tipo       TEXT    DEFAULT 'texto',
      conteudo   TEXT    NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
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
    adotado_por, data_adocao,
  } = req.body

  const dataAdocaoFinal = status === 'adotado'
    ? (data_adocao || new Date().toISOString().split('T')[0])
    : null

  db.run(
    `UPDATE pets
     SET nome=?, especie=?, raca=?, idade=?, sexo=?, porte=?, status=?,
         vacinado=?, castrado=?, vermifugado=?, descricao=?, contato=?,
         adotado_por=?, data_adocao=?
     WHERE id=?`,
    [nome, especie, raca, idade, sexo, porte, status,
     vacinado ? 1 : 0, castrado ? 1 : 0, vermifugado ? 1 : 0,
     descricao, contato,
     status === 'adotado' ? (adotado_por || null) : null,
     dataAdocaoFinal,
     req.params.id],
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

// ─── Memórias: listar ────────────────────────────────────────────────────────

app.get('/api/pets/:id/memories', (req, res) => {
  db.all(
    'SELECT * FROM pet_memories WHERE pet_id = ? ORDER BY created_at DESC',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message })
      res.json(rows)
    }
  )
})

// ─── Memórias: adicionar texto ───────────────────────────────────────────────

app.post('/api/pets/:id/memories', (req, res) => {
  const { conteudo, tipo = 'texto' } = req.body
  if (!conteudo?.trim()) return res.status(400).json({ erro: 'Conteúdo obrigatório.' })

  db.run(
    'INSERT INTO pet_memories (pet_id, tipo, conteudo) VALUES (?, ?, ?)',
    [req.params.id, tipo, conteudo.trim()],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message })
      db.get('SELECT * FROM pet_memories WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ erro: e.message })
        res.json(row)
      })
    }
  )
})

// ─── Memórias: upload de áudio + transcrição Groq Whisper ────────────────────

app.post('/api/pets/:id/audio', upload.single('audio'), async (req, res) => {
  const { apiKey } = req.body
  if (!apiKey)    return res.status(400).json({ erro: 'Chave API obrigatória.' })
  if (!req.file)  return res.status(400).json({ erro: 'Arquivo de áudio obrigatório.' })

  try {
    const formData = new FormData()
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' })
    formData.append('file', blob, req.file.originalname || 'audio.webm')
    formData.append('model', 'whisper-large-v3-turbo')
    formData.append('language', 'pt')

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    })

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}))
      return res.status(502).json({ erro: err.error?.message || 'Erro na transcrição.' })
    }

    const { text: transcricao } = await groqRes.json()

    db.run(
      'INSERT INTO pet_memories (pet_id, tipo, conteudo) VALUES (?, ?, ?)',
      [req.params.id, 'audio', transcricao],
      function (err) {
        if (err) return res.status(500).json({ erro: err.message })
        db.get('SELECT * FROM pet_memories WHERE id = ?', [this.lastID], (e, row) => {
          if (e) return res.status(500).json({ erro: e.message })
          res.json(row)
        })
      }
    )
  } catch (e) {
    res.status(500).json({ erro: e.message })
  }
})

// ─── Memórias: deletar ────────────────────────────────────────────────────────

app.delete('/api/memories/:id', (req, res) => {
  db.run('DELETE FROM pet_memories WHERE id = ?', [req.params.id], function (err) {
    if (err)           return res.status(500).json({ erro: err.message })
    if (!this.changes) return res.status(404).json({ erro: 'Memória não encontrada.' })
    res.json({ ok: true })
  })
})

// ─── RAG: busca semântica em linguagem natural ────────────────────────────────

app.post('/api/rag/busca', async (req, res) => {
  const { query, apiKey } = req.body
  if (!query?.trim()) return res.status(400).json({ erro: 'Query obrigatória.' })
  if (!apiKey)        return res.status(400).json({ erro: 'Chave API obrigatória.' })

  db.all('SELECT * FROM pets ORDER BY nome', [], (err, pets) => {
    if (err) return res.status(500).json({ erro: err.message })

    db.all('SELECT * FROM pet_memories ORDER BY pet_id, created_at DESC', [], async (err2, memories) => {
      if (err2) return res.status(500).json({ erro: err2.message })

      // agrupa memórias por pet
      const memoriasPorPet = {}
      for (const m of memories) {
        if (!memoriasPorPet[m.pet_id]) memoriasPorPet[m.pet_id] = []
        memoriasPorPet[m.pet_id].push(m)
      }

      // monta contexto (pet info + memórias = base do RAG)
      const contexto = pets.map(pet => {
        const mems = memoriasPorPet[pet.id] || []
        const memTexto = mems.length > 0
          ? mems.map(m => `    [${m.tipo}] ${m.conteudo}`).join('\n')
          : '    (nenhuma observação registrada)'
        const info = [
          pet.especie,
          pet.raca,
          pet.porte && `porte ${pet.porte}`,
          pet.idade,
          pet.sexo,
          pet.vacinado ? 'vacinado' : null,
          pet.castrado ? 'castrado' : null,
          pet.descricao,
        ].filter(Boolean).join(', ')
        return `**${pet.nome}** (ID ${pet.id}) — ${info}\n  Observações dos voluntários:\n${memTexto}`
      }).join('\n\n')

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content:
                  'Você é um assistente de uma ONG de adoção de pets. ' +
                  'Responda perguntas sobre os pets com base nas informações e nas memórias/observações registradas pelos voluntários. ' +
                  'Seja específico: cite o nome e o ID de cada pet relevante. ' +
                  'Sempre responda em português brasileiro.',
              },
              {
                role: 'user',
                content: `Informações dos pets:\n\n${contexto}\n\n---\n\nPergunta: ${query.trim()}`,
              },
            ],
            temperature: 0.4,
            max_tokens: 1024,
          }),
        })

        if (!groqRes.ok) {
          const err = await groqRes.json().catch(() => ({}))
          return res.status(502).json({ erro: err.error?.message || 'Erro no RAG.' })
        }

        const groqData = await groqRes.json()
        const resposta = groqData.choices[0].message.content

        // identifica pets mencionados na resposta
        const petsEncontrados = pets.filter(
          pet => resposta.includes(pet.nome) || resposta.includes(`ID ${pet.id}`)
        )

        res.json({
          resposta,
          petsEncontrados,
          totalMemoriasIndexadas: memories.length,
          totalPets: pets.length,
        })
      } catch (e) {
        res.status(500).json({ erro: e.message })
      }
    })
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
