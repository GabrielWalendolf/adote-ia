async function carregarPets() {

    const resposta = await fetch('/pets');

    const pets = await resposta.json();

    const lista = document.getElementById('listaPets');

    pets.forEach(pet => {

        lista.innerHTML += `

            <div class="pet">

                <h3>${pet.nome}</h3>

                <p>
                    Espécie: ${pet.especie}
                </p>

                <p>
                    Porte: ${pet.porte}
                </p>

                <p>
                    Sociável:
                    ${pet.sociavel ? 'Sim' : 'Não'}
                </p>

            </div>

        `;

    });

}

carregarPets();