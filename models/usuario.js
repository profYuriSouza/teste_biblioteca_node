class Usuario {
    constructor(id, nome, email, senhaHash) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
    }

    // O hash é necessário internamente para o login, mas não deve ir para o navegador.
    toDict() {
        return { id: this.id, nome: this.nome, email: this.email };
    }
}
module.exports = Usuario;
