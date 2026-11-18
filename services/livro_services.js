const Livro = require("../models/livro");
const ErroAplicacao = require("./erro_aplicacao");
const { validarObjeto } = require("./validacao");

class LivroService {
    constructor(repository, autorRepository, emprestimoRepository) {
        this.repository = repository;
        this.autores = autorRepository;
        this.emprestimos = emprestimoRepository;
    }

    listar() { return this.repository.listar(); }
    buscar(id) {
        const livro = this.repository.buscarPorId(id);
        if (!livro) throw new ErroAplicacao("Livro não encontrado.", 404);
        return livro;
    }
    validar(dados, idAtual = null) {
        validarObjeto(dados);
        if (typeof dados.titulo !== "string" || !dados.titulo.trim()) {
            throw new ErroAplicacao("Informe o título do livro.");
        }
        if (!Number.isInteger(dados.ano) || dados.ano < 1000 || dados.ano > 9999) {
            throw new ErroAplicacao("Informe um ano com quatro dígitos.");
        }
        // ISBN é texto: não é uma quantidade e pode começar com zero.
        if (typeof dados.isbn !== "string" || !/^(\d{10}|\d{13})$/.test(dados.isbn)) {
            throw new ErroAplicacao("Informe um ISBN com 10 ou 13 dígitos, sem separadores.");
        }
        const outro = this.repository.buscarPorIsbn(dados.isbn);
        if (outro && outro.id !== idAtual) throw new ErroAplicacao("ISBN já cadastrado.", 409);
        if (!Array.isArray(dados.autores_ids) || dados.autores_ids.length === 0) {
            throw new ErroAplicacao("Escolha pelo menos um autor.");
        }
        if (new Set(dados.autores_ids).size !== dados.autores_ids.length) {
            throw new ErroAplicacao("Não repita autores no mesmo livro.");
        }
        for (const id of dados.autores_ids) {
            if (!Number.isSafeInteger(id) || id <= 0 || !this.autores.buscarPorId(id)) {
                throw new ErroAplicacao("Um dos autores informados não existe.");
            }
        }
    }
    criar(dados) {
        this.validar(dados);
        const livro = new Livro(null, dados.titulo.trim(), dados.ano, dados.isbn, [], true);
        return this.repository.adicionar(livro, dados.autores_ids);
    }
    atualizar(id, dados) {
        this.buscar(id);
        this.validar(dados, id);
        const livro = new Livro(id, dados.titulo.trim(), dados.ano, dados.isbn, [], true);
        return this.repository.atualizar(livro, dados.autores_ids);
    }
    excluir(id) {
        this.buscar(id);
        if (this.emprestimos.possuiHistoricoLivro(id)) {
            throw new ErroAplicacao("Este livro possui histórico de empréstimos e não pode ser excluído.", 409);
        }
        this.repository.excluir(id);
    }
}
module.exports = LivroService;
