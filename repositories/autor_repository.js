// JavaScript não tem classes abstratas nativas. Aqui simulamos um contrato:
// não instanciamos esta classe; o repository SQLite implementa seus métodos.
class AutorRepository {
    constructor() {
        if (new.target === AutorRepository) throw new Error("Classe abstrata.");
    }
    listar() { throw new Error("Implemente listar()."); }
    buscarPorId(id) { throw new Error("Implemente buscarPorId()."); }
    adicionar(autor) { throw new Error("Implemente adicionar()."); }
    atualizar(autor) { throw new Error("Implemente atualizar()."); }
    possuiLivros(id) { throw new Error("Implemente possuiLivros()."); }
    excluir(id) { throw new Error("Implemente excluir()."); }
}
module.exports = AutorRepository;
