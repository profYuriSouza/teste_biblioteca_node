const express = require("express");
const validarId = require("./validar_id");

function criarRotasEmprestimo(service, autenticar) {
    const router = express.Router();
    // Todos os endpoints deste arquivo exigem autenticação.
    router.use(autenticar);
    router.get("/", (req, res) => {
        return res.json(service.listar(req.usuarioId).map(item => item.toDict()));
    });
    router.post("/", (req, res) => {
        // O ID do usuário vem do JWT validado, nunca do corpo da requisição.
        const item = service.criar(req.usuarioId, req.body);
        return res.status(201).json(item.toDict());
    });
    router.patch("/:id/devolucao", (req, res) => {
        const item = service.devolver(req.usuarioId, validarId(req.params.id));
        return res.json(item.toDict());
    });
    return router;
}
module.exports = criarRotasEmprestimo;
