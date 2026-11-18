class LivroRepository {
    constructor() {
        if (new.target === LivroRepository) throw new Error("Classe abstrata.");
    }
    listar() { throw new Error("Implemente listar()."); }
    buscarPorId(id) { throw new Error("Implemente buscarPorId()."); }
    buscarPorIsbn(isbn) { throw new Error("Implemente buscarPorIsbn()."); }
    adicionar(livro, autoresIds) { throw new Error("Implemente adicionar()."); }
    atualizar(livro, autoresIds) { throw new Error("Implemente atualizar()."); }
    excluir(id) { throw new Error("Implemente excluir()."); }
}
module.exports = LivroRepository;
