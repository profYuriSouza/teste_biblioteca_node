// Estado da interface. Os dados permanentes estão no SQLite, no servidor.
let livros = [];
let autores = [];
let usuarioAtual = null;

const porId = id => document.getElementById(id);

function mostrarMensagem(texto, erro = false) {
    const caixa = porId("mensagem");
    caixa.textContent = texto;
    caixa.classList.toggle("erro", erro);
    caixa.hidden = false;
    caixa.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function esconderMensagem() { porId("mensagem").hidden = true; }

// Criar elementos com textContent evita interpretar dados cadastrados como HTML.
function elemento(tag, classe, texto) {
    const item = document.createElement(tag);
    if (classe) item.className = classe;
    if (texto !== undefined) item.textContent = texto;
    return item;
}

function botaoAcao(texto, funcao, classe = "acao-texto") {
    const botao = elemento("button", classe, texto);
    botao.type = "button";
    botao.addEventListener("click", funcao);
    return botao;
}

// Centraliza a apresentação de erros vindos do servidor ou da rede.
async function executar(acao) {
    try {
        esconderMensagem();
        await acao();
    } catch (erro) {
        mostrarMensagem(erro.message || "Não foi possível conectar ao servidor.", true);
    }
}

function atualizarSessao() {
    document.querySelectorAll(".somente-logado").forEach(item => item.hidden = !usuarioAtual);
    document.querySelectorAll(".somente-deslogado").forEach(item => item.hidden = !!usuarioAtual);
    porId("nome-usuario").textContent = usuarioAtual ? "Olá, " + usuarioAtual.nome.split(" ")[0] : "";
    if (usuarioAtual) {
        porId("conta-nome").value = usuarioAtual.nome;
        porId("conta-email").value = usuarioAtual.email;
    }
    desenharLivros();
    desenharAutores();
}

async function mostrarPagina(nome) {
    const protegidas = ["emprestimos", "conta"];
    if (protegidas.includes(nome) && !usuarioAtual) {
        nome = "login";
        mostrarMensagem("Entre na sua conta para acessar esta área.");
    }
    document.querySelectorAll(".pagina").forEach(pagina => pagina.hidden = pagina.id !== "pagina-" + nome);
    document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("ativo", link.dataset.pagina === nome));
    if (nome === "emprestimos" && usuarioAtual) await carregarEmprestimos();
}

document.querySelectorAll("[data-pagina]").forEach(botao => {
    botao.addEventListener("click", evento => {
        evento.preventDefault();
        executar(() => mostrarPagina(botao.dataset.pagina));
    });
});

async function carregarCatalogo() {
    // Estas duas leituras são públicas; as respostas vêm como JSON.
    livros = await requisicao("/api/livros");
    autores = await requisicao("/api/autores");
    desenharLivros();
    desenharAutores();
}

function desenharLivros() {
    const lista = porId("lista-livros");
    lista.replaceChildren();
    const busca = porId("busca-livro").value.trim().toLowerCase();
    const encontrados = livros.filter(livro => {
        const nomes = livro.autores.map(autor => autor.nome).join(" ");
        return (livro.titulo + " " + nomes).toLowerCase().includes(busca);
    });
    porId("contagem-livros").textContent = encontrados.length + (encontrados.length === 1 ? " livro" : " livros");
    if (encontrados.length === 0) {
        lista.append(elemento("div", "vazio", "Nenhum livro encontrado."));
        return;
    }
    encontrados.forEach(livro => {
        const cartao = elemento("article", "cartao");
        const capa = elemento("div", "capa");
        capa.append(elemento("span", "", "✳"), elemento("small", "", "ACERVO / " + livro.ano));
        cartao.append(capa, elemento("h3", "", livro.titulo));
        cartao.append(elemento("p", "autor-livro", livro.autores.map(autor => autor.nome).join(", ")));
        cartao.append(elemento("p", "detalhe", "ISBN " + livro.isbn));
        const rodape = elemento("div", "cartao-rodape");
        rodape.append(elemento("span", livro.disponivel ? "selo" : "selo ocupado",
            livro.disponivel ? "● Disponível" : "● Emprestado"));
        const acoes = elemento("div", "acoes-item");
        if (livro.disponivel) {
            const texto = usuarioAtual ? "Emprestar →" : "Entre para emprestar →";
            acoes.append(botaoAcao(texto, () => executar(async () => {
                if (!usuarioAtual) return mostrarPagina("login");
                await requisicao("/api/emprestimos", "POST", { livro_id: livro.id });
                await carregarCatalogo();
                mostrarMensagem("Empréstimo realizado. Consulte seus empréstimos para devolver o livro.");
            })));
        }
        if (usuarioAtual) {
            acoes.append(botaoAcao("Editar", () => abrirLivro(livro)));
            acoes.append(botaoAcao("Excluir", () => executar(async () => {
                if (!confirm("Excluir o livro “" + livro.titulo + "”?")) return;
                await requisicao("/api/livros/" + livro.id, "DELETE");
                await carregarCatalogo();
                mostrarMensagem("Livro excluído.");
            }), "acao-texto perigo"));
        }
        rodape.append(acoes);
        cartao.append(rodape);
        lista.append(cartao);
    });
}

