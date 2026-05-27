async function cadastrarPet() {
    const especie = document.getElementById('especie').value;

    const dados = {
        nome: document.getElementById('nome').value || "",
        especie: especie,
        raca: document.getElementById('raca').value || "",
        idade_anos: Number(document.getElementById('idadeAnos').value) || 0,
        idade_meses: Number(document.getElementById('idadeMeses').value) || 0,
        porte: document.getElementById('porte').value,
        pelagem: document.getElementById('pelagem').value || "",
        olhos: document.getElementById('olhos').value || "",
        sociavel: document.getElementById('sociavel').checked ? 1 : 0,
        racao: document.getElementById('racao').checked ? 1 : 0,
        caixa_areia: especie === "gato" ? (document.getElementById('caixaAreia').checked ? 1 : 0) : 0
    };

    const mensagem = document.getElementById('mensagem');
    mensagem.innerHTML = "Enviando...";

    try {
        const resposta = await fetch('/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            mensagem.innerHTML = `
                <div class="sucesso" style="color: green; font-weight: bold; margin-top: 20px;">
                    ✅ Pet cadastrado com sucesso!
                </div>
            `;
        } else {
            // Aqui ele vai mostrar a mensagem real que o servidor mandou
            mensagem.innerHTML = `
                <div class="erro">
                    ❌ Erro do Servidor: ${resultado.erro || 'Erro desconhecido'}
                </div>
            `;
        }
    } catch (erro) {
        // Se a requisição sequer conseguiu chegar no servidor
        console.error("Erro na requisição:", erro);
        mensagem.innerHTML = `
            <div class="erro">
                ❌ Erro de rede ou conexão recusada.
            </div>
        `;
    }
}