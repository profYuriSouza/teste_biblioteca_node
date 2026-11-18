const Autor = require("../models/autor");
const ErroAplicacao = require("./erro_aplicacao");
const { validarObjeto, validarNome, validarEmail } = require("./validacao");

class AutorService {
    constructor(repository) { this.repository = repository; }

    listar() { return this.repository.listar(); }
    buscar(id) {
        const autor = this.repository.buscarPorId(id);
        if (!autor) throw new ErroAplicacao("Autor não encontrado.", 404);
        return autor;
    }
    criar(dados) {
        validarObjeto(dados);
        validarNome(dados.nome);
        validarEmail(dados.email);
        return this.repository.adicionar(new Autor(null, dados.nome.trim(), dados.email.trim()));
    }
    atualizar(id, dados) {
        this.buscar(id);
        validarObjeto(dados);
        validarNome(dados.nome);
        validarEmail(dados.email);
        return this.repository.atualizar(new Autor(id, dados.nome.trim(), dados.email.trim()));
    }
    excluir(id) {
        this.buscar(id);
        if (this.repository.possuiLivros(id)) {
            throw new ErroAplicacao("Este autor está associado a um livro. Edite o livro primeiro.", 409);
        }
        this.repository.excluir(id);
    }
}
module.exports = AutorService;