function desenharAutores() {
    const lista = porId("lista-autores");
    lista.replaceChildren();
    if (autores.length === 0) {
        lista.append(elemento("div", "vazio", "Nenhum autor cadastrado."));
        return;
    }
    autores.forEach(autor => {
        const linha = elemento("article", "linha");
        const dados = elemento("div");
        dados.append(elemento("h3", "", autor.nome), elemento("p", "", autor.email));
        const acoes = elemento("div", "acoes-item");
        if (usuarioAtual) {
            acoes.append(botaoAcao("Editar", () => abrirAutor(autor)));
            acoes.append(botaoAcao("Excluir", () => executar(async () => {
                if (!confirm("Excluir o autor “" + autor.nome + "”?")) return;
                await requisicao("/api/autores/" + autor.id, "DELETE");
                await carregarCatalogo();
                mostrarMensagem("Autor excluído.");
            }), "acao-texto perigo"));
        }
        linha.append(dados, acoes);
        lista.append(linha);
    });
}

function preencherAutoresSelecionaveis(idsSelecionados = []) {
    const lista = porId("livro-autores");
    lista.replaceChildren();
    if (!autores.length) {
        lista.append(elemento("span", "dica", "Cadastre pelo menos um autor na página Autores."));
        return;
    }
    autores.forEach(autor => {
        const rotulo = elemento("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = autor.id;
        checkbox.checked = idsSelecionados.includes(autor.id);
        rotulo.append(checkbox, document.createTextNode(autor.nome));
        lista.append(rotulo);
    });
}

function abrirLivro(livro = null) {
    porId("form-livro").reset();
    porId("livro-id").value = livro ? livro.id : "";
    porId("livro-titulo").value = livro ? livro.titulo : "";
    porId("livro-ano").value = livro ? livro.ano : "";
    porId("livro-isbn").value = livro ? livro.isbn : "";
    porId("titulo-form-livro").textContent = livro ? "Editar livro" : "Novo livro";
    preencherAutoresSelecionaveis(livro ? livro.autores.map(autor => autor.id) : []);
    porId("form-livro").hidden = false;
    porId("form-livro").scrollIntoView({ behavior: "smooth", block: "start" });
}
porId("abrir-form-livro").addEventListener("click", () => abrirLivro());
porId("cancelar-livro").addEventListener("click", () => porId("form-livro").hidden = true);
porId("busca-livro").addEventListener("input", desenharLivros);

porId("form-livro").addEventListener("submit", evento => {
    evento.preventDefault(); // impede o envio tradicional e o recarregamento da página
    executar(async () => {
        const id = porId("livro-id").value;
        const selecionados = document.querySelectorAll("#livro-autores input:checked");
        const dados = {
            titulo: porId("livro-titulo").value,
            ano: Number(porId("livro-ano").value),
            isbn: porId("livro-isbn").value.trim(),
            autores_ids: Array.from(selecionados, item => Number(item.value))
        };
        if (id) await requisicao("/api/livros/" + id, "PUT", dados);
        else await requisicao("/api/livros", "POST", dados);
        porId("form-livro").hidden = true;
        await carregarCatalogo();
        mostrarMensagem(id ? "Livro atualizado." : "Livro cadastrado.");
    });
});

function abrirAutor(autor = null) {
    porId("form-autor").reset();
    porId("autor-id").value = autor ? autor.id : "";
    porId("autor-nome").value = autor ? autor.nome : "";
    porId("autor-email").value = autor ? autor.email : "";
    porId("titulo-form-autor").textContent = autor ? "Editar autor" : "Novo autor";
    porId("form-autor").hidden = false;
    porId("form-autor").scrollIntoView({ behavior: "smooth", block: "start" });
}
porId("abrir-form-autor").addEventListener("click", () => abrirAutor());
porId("cancelar-autor").addEventListener("click", () => porId("form-autor").hidden = true);
porId("form-autor").addEventListener("submit", evento => {
    evento.preventDefault();
    executar(async () => {
        const id = porId("autor-id").value;
        const dados = { nome: porId("autor-nome").value, email: porId("autor-email").value };
        if (id) await requisicao("/api/autores/" + id, "PUT", dados);
        else await requisicao("/api/autores", "POST", dados);
        porId("form-autor").hidden = true;
        await carregarCatalogo();
        mostrarMensagem(id ? "Autor atualizado." : "Autor cadastrado.");
    });
});

async function carregarEmprestimos() {
    const dados = await requisicao("/api/emprestimos");
    const lista = porId("lista-emprestimos");
    lista.replaceChildren();
    if (!dados.length) {
        lista.append(elemento("div", "vazio", "Você ainda não possui empréstimos."));
        return;
    }
    dados.forEach(item => {
        const linha = elemento("article", "linha");
        const info = elemento("div");
        const data = item.data_emprestimo.split("-").reverse().join("/");
        let texto = "Emprestado em " + data;
        if (item.data_devolucao) texto += " · Devolvido em " + item.data_devolucao.split("-").reverse().join("/");
        info.append(elemento("h3", "", item.titulo), elemento("p", "", texto));
        const acoes = elemento("div", "acoes-item");
        acoes.append(elemento("span", item.data_devolucao ? "selo" : "selo ocupado",
            item.data_devolucao ? "Devolvido" : "Em andamento"));
        if (!item.data_devolucao) {
            acoes.append(botaoAcao("Registrar devolução", () => executar(async () => {
                await requisicao("/api/emprestimos/" + item.id + "/devolucao", "PATCH");
                await carregarEmprestimos();
                await carregarCatalogo();
                mostrarMensagem("Devolução registrada.");
            })));
        }
        linha.append(info, acoes);
        lista.append(linha);
    });
}

porId("form-cadastro").addEventListener("submit", evento => {
    evento.preventDefault();
    executar(async () => {
        const dados = { nome: porId("cadastro-nome").value, email: porId("cadastro-email").value,
            senha: porId("cadastro-senha").value };
        await requisicao("/api/usuarios", "POST", dados);
        porId("form-cadastro").reset();
        porId("login-email").value = dados.email;
        await mostrarPagina("login");
        mostrarMensagem("Conta criada. Agora entre com seu e-mail e sua senha.");
    });
});

porId("form-login").addEventListener("submit", evento => {
    evento.preventDefault();
    executar(async () => {
        const dados = { email: porId("login-email").value, senha: porId("login-senha").value };
        const resposta = await requisicao("/api/auth/login", "POST", dados);
        // O servidor entrega um JWT somente depois de verificar o hash da senha.
        salvarToken(resposta.token);
        usuarioAtual = resposta.usuario;
        porId("form-login").reset();
        atualizarSessao();
        await mostrarPagina("catalogo");
        mostrarMensagem("Login realizado. Bem-vindo, " + usuarioAtual.nome + "!");
    });
});

function encerrarSessao() {
    removerToken();
    usuarioAtual = null;
    porId("form-livro").hidden = true;
    porId("form-autor").hidden = true;
    porId("form-conta").reset();
    atualizarSessao();
}
porId("sair").addEventListener("click", () => executar(async () => {
    encerrarSessao();
    await mostrarPagina("catalogo");
    mostrarMensagem("Você saiu da conta.");
}));
window.addEventListener("sessao-expirada", () => {
    encerrarSessao();
    mostrarPagina("login");
});

porId("form-conta").addEventListener("submit", evento => {
    evento.preventDefault();
    executar(async () => {
        const dados = { nome: porId("conta-nome").value, email: porId("conta-email").value,
            senha: porId("conta-senha").value };
        usuarioAtual = await requisicao("/api/usuarios/eu", "PUT", dados);
        porId("conta-senha").value = "";
        atualizarSessao();
        mostrarMensagem("Conta atualizada.");
    });
});
porId("excluir-conta").addEventListener("click", () => executar(async () => {
    if (!confirm("Excluir sua conta? Contas com histórico de empréstimos não podem ser excluídas.")) return;
    await requisicao("/api/usuarios/eu", "DELETE");
    encerrarSessao();
    await mostrarPagina("catalogo");
    mostrarMensagem("Conta excluída.");
}));

// Ao abrir ou atualizar a página, tentamos recuperar a sessão e carregamos o catálogo.
executar(async () => {
    if (obterToken()) {
        try {
            usuarioAtual = await requisicao("/api/usuarios/eu");
        } catch (erro) {
            // Se o token expirou, a API já limpou a sessão. Mesmo assim,
            // continuamos carregando o catálogo público para o visitante.
            if (obterToken()) throw erro;
            mostrarMensagem("Sua sessão expirou. Faça login novamente.", true);
        }
    }
    atualizarSessao();
    await carregarCatalogo();
});
