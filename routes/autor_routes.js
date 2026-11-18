const express = require("express");
const validarId = require("./validar_id");

function criarRotasAutor(service, autenticar) {
    const router = express.Router();

    // Consultar autores é público.
    router.get("/", (req, res) => res.json(service.listar().map(item => item.toDict())));
    router.get("/:id", (req, res) => res.json(service.buscar(validarId(req.params.id)).toDict()));

    // A partir daqui, as rotas exigem um JWT válido.
    router.use(autenticar);
    router.post("/", (req, res) => {
        const item = service.criar(req.body);
        return res.status(201).json(item.toDict());
    });
    router.put("/:id", (req, res) => {
        const item = service.atualizar(validarId(req.params.id), req.body);
        return res.json(item.toDict());
    });
    router.delete("/:id", (req, res) => {
        service.excluir(validarId(req.params.id));
        return res.status(204).send();
    });
    return router;
}
module.exports = criarRotasAutor;
