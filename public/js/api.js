// Este arquivo roda no NAVEGADOR, não no Node.js.
// O token fica no navegador para ser enviado nas próximas requisições.
const CHAVE_TOKEN = "biblioteca_token";

function obterToken() { return localStorage.getItem(CHAVE_TOKEN); }
function salvarToken(token) { localStorage.setItem(CHAVE_TOKEN, token); }
function removerToken() { localStorage.removeItem(CHAVE_TOKEN); }

async function requisicao(url, metodo = "GET", dados = null) {
    const opcoes = { method: metodo, headers: {} };
    if (dados !== null) {
        opcoes.headers["Content-Type"] = "application/json";
        // Um objeto JavaScript é convertido em texto JSON para viajar no HTTP.
        opcoes.body = JSON.stringify(dados);
    }
    const token = obterToken();
    if (token) opcoes.headers.Authorization = "Bearer " + token;

    // fetch faz a requisição para o mesmo servidor que entregou o HTML.
    const resposta = await fetch(url, opcoes);
    if (resposta.status === 204) return null; // DELETE sem corpo
    const conteudo = await resposta.json();
    if (!resposta.ok) {
        if (resposta.status === 401 && token && url !== "/api/auth/login") {
            removerToken();
            window.dispatchEvent(new Event("sessao-expirada"));
        }
        throw new Error(conteudo.erro || "Não foi possível concluir a operação.");
    }
    return conteudo; // JSON da resposta já convertido em objeto/array JavaScript
}
