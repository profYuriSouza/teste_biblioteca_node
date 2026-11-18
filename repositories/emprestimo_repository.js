class EmprestimoRepository {
    constructor() {
        if (new.target === EmprestimoRepository) throw new Error("Classe abstrata.");
    }
    listarPorUsuario(usuarioId) { throw new Error("Implemente listarPorUsuario()."); }
    buscarPorId(id) { throw new Error("Implemente buscarPorId()."); }
    ativoPorLivro(livroId) { throw new Error("Implemente ativoPorLivro()."); }
    possuiHistoricoLivro(livroId) { throw new Error("Implemente possuiHistoricoLivro()."); }
    possuiHistoricoUsuario(usuarioId) { throw new Error("Implemente possuiHistoricoUsuario()."); }
    adicionar(usuarioId, livroId, data) { throw new Error("Implemente adicionar()."); }
    devolver(id, data) { throw new Error("Implemente devolver()."); }
}
module.exports = EmprestimoRepository;
