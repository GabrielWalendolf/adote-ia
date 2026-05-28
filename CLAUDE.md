# Adoção Inteligente — Contexto do Projeto

Plataforma de adoção de pets com recomendação por IA. Voluntários cadastram animais e registram memórias (texto ou áudio); adotantes descrevem seu perfil e o sistema usa a API Groq para recomendar o pet mais compatível. Há também busca semântica (RAG) sobre as memórias dos pets.

## Stack

- **Frontend:** React 18, Vite, React Router DOM 6, TailwindCSS 3
- **Backend:** Express 5, SQLite3 (`database.db` na raiz)
- **IA:** Groq API — modelo `llama3-8b-8192` (match) e Whisper (transcrição de áudio)

## Comandos

```bash
npm run dev      # Frontend Vite — http://localhost:5173
npm run server   # Backend Express — http://localhost:3000
```

O Vite faz proxy de `/api/*` → `http://localhost:3000` (configurado em `vite.config.js`).

## Variáveis de Ambiente

| Variável       | Uso                                    |
|----------------|----------------------------------------|
| `GROQ_API_KEY` | Recomendação de pets e transcrição de áudio |

## Estrutura de Diretórios

```
src/
  components/    Navbar, Footer, FormField, GravadorAudio, PetCard
  pages/         Home, Adocao, Pets, Cadastro, Admin, Memorias, RAGBusca
  services/      petService.js, groqService.js, ragService.js
  hooks/         usePets.js
  index.css      Classes utilitárias customizadas
server.js        API Express
database.db      SQLite (gerado automaticamente na 1ª execução)
```

## Rotas Frontend

| Rota              | Página      | Descrição                        |
|-------------------|-------------|----------------------------------|
| `/`               | Home        | Dashboard com estatísticas       |
| `/adocao`         | Adocao      | Match IA adotante ↔ pet          |
| `/pets`           | Pets        | Listagem de animais disponíveis  |
| `/rag`            | RAGBusca    | Busca semântica nas memórias     |
| `/cadastro`       | Cadastro    | Cadastrar novo pet               |
| `/admin`          | Admin       | Gerenciar pets (editar/excluir)  |
| `/memorias/:id`   | Memorias    | Memórias de um pet específico    |

## Rotas Backend (Express)

| Método | Endpoint               | Descrição                          |
|--------|------------------------|------------------------------------|
| GET    | `/api/pets`            | Listar todos os pets               |
| GET    | `/api/pets/stats`      | Estatísticas gerais                |
| GET    | `/api/pets/:id`        | Buscar pet por ID                  |
| POST   | `/api/pets`            | Cadastrar novo pet                 |
| PUT    | `/api/pets/:id`        | Atualizar pet                      |
| DELETE | `/api/pets/:id`        | Excluir pet                        |
| GET    | `/api/pets/:id/memories` | Listar memórias do pet           |
| POST   | `/api/pets/:id/memories` | Adicionar memória (texto)        |
| POST   | `/api/transcribe`      | Transcrever áudio (Groq Whisper)   |
| POST   | `/api/match`           | Recomendar pet por perfil (Groq)   |
| POST   | `/api/rag/search`      | Busca semântica RAG                |

## Banco de Dados (SQLite)

**Tabela `pets`:** id, nome, especie, raca, idade, sexo, porte, status, vacinado, castrado, vermifugado, descricao, contato, created_at

**Tabela `pet_memories`:** id, pet_id, tipo (texto|audio), conteudo, created_at

## Ícones

Tabler Icons webfont instalado localmente via npm. Uso:

```jsx
<i className="ti-home" />
<i className="ti-paw text-brand-500 text-xl" />
```

Ícones comuns: `ti-home`, `ti-sparkles`, `ti-paw`, `ti-search`, `ti-plus`, `ti-settings`, `ti-brain`, `ti-microphone`, `ti-pencil`, `ti-trash`, `ti-x`, `ti-key`, `ti-device-floppy`, `ti-arrow-left`

## Classes CSS Utilitárias (src/index.css)

```
.btn-primary      Botão vermelho/brand principal
.btn-secondary    Botão cinza secundário
.btn-danger       Botão vermelho de exclusão
.section-card     Card branco com sombra (padding incluso)
.section-label    Label uppercase de seção
.input            Campo de formulário estilizado
.label            Label de formulário
.badge            Badge de status
.check-card       Card de checkbox estilizado
.spinner          Animação de carregamento circular
```

## Paleta de Cores (TailwindCSS)

Cor primária `brand`: vermelho/rosê — `brand-50` (fundo) → `brand-500` (#ff6b6b) → `brand-700` (hover escuro)
