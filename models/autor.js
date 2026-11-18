class Autor {
    constructor(id, nome, email) {
        this.id = id;
        this.nome = nome;
        this.email = email;
    }

    toDict() {
        return { id: this.id, nome: this.nome, email: this.email };
    }
}
module.exports = Autor;
