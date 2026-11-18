// Um erro com o código HTTP ajuda a manter as regras no Service e a resposta na API.
class ErroAplicacao extends Error {
    constructor(mensagem, status = 400) {
        super(mensagem);
        this.status = status;
    }
}
module.exports = ErroAplicacao;
