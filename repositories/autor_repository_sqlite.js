const AutorRepository = require("./autor_repository");
const Autor = require("../models/autor");

class AutorRepositorySQLite extends AutorRepository {
    constructor(banco) {
        super();
        this.banco = banco;
    }

    // Converte uma linha devolvida pelo SQLite em um objeto do nosso modelo.
    paraModelo(linha) {
        return linha ? new Autor(linha.id, linha.nome, linha.email) : null;
    }

    listar() {
        const linhas = this.banco.prepare("SELECT * FROM autores ORDER BY nome").all();
        return linhas.map(linha => this.paraModelo(linha));
    }

    buscarPorId(id) {
        return this.paraModelo(this.banco.prepare("SELECT * FROM autores WHERE id = ?").get(id));
    }

    adicionar(autor) {
        // Os pontos de interrogação recebem valores sem montar SQL por concatenação.
        const resultado = this.banco.prepare("INSERT INTO autores (nome, email) VALUES (?, ?)")
            .run(autor.nome, autor.email);
        return this.buscarPorId(Number(resultado.lastInsertRowid));
    }

    atualizar(autor) {
        this.banco.prepare("UPDATE autores SET nome = ?, email = ? WHERE id = ?")
            .run(autor.nome, autor.email, autor.id);
        return this.buscarPorId(autor.id);
    }

    possuiLivros(id) {
        return !!this.banco.prepare("SELECT 1 FROM livros_autores WHERE autor_id = ? LIMIT 1").get(id);
    }

    excluir(id) {
        return this.banco.prepare("DELETE FROM autores WHERE id = ?").run(id).changes > 0;
    }
}
module.exports = AutorRepositorySQLite;
