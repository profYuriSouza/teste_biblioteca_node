class UsuarioRepository {
    constructor() {
        if (new.target === UsuarioRepository) throw new Error("Classe abstrata.");
    }
    buscarPorId(id) { throw new Error("Implemente buscarPorId()."); }
    buscarPorEmail(email) { throw new Error("Implemente buscarPorEmail()."); }
    adicionar(usuario) { throw new Error("Implemente adicionar()."); }
    atualizar(usuario) { throw new Error("Implemente atualizar()."); }
    excluir(id) { throw new Error("Implemente excluir()."); }
}
module.exports = UsuarioRepository;
