async function buscarPet() {

    const tipoPet =
        document.getElementById('tipoPet').value;

    const ambienteTelado =
        document.getElementById('telado').checked ? 1 : 0;

    const resultado =
        document.getElementById('resultado');

    resultado.innerHTML = "";

    if (
        tipoPet === "gato" &&
        ambienteTelado === 0
    ) {

        resultado.innerHTML = `

            <div class="erro">

                Para adoção de gatos é necessário
                ambiente telado.

            </div>

        `;

        return;

    }

    const dados = {

        nome:
            document.getElementById('nome').value,

        tipo_casa:
            document.getElementById('tipoCasa').value,

        ambiente_telado:
            ambienteTelado,

        tem_criancas:
            document.getElementById('criancas').checked ? 1 : 0,

        tipo_pet:
            tipoPet

    };

    try {

        const resposta = await fetch('/adotantes', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(dados)

        });

        const pets = await resposta.json();

        resultado.innerHTML = `
            <h2 class="titulo">
                Pets Recomendados 🐾
            </h2>
        `;

        pets.forEach(pet => {

            resultado.innerHTML += `

                <div class="pet">

                    <h3>${pet.nome}</h3>

                    <p>
                        Espécie:
                        ${pet.especie}
                    </p>

                    <p>
                        Porte:
                        ${pet.porte}
                    </p>

                    <p>
                        Sociável:
                        ${pet.sociavel ? 'Sim' : 'Não'}
                    </p>

                    <p>
                        Compatibilidade:
                        ${pet.score} pontos
                    </p>

                </div>

            `;

        });

    } catch (erro) {

        resultado.innerHTML = `

            <div class="erro">

                Erro ao buscar pets.

            </div>

        `;

    }

}