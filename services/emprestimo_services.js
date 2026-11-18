const ErroAplicacao = require("./erro_aplicacao");
const { validarObjeto } = require("./validacao");

class EmprestimoService {
    constructor(repository, livroRepository) {
        this.repository = repository;
        this.livros = livroRepository;
    }
    listar(usuarioId) { return this.repository.listarPorUsuario(usuarioId); }
    criar(usuarioId, dados) {
        validarObjeto(dados);
        if (!Number.isSafeInteger(dados.livro_id) || dados.livro_id <= 0) {
            throw new ErroAplicacao("Informe um livro_id inteiro e positivo.");
        }
        if (!this.livros.buscarPorId(dados.livro_id)) {
            throw new ErroAplicacao("Livro não encontrado.", 404);
        }
        if (this.repository.ativoPorLivro(dados.livro_id)) {
            throw new ErroAplicacao("Este livro já está emprestado.", 409);
        }
        const hoje = new Date().toLocaleDateString("sv-SE"); // formato AAAA-MM-DD local
        return this.repository.adicionar(usuarioId, dados.livro_id, hoje);
    }
    devolver(usuarioId, emprestimoId) {
        const item = this.repository.buscarPorId(emprestimoId);
        // A resposta não revela empréstimos pertencentes a outro usuário.
        if (!item || item.usuario_id !== usuarioId) {
            throw new ErroAplicacao("Empréstimo não encontrado.", 404);
        }
        if (item.data_devolucao) throw new ErroAplicacao("Este empréstimo já foi devolvido.", 409);
        const hoje = new Date().toLocaleDateString("sv-SE");
        return this.repository.devolver(emprestimoId, hoje);
    }
}
module.exports = EmprestimoService;
