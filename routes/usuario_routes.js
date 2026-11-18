const express = require("express");

function criarRotasUsuario(service, autenticar) {
    const router = express.Router();

    // Cadastro público: o Service gera o hash antes de salvar.
    router.post("/", (req, res) => {
        const usuario = service.criar(req.body);
        return res.status(201).json(usuario.toDict());
    });

    // Cada pessoa consulta e altera somente a própria conta.
    router.use(autenticar);
    router.get("/eu", (req, res) => res.json(service.buscar(req.usuarioId).toDict()));
    router.put("/eu", (req, res) => res.json(service.atualizar(req.usuarioId, req.body).toDict()));
    router.delete("/eu", (req, res) => {
        service.excluir(req.usuarioId);
        return res.status(204).send();
    });
    return router;
}
module.exports = criarRotasUsuario;
