-- Dados de simulação — cole no Supabase SQL Editor e clique em Run

INSERT INTO pets (nome, especie, raca, idade, sexo, porte, status, vacinado, castrado, vermifugado, descricao, contato) VALUES
  ('Rex',     'cachorro', 'Labrador',        '3 anos',    'macho',  'grande',  'disponivel', true,  true,  true,  'Rex é um labrador muito brincalhão e carinhoso. Adora crianças e se dá bem com outros cães. Excelente para famílias com espaço externo.', '(11) 98765-4321'),
  ('Mia',     'gato',     'Siamês',          '2 anos',    'fêmea',  'pequeno', 'disponivel', true,  true,  true,  'Mia é uma gatinha tranquila e independente. Prefere ambientes calmos, sem muito barulho. Ideal para apartamentos.', '(11) 91234-5678'),
  ('Bolinha',  'cachorro', 'Poodle',          '1 ano',     'macho',  'pequeno', 'disponivel', true,  false, true,  'Bolinha é muito agitado e adora brincar. Aprende truques rápido e é excelente companhia para crianças.', '(21) 99876-5432'),
  ('Luna',    'gato',     'Persa',           '4 anos',    'fêmea',  'medio',   'disponivel', true,  true,  true,  'Luna é calma e adora colo. Não se dá bem com outros gatos, mas convive bem com humanos. Pelagem longa precisa de escovação semanal.', '(21) 98001-1234'),
  ('Thor',    'cachorro', 'Golden Retriever', '5 anos',    'macho',  'grande',  'adotado',    true,  true,  true,  'Thor foi adotado por uma família incrível. Era muito dócil e adorava nadar.', '(31) 97654-3210'),
  ('Pipoca',  'ave',      'Calopsita',        '1 ano',     NULL,     'pequeno', 'disponivel', false, false, false, 'Pipoca é uma calopsita que adora música. Já aprende a assobiar e é muito sociável.', '(41) 96543-2109'),
  ('Mel',     'cachorro', 'Beagle',           '2 anos',    'fêmea',  'medio',   'disponivel', true,  true,  true,  'Mel é curiosa e ativa. Precisa de passeios diários e estimulação mental. Não recomendada para apartamentos pequenos sem espaço para exercício.', '(51) 95432-1098'),
  ('Simba',   'gato',     'Vira-lata',        '3 anos',    'macho',  'medio',   'reservado',  true,  true,  true,  'Simba é um gato de rua resgatado. Tímido no começo, mas muito afetuoso com quem conquista sua confiança.', '(61) 94321-0987'),
  ('Fofinha', 'roedor',   'Hamster',          '6 meses',   'fêmea',  'pequeno', 'disponivel', false, false, false, 'Fofinha é uma hamster docilíssima. Ótima para quem quer um pet de baixa manutenção.', '(71) 93210-9876'),
  ('Duke',    'cachorro', 'Pastor Alemão',    '4 anos',    'macho',  'grande',  'disponivel', true,  false, true,  'Duke é um cão muito inteligente e protetor. Ideal para quem tem experiência com cães de grande porte. Necessita de treinamento e espaço.', '(81) 92109-8765');

-- Atualiza o pet adotado com data e nome do adotante
UPDATE pets SET adotado_por = 'Carlos e família', data_adocao = '2025-03-15' WHERE nome = 'Thor';

-- Memórias dos pets
INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Rex adora brincar de buscar a bolinha no quintal. Nunca se cansa!'
FROM pets WHERE nome = 'Rex';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Observamos que Rex tem medo de trovão e se esconde embaixo da cama durante tempestades.'
FROM pets WHERE nome = 'Rex';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Mia não gosta de barulho alto e se estressou durante uma festa na casa do voluntário.'
FROM pets WHERE nome = 'Mia';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Mia dorme muito durante o dia mas fica ativa à noite — comportamento típico de felinos.'
FROM pets WHERE nome = 'Mia';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Bolinha aprendeu a dar a patinha em apenas dois dias de treino com petisco!'
FROM pets WHERE nome = 'Bolinha';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Luna fica ansiosa quando fica sozinha por mais de 8 horas. Mia começa a miar muito.'
FROM pets WHERE nome = 'Luna';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Mel fugiu pelo portão aberto e demorou 2 horas para voltar. Atenção redobrada com cercas!'
FROM pets WHERE nome = 'Mel';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Mel se dá muito bem com crianças — foi testada com crianças de 3 e 7 anos sem nenhum problema.'
FROM pets WHERE nome = 'Mel';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Simba demorou 3 semanas para sair do esconderijo, mas agora pede colo toda manhã.'
FROM pets WHERE nome = 'Simba';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Duke tem histórico de trabalho como cão de guarda. Responde bem a comandos em voz firme.'
FROM pets WHERE nome = 'Duke';

INSERT INTO pet_memories (pet_id, tipo, conteudo)
SELECT id, 'texto', 'Duke não se dá bem com gatos — reagiu com agressividade quando encontrou um na rua.'
FROM pets WHERE nome = 'Duke';
