const { verificarToken } = require("./config_jwt");

// O middleware executa antes de cada rota protegida.
function criarAutenticacao(usuarioRepository) {
    return function autenticar(req, res, next) {
        const cabecalho = req.get("Authorization") || "";
        const partes = cabecalho.split(" ");
        if (partes.length !== 2 || partes[0] !== "Bearer" || !partes[1]) {
            return res.status(401).json({ erro: "Informe um token Bearer válido." });
        }

        try {
            const dados = verificarToken(partes[1]);
            const id = Number(dados.sub);
            if (!Number.isSafeInteger(id) || id <= 0 || !usuarioRepository.buscarPorId(id)) {
                return res.status(401).json({ erro: "Usuário do token não encontrado." });
            }
            // As rotas usam este ID verificado, e não um ID enviado pelo navegador.
            req.usuarioId = id;
            return next();
        } catch (erro) {
            return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
        }
    };
}
module.exports = criarAutenticacao;
