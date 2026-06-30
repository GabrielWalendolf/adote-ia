import express from 'express'
import pkg from 'pg'
import multer from 'multer'

const { Pool } = pkg

const app = express()
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// ─── Estatísticas ─────────────────────────────────────────────────────────────

app.get('/api/pets/stats', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pets')
    res.json({
      total:       rows.length,
      disponiveis: rows.filter(p => p.status === 'disponivel').length,
      adotados:    rows.filter(p => p.status === 'adotado').length,
      cachorros:   rows.filter(p => p.especie === 'cachorro').length,
      gatos:       rows.filter(p => p.especie === 'gato').length,
    })
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Listar pets ──────────────────────────────────────────────────────────────

app.get('/api/pets', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pets ORDER BY created_at DESC')
    res.json(rows)
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Buscar pet por ID ────────────────────────────────────────────────────────

app.get('/api/pets/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pets WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ erro: 'Pet não encontrado' })
    res.json(rows[0])
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Cadastrar pet ────────────────────────────────────────────────────────────

app.post('/api/pets', async (req, res) => {
  const {
    nome, especie, raca, idade, sexo, porte, status,
    vacinado, castrado, vermifugado, descricao, contato,
  } = req.body

  if (!nome || !especie) {
    return res.status(400).json({ erro: 'Nome e espécie são obrigatórios.' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO pets
        (nome, especie, raca, idade, sexo, porte, status, vacinado, castrado, vermifugado, descricao, contato)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [nome, especie, raca, idade, sexo,
       porte || 'medio', status || 'disponivel',
       !!vacinado, !!castrado, !!vermifugado,
       descricao, contato]
    )
    res.json({ id: rows[0].id })
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Atualizar pet ────────────────────────────────────────────────────────────

app.put('/api/pets/:id', async (req, res) => {
  const {
    nome, especie, raca, idade, sexo, porte, status,
    vacinado, castrado, vermifugado, descricao, contato,
    adotado_por, data_adocao,
  } = req.body

  const dataAdocaoFinal = status === 'adotado'
    ? (data_adocao || new Date().toISOString().split('T')[0])
    : null

  try {
    const { rowCount } = await pool.query(
      `UPDATE pets
       SET nome=$1, especie=$2, raca=$3, idade=$4, sexo=$5, porte=$6, status=$7,
           vacinado=$8, castrado=$9, vermifugado=$10, descricao=$11, contato=$12,
           adotado_por=$13, data_adocao=$14
       WHERE id=$15`,
      [nome, especie, raca, idade, sexo, porte, status,
       !!vacinado, !!castrado, !!vermifugado,
       descricao, contato,
       status === 'adotado' ? (adotado_por || null) : null,
       dataAdocaoFinal,
       req.params.id]
    )
    if (!rowCount) return res.status(404).json({ erro: 'Pet não encontrado' })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Remover pet ──────────────────────────────────────────────────────────────

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM pets WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ erro: 'Pet não encontrado' })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Memórias: listar ─────────────────────────────────────────────────────────

app.get('/api/pets/:id/memories', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM pet_memories WHERE pet_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Memórias: adicionar texto ────────────────────────────────────────────────

app.post('/api/pets/:id/memories', async (req, res) => {
  const { conteudo, tipo = 'texto' } = req.body
  if (!conteudo?.trim()) return res.status(400).json({ erro: 'Conteúdo obrigatório.' })

  try {
    const { rows } = await pool.query(
      'INSERT INTO pet_memories (pet_id, tipo, conteudo) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, tipo, conteudo.trim()]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Memórias: upload de áudio + transcrição Groq Whisper ────────────────────

app.post('/api/pets/:id/audio', upload.single('audio'), async (req, res) => {
  const { apiKey } = req.body
  if (!apiKey)   return res.status(400).json({ erro: 'Chave API obrigatória.' })
  if (!req.file) return res.status(400).json({ erro: 'Arquivo de áudio obrigatório.' })

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
    const { rows } = await pool.query(
      'INSERT INTO pet_memories (pet_id, tipo, conteudo) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, 'audio', transcricao]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── Memórias: deletar ────────────────────────────────────────────────────────

app.delete('/api/memories/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM pet_memories WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ erro: 'Memória não encontrada.' })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

// ─── RAG: busca semântica em linguagem natural ────────────────────────────────

app.post('/api/rag/busca', async (req, res) => {
  const { query, apiKey } = req.body
  if (!query?.trim()) return res.status(400).json({ erro: 'Query obrigatória.' })
  if (!apiKey)        return res.status(400).json({ erro: 'Chave API obrigatória.' })

  try {
    const { rows: pets }     = await pool.query('SELECT * FROM pets ORDER BY nome')
    const { rows: memories } = await pool.query(
      'SELECT * FROM pet_memories ORDER BY pet_id, created_at DESC'
    )

    const memoriasPorPet = {}
    for (const m of memories) {
      if (!memoriasPorPet[m.pet_id]) memoriasPorPet[m.pet_id] = []
      memoriasPorPet[m.pet_id].push(m)
    }

    const contexto = pets.map(pet => {
      const mems = memoriasPorPet[pet.id] || []
      const memTexto = mems.length > 0
        ? mems.map(m => `    [${m.tipo}] ${m.conteudo}`).join('\n')
        : '    (nenhuma observação registrada)'
      const info = [
        pet.especie, pet.raca,
        pet.porte && `porte ${pet.porte}`,
        pet.idade, pet.sexo,
        pet.vacinado ? 'vacinado' : null,
        pet.castrado ? 'castrado' : null,
        pet.descricao,
      ].filter(Boolean).join(', ')
      return `**${pet.nome}** (ID ${pet.id}) — ${info}\n  Observações dos voluntários:\n${memTexto}`
    }).join('\n\n')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
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

    const petsEncontrados = pets.filter(
      pet => resposta.includes(pet.nome) || resposta.includes(`ID ${pet.id}`)
    )

    res.json({ resposta, petsEncontrados, totalMemoriasIndexadas: memories.length, totalPets: pets.length })
  } catch (e) { res.status(500).json({ erro: e.message }) }
})

export default app
