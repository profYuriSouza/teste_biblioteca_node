class Livro {
    constructor(id, titulo, ano, isbn, autores, disponivel) {
        this.id = id;
        this.titulo = titulo;
        this.ano = ano;
        this.isbn = isbn;
        this.autores = autores;
        this.disponivel = disponivel;
    }

    toDict() {
        return {
            id: this.id, titulo: this.titulo, ano: this.ano, isbn: this.isbn,
            autores: this.autores.map(autor => autor.toDict()),
            disponivel: this.disponivel
        };
    }
}
module.exports = Livro;
