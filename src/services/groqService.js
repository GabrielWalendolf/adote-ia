const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODELO = 'llama-3.3-70b-versatile'

export async function recomendarPets(apiKey, perfil, petsDisponiveis) {
  const listaPets =
    petsDisponiveis.length > 0
      ? petsDisponiveis
          .map(
            p =>
              `• [ID ${p.id}] ${p.nome} — ${p.especie}` +
              (p.raca ? `, ${p.raca}` : '') +
              (p.porte ? `, porte ${p.porte}` : '') +
              (p.idade ? `, ${p.idade}` : '') +
              (p.sexo ? `, ${p.sexo}` : '') +
              (p.vacinado ? ', vacinado' : '') +
              (p.castrado ? ', castrado' : '') +
              (p.descricao ? `. ${p.descricao}` : '')
          )
          .join('\n')
      : 'Nenhum pet disponível no momento.'

  const perfilTexto = [
    `Nome: ${perfil.nome || 'Não informado'}`,
    `Tipo de moradia: ${perfil.tipoMoradia || 'Não informado'}`,
    `Tem quintal: ${perfil.temQuintal ? 'Sim' : 'Não'}`,
    `Ambiente telado: ${perfil.ambienteTelado ? 'Sim' : 'Não'}`,
    `Tem crianças em casa: ${perfil.temCriancas ? 'Sim' : 'Não'}`,
    `Tem outros pets: ${perfil.temOutrosPets ? 'Sim' : 'Não'}`,
    `Espécie preferida: ${perfil.especiePreferida || 'Sem preferência'}`,
    `Porte preferido: ${perfil.portePreferido || 'Sem preferência'}`,
    `Horas disponíveis por dia: ${perfil.horasDisponiveis}h`,
    `Experiência com pets: ${perfil.experiencia || 'Não informado'}`,
    `Alergia a pelos: ${perfil.alergiaPelos ? 'Sim — priorizar raças hipoalergênicas' : 'Não'}`,
  ].join('\n')

  const userPrompt = `
Perfil do adotante:
${perfilTexto}

Pets disponíveis para adoção:
${listaPets}

Com base no perfil acima, analise os pets disponíveis e:
1. Recomende os 3 pets mais compatíveis (mencione o nome e o ID de cada um)
2. Para cada recomendação, explique em 2-3 frases por que é uma boa combinação
3. Se houver alergia a pelos, priorize raças hipoalergênicas e avise quando um pet pode causar reação
4. Se nenhum pet for adequado para o perfil, explique o motivo claramente

Seja amigável, direto e use linguagem acessível.
`.trim()

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODELO,
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em bem-estar animal e adoção responsável. Sempre responda em português brasileiro.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Erro na API Groq (${res.status})`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}
