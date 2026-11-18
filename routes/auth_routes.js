const express = require("express");

function criarRotasAuth(service) {
    const router = express.Router();
    router.post("/login", (req, res) => {
        // Em caso de sucesso, devolve o token e dados públicos do usuário.
        return res.json(service.login(req.body));
    });
    return router;
}
module.exports = criarRotasAuth;
