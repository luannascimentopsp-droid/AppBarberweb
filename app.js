document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // FUNÇÕES GERAIS
    // =====================================================

    function lerLocalStorage(chave, padrao) {

        try {

            const dados =
                localStorage.getItem(chave);

            if (!dados) {
                return padrao;
            }

            return JSON.parse(dados);

        } catch (erro) {

            console.error(
                "Erro ao ler " + chave + ":",
                erro
            );

            return padrao;
        }
    }

    function salvarLocalStorage(chave, dados) {

        localStorage.setItem(
            chave,
            JSON.stringify(dados)
        );
    }

    function formatarMoeda(valor) {

        return Number(valor || 0)
            .toFixed(2)
            .replace(".", ",");
    }

    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // =====================================================
    // ELEMENTOS PRINCIPAIS
    // =====================================================

    const telaLogin =
        document.getElementById("telaLogin");

    const appPrincipal =
        document.getElementById("appPrincipal");

    const app =
        document.getElementById("app");

    const loginTipo =
        document.getElementById("loginTipo");

    const loginCampoBarbeiro =
        document.getElementById("loginCampoBarbeiro");

    const loginBarbeiro =
        document.getElementById("loginBarbeiro");

    const loginSenha =
        document.getElementById("loginSenha");

    const loginErro =
        document.getElementById("loginErro");

    const btnEntrar =
        document.getElementById("btnEntrar");


    // =====================================================
    // BARBEIROS
    // =====================================================

    function migrarBarbeiros() {

        let barbeiros =
            lerLocalStorage(
                "barbeiros",
                []
            );

        barbeiros =
            barbeiros.map(function (barbeiro) {

                if (
                    typeof barbeiro ===
                    "string"
                ) {

                    return {
                        nome: barbeiro,
                        senha: "1234"
                    };
                }

                return barbeiro;
            });

        salvarLocalStorage(
            "barbeiros",
            barbeiros
        );
    }

    migrarBarbeiros();

    if (
        !localStorage.getItem(
            "senhaAdmin"
        )
    ) {

        localStorage.setItem(
            "senhaAdmin",
            "admin123"
        );
    }


    function preencherBarbeirosLogin() {

        if (!loginBarbeiro) {
            return;
        }

        const barbeiros =
            lerLocalStorage(
                "barbeiros",
                []
            );

        loginBarbeiro.innerHTML = `
            <option value="">
                Selecione o barbeiro
            </option>
        `;

        barbeiros.forEach(
            function (barbeiro) {

                if (
                    !barbeiro ||
                    !barbeiro.nome
                ) {
                    return;
                }

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    barbeiro.nome;

                option.textContent =
                    barbeiro.nome;

                loginBarbeiro.appendChild(
                    option
                );
            }
        );
    }

    preencherBarbeirosLogin();


    // =====================================================
    // LOGIN
    // =====================================================

    if (loginTipo) {

        loginTipo.onchange =
            function () {

                if (loginCampoBarbeiro) {

                    loginCampoBarbeiro.style.display =
                        this.value === "barbeiro"
                            ? "block"
                            : "none";
                }

                if (loginErro) {
                    loginErro.textContent = "";
                }
            };
    }


    if (btnEntrar) {

        btnEntrar.onclick =
            function () {

                const tipo =
                    loginTipo
                        ? loginTipo.value
                        : "";

                const senhaDigitada =
                    loginSenha
                        ? loginSenha.value
                        : "";

                if (loginErro) {
                    loginErro.textContent = "";
                }


                // -----------------------------
                // DONO
                // -----------------------------

                if (tipo === "dono") {

                    const senhaSalva =
                        localStorage.getItem(
                            "senhaAdmin"
                        );

                    if (
                        senhaDigitada !==
                        senhaSalva
                    ) {

                        if (loginErro) {

                            loginErro.textContent =
                                "Senha incorreta.";
                        }

                        return;
                    }

                    salvarLocalStorage(
                        "sessao",
                        {
                            tipo: "dono",
                            nome: "Dono"
                        }
                    );
                }


                // -----------------------------
                // BARBEIRO
                // -----------------------------

                else {

                    const nome =
                        loginBarbeiro
                            ? loginBarbeiro.value
                            : "";

                    if (!nome) {

                        if (loginErro) {

                            loginErro.textContent =
                                "Selecione um barbeiro.";
                        }

                        return;
                    }

                    const barbeiros =
                        lerLocalStorage(
                            "barbeiros",
                            []
                        );

                    const barbeiro =
                        barbeiros.find(
                            function (item) {

                                return (
                                    item.nome ===
                                    nome
                                );
                            }
                        );

                    if (
                        !barbeiro ||
                        barbeiro.senha !==
                        senhaDigitada
                    ) {

                        if (loginErro) {

                            loginErro.textContent =
                                "Senha incorreta.";
                        }

                        return;
                    }

                    salvarLocalStorage(
                        "sessao",
                        {
                            tipo: "barbeiro",
                            nome: nome
                        }
                    );
                }

                entrarNoApp();
            };
    }


    // =====================================================
    // SESSÃO
    // =====================================================

    function entrarNoApp() {

        if (telaLogin) {
            telaLogin.style.display = "none";
        }

        if (appPrincipal) {
            appPrincipal.style.display = "block";
        }

        aplicarPermissoes();

        mostrarHome();
    }


    function sairDoApp() {

        localStorage.removeItem(
            "sessao"
        );

        localStorage.removeItem(
            "filtroBarbeiro"
        );

        location.reload();
    }


    function aplicarPermissoes() {

        const sessao =
            lerLocalStorage(
                "sessao",
                {}
            );

        const btnBarbeiros =
            document.getElementById(
                "btnBarbeiros"
            );

        const menuBarbeiros =
            document.getElementById(
                "menuBarbeiros"
            );

        const esconder =
            sessao.tipo === "barbeiro"
                ? "none"
                : "";

        if (btnBarbeiros) {

            btnBarbeiros.style.display =
                esconder;
        }

        if (menuBarbeiros) {

            menuBarbeiros.style.display =
                esconder;
        }
    }


    function obterSessao() {

        return lerLocalStorage(
            "sessao",
            {}
        );
    }


    function getFiltroBarbeiro() {

        const sessao =
            obterSessao();

        if (
            sessao.tipo ===
            "barbeiro"
        ) {

            return sessao.nome;
        }

        return (
            localStorage.getItem(
                "filtroBarbeiro"
            ) || ""
        );
    }


    // =====================================================
    // METAS
    // =====================================================

    function obterChavePeriodo(
        tipo,
        dataBase
    ) {

        const data =
            dataBase
                ? new Date(
                    dataBase +
                    "T12:00:00"
                )
                : new Date();

        const ano =
            data.getFullYear();

        const mes =
            String(
                data.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                data.getDate()
            ).padStart(2, "0");


        // META DIÁRIA

        if (
            tipo === "diaria"
        ) {

            return (
                ano +
                "-" +
                mes +
                "-" +
                dia
            );
        }


        // META SEMANAL
        // Segunda até domingo

        if (
            tipo === "semanal"
        ) {

            const diaSemana =
                data.getDay();

            const diferenca =
                diaSemana === 0
                    ? -6
                    : 1 - diaSemana;

            const inicio =
                new Date(data);

            inicio.setDate(
                data.getDate() +
                diferenca
            );

            const anoInicio =
                inicio.getFullYear();

            const mesInicio =
                String(
                    inicio.getMonth() + 1
                ).padStart(2, "0");

            const diaInicio =
                String(
                    inicio.getDate()
                ).padStart(2, "0");

            return (
                anoInicio +
                "-" +
                mesInicio +
                "-" +
                diaInicio
            );
        }


        // META MENSAL

        if (
            tipo === "mensal"
        ) {

            return (
                ano +
                "-" +
                mes
            );
        }

        return "";
    }


    function obterNomeUsuarioMeta() {

        const sessao =
            obterSessao();

        if (
            !sessao ||
            !sessao.tipo
        ) {

            return "";
        }

        if (
            sessao.tipo ===
            "barbeiro"
        ) {

            return sessao.nome;
        }

        return "Dono";
    }


    function obterMetas() {

        return lerLocalStorage(
            "metas",
            {}
        );
    }


    function salvarMetas(metas) {

        salvarLocalStorage(
            "metas",
            metas
        );
    }


    function obterMetaUsuario(
        tipo,
        usuario,
        dataBase
    ) {

        const metas =
            obterMetas();

        if (
            !metas[usuario]
        ) {

            return null;
        }

        const chave =
            obterChavePeriodo(
                tipo,
                dataBase
            );

        if (
            !metas[usuario][tipo] ||
            !metas[usuario][tipo][chave]
        ) {

            return null;
        }

        return metas[usuario][tipo][chave];
    }


    function salvarMetaUsuario(
        tipo,
        usuario,
        valor,
        dataBase
    ) {

        if (!usuario) {
            return false;
        }

        const valorNumerico =
            Number(valor);

        if (
            !Number.isFinite(
                valorNumerico
            ) ||
            valorNumerico <= 0
        ) {

            return false;
        }

        const metas =
            obterMetas();

        if (
            !metas[usuario]
        ) {

            metas[usuario] = {};
        }

        if (
            !metas[usuario][tipo]
        ) {

            metas[usuario][tipo] = {};
        }

        const chave =
            obterChavePeriodo(
                tipo,
                dataBase
            );

        // Cada perfil pode definir a meta uma vez por período.
        // Uma nova diária/semanal/mensal fica disponível quando o período virar.
        if (metas[usuario][tipo][chave]) {
            return false;
        }

        metas[usuario][tipo][chave] = {

            valor:
                valorNumerico,

            criadaEm:
                new Date().toISOString(),

            alteradaPeloDono:
                false
        };

        salvarMetas(metas);

        return true;
    }


    function alterarMetaPeloDono(
        tipo,
        barbeiro,
        valor,
        dataBase
    ) {

        if (!barbeiro) {
            return false;
        }

        const valorNumerico =
            Number(valor);

        if (
            !Number.isFinite(
                valorNumerico
            ) ||
            valorNumerico <= 0
        ) {

            return false;
        }

        const metas =
            obterMetas();

        if (
            !metas[barbeiro]
        ) {

            metas[barbeiro] = {};
        }

        if (
            !metas[barbeiro][tipo]
        ) {

            metas[barbeiro][tipo] = {};
        }

        const chave =
            obterChavePeriodo(
                tipo,
                dataBase
            );

        const metaAnterior =
            metas[barbeiro][tipo][chave];

        metas[barbeiro][tipo][chave] = {

            valor:
                valorNumerico,

            criadaEm:
                metaAnterior &&
                metaAnterior.criadaEm
                    ? metaAnterior.criadaEm
                    : new Date().toISOString(),

            alteradaEm:
                new Date().toISOString(),

            alteradaPeloDono:
                true
        };

        salvarMetas(metas);

        return true;
    }


    function formatarProgressoMeta(
        realizado,
        meta
    ) {

        const valorMeta =
            Number(meta) || 0;

        if (
            valorMeta <= 0
        ) {

            return 0;
        }

        const percentual =
            (
                Number(realizado || 0) /
                valorMeta
            ) * 100;

        return Math.min(
            100,
            percentual
        );
    }


    function obterInicioFimPeriodo(
        tipo
    ) {

        const hoje =
            new Date();

        let inicio =
            new Date(hoje);

        let fim =
            new Date(hoje);


        // DIÁRIA

        if (
            tipo === "diaria"
        ) {

            inicio.setHours(
                0,
                0,
                0,
                0
            );

            fim.setHours(
                23,
                59,
                59,
                999
            );
        }


        // SEMANAL

        if (
            tipo === "semanal"
        ) {

            const diaSemana =
                hoje.getDay();

            const diferenca =
                diaSemana === 0
                    ? -6
                    : 1 - diaSemana;

            inicio.setDate(
                hoje.getDate() +
                diferenca
            );

            inicio.setHours(
                0,
                0,
                0,
                0
            );

            fim =
                new Date(inicio);

            fim.setDate(
                inicio.getDate() +
                6
            );

            fim.setHours(
                23,
                59,
                59,
                999
            );
        }


        // MENSAL

        if (
            tipo === "mensal"
        ) {

            inicio =
                new Date(
                    hoje.getFullYear(),
                    hoje.getMonth(),
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    hoje.getFullYear(),
                    hoje.getMonth() + 1,
                    0,
                    23,
                    59,
                    59,
                    999
                );
        }

        return {
            inicio: inicio,
            fim: fim
        };
    }


    function obterRealizadoPeriodo(
        usuario,
        tipo
    ) {

        const periodo =
            obterInicioFimPeriodo(
                tipo
            );

        const servicos =
            lerLocalStorage(
                "servicos",
                []
            );

        const servicosUsuario =
            servicos.filter(
                function (servico) {

                    if (usuario) {

                        if (
                            servico.barbeiro !==
                            usuario
                        ) {

                            return false;
                        }
                    }

                    const dataISO =
                        converterDataServicoParaISO(
                            servico.data
                        );

                    if (!dataISO) {
                        return false;
                    }

                    const dataServico =
                        new Date(
                            dataISO +
                            "T12:00:00"
                        );

                    return (
                        dataServico >=
                        periodo.inicio &&

                        dataServico <=
                        periodo.fim
                    );
                }
            );

        let total = 0;

        servicosUsuario.forEach(
            function (servico) {

                total +=
                    Number(
                        servico.valor
                    ) || 0;
            }
        );

        return {

            total:
                total,

            quantidade:
                servicosUsuario.length
        };
    }


    // =====================================================
    // FUNÇÃO PARA DEFINIR MINHA META
    // =====================================================

    function definirMinhaMeta(tipo) {

        const usuario =
            obterNomeUsuarioMeta();

        const input =
            document.getElementById(
                "meta-" + tipo
            );

        if (!input) {
            return;
        }

        const valor =
            input.value;

        const metaExistente = obterMetaUsuario(tipo, usuario);
        if (metaExistente) {
            alert("Você já definiu esta meta para o período atual. Uma nova definição ficará disponível quando o período terminar.");
            return;
        }

        if (
            !salvarMetaUsuario(
                tipo,
                usuario,
                valor
            )
        ) {

            alert(
                "Digite um valor de meta válido."
            );

            return;
        }

        alert(
            "Meta definida com sucesso!"
        );

        mostrarMetas();
    }


    // =====================================================
    // EDITAR META DO BARBEIRO
    // =====================================================

    function alterarMetaBarbeiro(
        tipo
    ) {

        if (obterSessao().tipo !== "dono") {
            return;
        }

        const select =
            document.getElementById(
                "metaBarbeiroSelect"
            );

        if (!select) {
            return;
        }

        const barbeiro =
            select.value;

        const input =
            document.getElementById(
                "editor-meta-" + tipo
            );

        if (
            !barbeiro ||
            !input
        ) {

            alert(
                "Selecione um barbeiro e informe o valor."
            );

            return;
        }

        const sucesso =
            alterarMetaPeloDono(
                tipo,
                barbeiro,
                input.value
            );

        if (!sucesso) {

            alert(
                "Digite um valor de meta válido."
            );

            return;
        }

        alert(
            "Meta do barbeiro atualizada!"
        );

        mostrarEditorMetaBarbeiro(
            barbeiro
        );
    }


    function mostrarEditorMetaBarbeiro(
        barbeiro
    ) {

        const area =
            document.getElementById(
                "painelMetaBarbeiro"
            );

        if (!area) {
            return;
        }

        if (!barbeiro) {

            area.innerHTML = `
                <p class="vazio">
                    Selecione um barbeiro para visualizar e alterar as metas.
                </p>
            `;

            return;
        }

        const tipos = [

            {
                chave: "diaria",
                titulo: "Meta diária",
                periodo: "Hoje"
            },

            {
                chave: "semanal",
                titulo: "Meta semanal",
                periodo: "Segunda a domingo"
            },

            {
                chave: "mensal",
                titulo: "Meta mensal",
                periodo: "Mês atual"
            }

        ];

        area.innerHTML = `

            <div class="painel">

                <h3>
                    Metas de ${escaparHTML(barbeiro)}
                </h3>

                <p>
                    O dono pode alterar as metas durante o período.
                </p>

                ${tipos.map(
                    function (tipo) {

                        const meta =
                            obterMetaUsuario(
                                tipo.chave,
                                barbeiro
                            );

                        const realizado =
                            obterRealizadoPeriodo(
                                barbeiro,
                                tipo.chave
                            );

                        const valorMeta =
                            meta
                                ? Number(meta.valor)
                                : 0;

                        const percentual =
                            formatarProgressoMeta(
                                realizado.total,
                                valorMeta
                            );

                        const restante =
                            Math.max(
                                valorMeta -
                                realizado.total,
                                0
                            );

                        return `

                            <div
                                class="registro"
                                style="margin-top:15px;"
                            >

                                <h3>
                                    
                                    ${tipo.titulo}
                                </h3>

                                <p>
                                    ${tipo.periodo}
                                </p>

                                ${
                                    meta
                                        ? `
                                            <p>
                                                Meta:
                                                <strong>
                                                    R$ ${formatarMoeda(valorMeta)}
                                                </strong>
                                            </p>

                                            <p>
                                                Realizado:
                                                <strong>
                                                    R$ ${formatarMoeda(realizado.total)}
                                                </strong>
                                            </p>

                                            <p>
                                                Progresso:
                                                <strong>
                                                    ${percentual.toFixed(1)}%
                                                </strong>
                                            </p>

                                            <p>
                                                Falta:
                                                <strong>
                                                    R$ ${formatarMoeda(restante)}
                                                </strong>
                                            </p>

                                            <p>
                                                Serviços:
                                                <strong>
                                                    ${realizado.quantidade}
                                                </strong>
                                            </p>

                                            <div class="meta-progresso"><div class="meta-progresso-barra" style="width:${percentual}%;"></div></div>

                                        `
                                        : `
                                            <p class="vazio">
                                                Nenhuma meta definida neste período.
                                            </p>
                                        `
                                }

                                <label>
                                    Nova meta
                                </label>

                                <input
                                    type="number"
                                    id="editor-meta-${tipo.chave}"
                                    min="1"
                                    step="0.01"
                                    value="${meta ? meta.valor : ""}"
                                    placeholder="Ex.: 3000"
                                >

                                <button
                                    class="botao-principal"
                                    id="alterar-meta-${tipo.chave}"
                                    style="margin-top:10px;"
                                >

                                    ${
                                        meta
                                            ? "Alterar meta"
                                            : "Definir meta"
                                    }

                                </button>

                            </div>

                        `;
                    }
                ).join("")}

            </div>
        `;


        tipos.forEach(
            function (tipo) {

                const botao =
                    document.getElementById(
                        "alterar-meta-" +
                        tipo.chave
                    );

                if (botao) {

                    botao.onclick =
                        function () {

                            alterarMetaBarbeiro(
                                tipo.chave
                            );
                        };
                }
            }
        );
    }


   function mostrarMetas() {

    ativarMenu("menuHome");

    const sessao = obterSessao();

    if (!sessao || !sessao.tipo) {
        return;
    }

    const ehDono = sessao.tipo === "dono";

    // Para o dono, o realizado considera TODOS os serviços.
    // Para barbeiro, considera somente os próprios serviços.
    const usuarioMeta =
        ehDono
            ? "Dono"
            : sessao.nome;

    const usuarioFiltro =
        ehDono
            ? ""
            : sessao.nome;

    const tipos = [
        {
            chave: "diaria",
            titulo: "Meta diária",
            periodo: "Hoje"
        },
        {
            chave: "semanal",
            titulo: "Meta semanal",
            periodo: "Segunda a domingo"
        },
        {
            chave: "mensal",
            titulo: "Meta mensal",
            periodo: "Primeiro ao último dia do mês"
        }
    ];

    app.innerHTML = `

        <div class="painel">

            <h2>
                Metas
            </h2>

            <p>
                Acompanhe seu desempenho e suas metas.
            </p>

            <div class="cards">

                ${tipos.map(
                    function (tipo) {

                        const meta =
                            obterMetaUsuario(
                                tipo.chave,
                                usuarioMeta
                            );

                        const realizado =
                            obterRealizadoPeriodo(
                                usuarioFiltro,
                                tipo.chave
                            );

                        const valorMeta =
                            meta
                                ? Number(meta.valor)
                                : 0;

                        const percentual =
                            formatarProgressoMeta(
                                realizado.total,
                                valorMeta
                            );

                        const restante =
                            Math.max(
                                valorMeta -
                                realizado.total,
                                0
                            );

                        return `

                            <div
                                class="card"
                                style="
                                    cursor:default;
                                    text-align:left;
                                "
                            >

                                <span>
                                    
                                </span>

                                <strong>
                                    ${tipo.titulo}
                                </strong>

                                <small>
                                    ${tipo.periodo}
                                </small>

                                ${
                                    meta
                                        ? `

                                            <p style="margin-top:12px;">
                                                Meta: <strong>
                                                    R$ ${formatarMoeda(valorMeta)}
                                                </strong>
                                            </p>

                                            <p>
                                                Realizado:
                                                <strong>
                                                    R$ ${formatarMoeda(realizado.total)}
                                                </strong>
                                            </p>

                                            <p>
                                                Progresso: <strong>
                                                    ${percentual.toFixed(1)}%
                                                </strong>
                                            </p>

                                            <p>
                                                Falta:
                                                <strong>
                                                    R$ ${formatarMoeda(restante)}
                                                </strong>
                                            </p>

                                            <p>
                                                Serviços: <strong>
                                                    ${realizado.quantidade}
                                                </strong>
                                                serviços
                                            </p>

                                            <div class="meta-progresso"><div class="meta-progresso-barra" style="width:${Math.min(percentual, 100)}%;"></div></div>

                                            ${
                                                percentual >= 100
                                                    ? `
                                                        <p
                                                            style="
                                                                margin-top:10px;
                                                                font-weight:bold;
                                                            "
                                                        >
                                                            Meta atingida!
                                                        </p>
                                                    `
                                                    : ""
                                            }

                                        `
                                        : `

                                            <p
                                                class="vazio"
                                                style="margin-top:12px;"
                                            >
                                                Nenhuma meta definida neste período.
                                            </p>

                                            <label
                                                style="
                                                    display:block;
                                                    margin-top:12px;
                                                "
                                            >
                                                Valor da meta
                                            </label>

                                            <input
                                                type="number"
                                                id="meta-${tipo.chave}"
                                                min="1"
                                                step="0.01"
                                                placeholder="Ex.: 500"
                                            >

                                            <button
                                                class="botao-principal"
                                                id="definir-${tipo.chave}"
                                                style="margin-top:10px;"
                                            >
                                                Definir meta
                                            </button>

                                        `
                                }

                            </div>

                        `;
                    }
                ).join("")}

                    </div>

        <div
            class="painel"
            style="margin-top:25px;"
        >

            <h3>
                Visão geral financeira
            </h3>

            <div class="cards">

                <div class="card">

                    <strong>
                        Hoje
                    </strong>

                    <p>
                        R$
                        <strong>
                            ${formatarMoeda(
                                obterRealizadoPeriodo(
                                    usuarioFiltro,
                                    "diaria"
                                ).total
                            )}
                        </strong>
                    </p>

                </div>

                <div class="card">

                    <strong>
                        Esta semana
                    </strong>

                    <p>
                        R$
                        <strong>
                            ${formatarMoeda(
                                obterRealizadoPeriodo(
                                    usuarioFiltro,
                                    "semanal"
                                ).total
                            )}
                        </strong>
                    </p>

                </div>

                <div class="card">

                    <strong>
                        Este mês
                    </strong>

                    <p>
                        R$
                        <strong>
                            ${formatarMoeda(
                                obterRealizadoPeriodo(
                                    usuarioFiltro,
                                    "mensal"
                                ).total
                            )}
                        </strong>
                    </p>

                </div>

            </div>

        </div>

        ${
            ehDono
                    ? `

                        <div
                            class="painel"
                            style="margin-top:25px;"
                        >

                            <h3>
                                Metas dos barbeiros
                            </h3>

                            <p>
                                O dono pode visualizar e alterar as metas dos profissionais.
                            </p>

                            <label>
                                Selecione o barbeiro
                            </label>

                            <select id="metaBarbeiroSelect">

                                <option value="">
                                    Selecione um barbeiro
                                </option>

                                ${
                                    lerLocalStorage(
                                        "barbeiros",
                                        []
                                    )
                                        .filter(
                                            function (barbeiro) {
                                                return (
                                                    barbeiro &&
                                                    barbeiro.nome
                                                );
                                            }
                                        )
                                        .map(
                                            function (barbeiro) {

                                                return `
                                                    <option
                                                        value="${escaparHTML(barbeiro.nome)}"
                                                    >
                                                        ${escaparHTML(barbeiro.nome)}
                                                    </option>
                                                `;
                                            }
                                        )
                                        .join("")
                                }

                            </select>

                            <div
                                id="painelMetaBarbeiro"
                                style="margin-top:20px;"
                            >

                                <p class="vazio">
                                    Selecione um barbeiro para visualizar as metas.
                                </p>

                            </div>

                        </div>

                    `
                    : ""
            }

        </div>

    `;

    // Botões para definir as metas
    tipos.forEach(
        function (tipo) {

            const botao =
                document.getElementById(
                    "definir-" +
                    tipo.chave
                );

            if (botao) {

                botao.onclick =
                    function () {

                        definirMinhaMeta(
                            tipo.chave
                        );

                    };

            }

        }
    );

    // Seleção do barbeiro pelo dono
    if (ehDono) {

        const select =
            document.getElementById(
                "metaBarbeiroSelect"
            );

        if (select) {

            select.onchange =
                function () {

                    mostrarEditorMetaBarbeiro(
                        this.value
                    );

                };

        }

    }

}
    // =====================================================
    // VERIFICAR LOGIN AO ABRIR
    // =====================================================

    const sessaoSalva =
        lerLocalStorage(
            "sessao",
            null
        );

    if (sessaoSalva) {

        entrarNoApp();

    } else {

        if (telaLogin) {
            telaLogin.style.display = "flex";
        }

        if (appPrincipal) {
            appPrincipal.style.display = "none";
        }
    }


    // =====================================================
    // MENU
    // =====================================================

    function ativarMenu(id) {

        document
            .querySelectorAll(
                ".menu-inferior button"
            )
            .forEach(
                function (botao) {

                    botao.classList.remove(
                        "ativo"
                    );
                }
            );

        if (!id) {
            return;
        }

        /*
         * Barbeiros e Financeiro não ficam mais no menu inferior.
         * Quando a tela pedir uma aba que não existe, marca a Home.
         */
        const botao =
            document.getElementById(
                id
            ) ||
            document.getElementById(
                "menuHome"
            );

        if (botao) {

            botao.classList.add(
                "ativo"
            );
        }
    }


    // =====================================================
    // HOME
    // =====================================================
function mostrarHome() {

    ativarMenu(
        "menuHome"
    );

    /* Ícones de traço fino (herdam a cor do texto) */
    const ICONES = {
        agenda: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>`,
        pessoa: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.2"/><path d="M6 20c0-3.6 2.7-6 6-6s6 2.4 6 6z"/></svg>`,
        sino: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.6 2H4.4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`
    };

    /*
     * A Home existe somente dentro do #app.
     * Remove restos antigos fora do #app, se houver.
     */
    document
        .querySelectorAll(
            "main > .banner, main > .dashboard-home"
        )
        .forEach(
            function (elemento) {
                elemento.remove();
            }
        );


    const sessao =
        obterSessao();

    const ehDono =
        sessao.tipo === "dono";

    const filtro =
        getFiltroBarbeiro();

    const todosServicos =
        lerLocalStorage(
            "servicos",
            []
        );

    const servicosVisiveis =
        filtro
            ? todosServicos.filter(
                function (servico) {
                    return servico.barbeiro === filtro;
                }
            )
            : todosServicos;

    const barbeiros =
        lerLocalStorage(
            "barbeiros",
            []
        );


    /* Atalhos: Barbeiros só aparece para o dono */

    const atalhos = [
        { id: "homeAgenda", icone: ICONES.agenda, nome: "Agenda" }
    ];

    if (ehDono) {
        atalhos.push(
            { id: "homeBarbeiros", icone: ICONES.pessoa, nome: "Barbeiros" }
        );
    }

    if (ehDono) {
        atalhos.push(
            { id: "homeFinanceiro", icone: '<span class="icone-texto">R$</span>', nome: "Financeiro" }
        );
    }

    const htmlAtalhos =
        atalhos
            .map(
                function (atalho) {

                    return `
                        <button
                            class="card-dashboard"
                            id="${atalho.id}"
                            type="button"
                        >
                            <span class="icone-card">${atalho.icone}</span>
                            <strong>${atalho.nome}</strong>
                        </button>
                    `;
                }
            )
            .join("");


    const htmlProfissionais =
        barbeiros.length > 0
            ? barbeiros
                .map(
                    function (barbeiro) {

                        const nome =
                            String(barbeiro.nome || "").trim();

                        const inicial =
                            nome
                                ? nome.charAt(0).toUpperCase()
                                : "?";

                        return `
                            <div class="profissional">
                                <div class="avatar">${escaparHTML(inicial)}</div>
                                <strong>${escaparHTML(nome)}</strong>
                            </div>
                        `;
                    }
                )
                .join("")
            : `
                <p class="vazio">
                    Nenhum profissional cadastrado.
                </p>
            `;


    app.innerHTML = `

        <div class="dashboard-home">

            <!-- TOPO -->

            <div class="dashboard-topo">

                <div class="marca-dashboard">

                    <div class="logo-dashboard">
                        M
                    </div>

                    <div class="texto-marca">
                        <h1>MARTINS</h1>
                        <p>BARBEARIA</p>
                    </div>

                </div>

                <button
                    id="btnNotificacoes"
                    class="botao-notificacao"
                    title="Notificações"
                    type="button"
                    aria-label="Notificações"
                >
                    ${ICONES.sino}
                </button>

            </div>

            <div class="faixa-marca-dashboard">
                <span></span>
                <span></span>
            </div>


            <!-- BOAS-VINDAS -->

            <section class="banner-dashboard">

                <span class="banner-pequeno">
                    BEM-VINDO À
                </span>

                <h2>
                    Martins Barbearia
                </h2>

                <p>
                    Seu estilo começa aqui.
                </p>

                <button
                    class="botao-principal"
                    id="homeNovoServico"
                    type="button"
                >
                    Agendar / Cadastrar serviço
                </button>

                <div class="faixa-marca-dashboard">
                    <span></span>
                    <span></span>
                </div>

            </section>


            <!-- ATALHOS -->

            <div
                class="cards-dashboard"
                style="grid-template-columns: repeat(${atalhos.length}, minmax(0, 1fr));"
            >
                ${htmlAtalhos}
            </div>

            <button
                class="botao-principal"
                id="homeMetas"
                type="button"
            >
                Dashboard de metas
            </button>


            <!-- SEUS SERVIÇOS -->

            <h3>Seus serviços</h3>

            <div class="bloco-info">

                <strong>
                    ${servicosVisiveis.length} serviço(s) cadastrado(s)
                </strong>

                <p>
                    Toque em Serviços para visualizar, pesquisar ou excluir.
                </p>

            </div>


            <!-- PROFISSIONAIS -->

            <h3>Nossos profissionais</h3>

            <div class="profissionais">
                ${htmlProfissionais}
            </div>

        </div>

    `;


    /* NOTIFICAÇÕES */

    document.getElementById("btnNotificacoes").onclick =
        function () {
            alert("Nenhuma nova notificação.");
        };


    /* BOTÃO DO BANNER */

    document.getElementById("homeNovoServico").onclick =
        function () {
            abrirCadastroServico();
        };


    /* ATALHOS */

    document.getElementById("homeAgenda").onclick =
        function () {
            mostrarServicosDoDia();
        };

    const homeBarbeiros =
        document.getElementById("homeBarbeiros");

    if (homeBarbeiros) {
        homeBarbeiros.onclick =
            function () {
                mostrarBarbeiros();
            };
    }

    const homeFinanceiro = document.getElementById("homeFinanceiro");
    if (homeFinanceiro) {
        homeFinanceiro.onclick = function () { mostrarFinanceiro(); };
    }


    /* METAS */

    document.getElementById("homeMetas").onclick =
        function () {
            mostrarMetas();
        };

}



    // =====================================================
    // TELA PRINCIPAL DE SERVIÇOS
    // =====================================================

    function mostrarTelaServicos() {

        ativarMenu(
            "menuServicos"
        );

        app.innerHTML = `

            <div class="painel">

                <h2>
                    Serviços
                </h2>

                <p>
                    Consulte os atendimentos realizados.
                </p>

                <div class="cards">

                    <button
                        class="card"
                        id="btnPesquisarClienteServico"
                    >

                        <strong>
                            Pesquisar cliente
                        </strong>

                        <small>
                            Ver serviços de um cliente
                        </small>

                    </button>


                    <button
                        class="card"
                        id="btnServicosDoDia"
                    >

                        <strong>
                            Serviços do dia
                        </strong>

                        <small>
                            Ver atendimentos por data
                        </small>

                    </button>


                    <button
                        class="card"
                        id="btnNovoServico"
                    >

                        <strong>
                            Registrar serviço
                        </strong>

                        <small>
                            Cadastrar novo atendimento
                        </small>

                    </button>

                </div>

            </div>

        `;


        document.getElementById(
            "btnPesquisarClienteServico"
        ).onclick =
            function () {

                mostrarPesquisaClienteServicos();
            };


        document.getElementById(
            "btnServicosDoDia"
        ).onclick =
            function () {

                mostrarServicosDoDia();
            };


        document.getElementById(
            "btnNovoServico"
        ).onclick =
            function () {

                abrirCadastroServico();
            };
    }


    // =====================================================
    // PESQUISAR SERVIÇOS DO CLIENTE
    // =====================================================

    function mostrarPesquisaClienteServicos() {

        ativarMenu(
            "menuServicos"
        );

        app.innerHTML = `

            <div class="painel">

                <h2>
                    Pesquisar cliente
                </h2>

                <input
                    type="text"
                    id="campoPesquisaClienteServico"
                    placeholder="Digite o nome do cliente..."
                    autocomplete="off"
                >

                <button
                    class="botao-principal"
                    id="voltarTelaServicos"
                >

                    ← Voltar

                </button>

                <div
                    id="resultadoPesquisaServicos"
                >

                    <p class="vazio">
                        Digite o nome do cliente para pesquisar.
                    </p>

                </div>

            </div>

        `;


        const campo =
            document.getElementById(
                "campoPesquisaClienteServico"
            );

        const resultado =
            document.getElementById(
                "resultadoPesquisaServicos"
            );


        campo.oninput =
            function () {

                const texto =
                    this.value
                        .toLowerCase()
                        .trim();

                if (!texto) {

                    resultado.innerHTML = `

                        <p class="vazio">
                            Digite o nome do cliente para pesquisar.
                        </p>

                    `;

                    return;
                }


                let servicos =
                    lerLocalStorage(
                        "servicos",
                        []
                    );

                const filtroBarbeiro =
                    getFiltroBarbeiro();


                if (filtroBarbeiro) {

                    servicos =
                        servicos.filter(
                            function (item) {

                                return (
                                    item.barbeiro ===
                                    filtroBarbeiro
                                );
                            }
                        );
                }


                const encontrados =
                    servicos.filter(
                        function (item) {

                            return String(
                                item.cliente || ""
                            )
                                .toLowerCase()
                                .includes(
                                    texto
                                );
                        }
                    );


                renderizarRelatorioBuscaCliente(
                    texto,
                    resultado,
                    encontrados
                );
            };


        document.getElementById(
            "voltarTelaServicos"
        ).onclick =
            function () {

                mostrarTelaServicos();
            };
    }


   // =====================================================
// SERVIÇOS DO DIA
// =====================================================

function obterDataAtualISO() {

    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        ano +
        "-" +
        mes +
        "-" +
        dia
    );
}


function calcularDataRetorno(data) {

    if (!data) {
        return "";
    }

    const dataISO =
        converterDataServicoParaISO(
            data
        );

    if (!dataISO) {
        return "";
    }

    const partes =
        dataISO.split("-");

    if (partes.length !== 3) {
        return "";
    }

    const dataRetorno =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

    dataRetorno.setDate(
        dataRetorno.getDate() + 20
    );

    const ano =
        dataRetorno.getFullYear();

    const mes =
        String(
            dataRetorno.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            dataRetorno.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        ano +
        "-" +
        mes +
        "-" +
        dia
    );
}


function formatarDataRetorno(
    dataISO
) {

    if (!dataISO) {
        return "";
    }

    const partes =
        dataISO.split("-");

    if (partes.length !== 3) {
        return dataISO;
    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}


function criarLinkWhatsAppRetorno(
    telefone,
    nome
) {

    if (!telefone) {
        return "";
    }

    const numero =
        String(telefone)
            .replace(/\D/g, "");

    if (!numero) {
        return "";
    }

    const mensagem =
        "Olá " +
        nome +
        "! 👋 " +
        "Já está chegando o período do seu próximo corte. " +
        "Quer agendar seu horário?";

    return (
        "https://wa.me/55" +
        numero +
        "?text=" +
        encodeURIComponent(
            mensagem
        )
    );
}


function converterDataServicoParaISO(
    data
) {

    if (!data) {
        return "";
    }

    const partes =
        String(data).split("/");

    if (
        partes.length !== 3
    ) {
        return "";
    }

    return (
        partes[2] +
        "-" +
        partes[1].padStart(
            2,
            "0"
        ) +
        "-" +
        partes[0].padStart(
            2,
            "0"
        )
    );
}


function mostrarServicosDoDia(
    dataSelecionada
) {

    ativarMenu(
        "menuServicos"
    );

    const data =
        dataSelecionada ||
        obterDataAtualISO();

    let servicos =
        lerLocalStorage(
            "servicos",
            []
        );

    const filtroBarbeiro =
        getFiltroBarbeiro();

    const servicosDoDia =
        servicos.filter(
            function (item) {

                const mesmaData =
                    converterDataServicoParaISO(
                        item.data
                    ) ===
                    data;

                if (!mesmaData) {
                    return false;
                }

                if (
                    filtroBarbeiro &&
                    item.barbeiro !==
                    filtroBarbeiro
                ) {

                    return false;
                }

                return true;
            }
        );

    app.innerHTML = `

        <div class="painel">

            <h2>
                Serviços do dia
            </h2>

            <label>
                Escolha a data
            </label>

            <input
                type="date"
                id="dataServicos"
                value="${data}"
            >

            <div
                style="
                    display:flex;
                    gap:10px;
                    margin-top:10px;
                "
            >

                <button
                    class="botao-principal"
                    id="diaAnterior"
                    style="flex:1;"
                >
                    ← Dia anterior
                </button>

                <button
                    class="botao-principal"
                    id="diaSeguinte"
                    style="flex:1;"
                >
                    Próximo dia →
                </button>

            </div>

            <button
                class="botao-principal"
                id="voltarServicos"
                style="margin-top:10px;"
            >
                ← Voltar para Serviços
            </button>

            <div
                id="resumoDia"
                style="margin-top:20px;"
            >
            </div>

            <div
                id="listaServicosDia"
                style="margin-top:20px;"
            >
            </div>

        </div>

    `;

    const resumo =
        document.getElementById(
            "resumoDia"
        );

    const lista =
        document.getElementById(
            "listaServicosDia"
        );

    let total = 0;

    let comissao = 0;

    servicosDoDia.forEach(
        function (item) {

            const valor =
                Number(
                    item.valor
                ) || 0;

            total += valor;

            comissao +=
                Number(
                    item.comissao
                ) ||
                valor * 0.50;
        }
    );

    resumo.innerHTML = `

        <div class="financeiro-card">

            <h3>
                Resumo do dia
            </h3>

            <p>
                Serviços:
                <strong>
                    ${servicosDoDia.length}
                </strong>
            </p>

            <p>
                Faturamento:
                <strong>
                    R$ ${formatarMoeda(total)}
                </strong>
            </p>

            <p>
                Comissão:
                <strong>
                    R$ ${formatarMoeda(comissao)}
                </strong>
            </p>

        </div>

    `;

    renderizarListaServicos(
        servicosDoDia,
        lista
    );

    document.getElementById(
        "dataServicos"
    ).onchange =
        function () {

            mostrarServicosDoDia(
                this.value
            );
        };

    document.getElementById(
        "diaAnterior"
    ).onclick =
        function () {

            const novaData =
                alterarData(
                    data,
                    -1
                );

            mostrarServicosDoDia(
                novaData
            );
        };

    document.getElementById(
        "diaSeguinte"
    ).onclick =
        function () {

            const novaData =
                alterarData(
                    data,
                    1
                );

            mostrarServicosDoDia(
                novaData
            );
        };

    document.getElementById(
        "voltarServicos"
    ).onclick =
        function () {

            mostrarTelaServicos();
        };
}


function alterarData(
    dataISO,
    quantidadeDias
) {

    const partes =
        dataISO.split("-");

    const data =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

    data.setDate(
        data.getDate() +
        quantidadeDias
    );

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            data.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        ano +
        "-" +
        mes +
        "-" +
        dia
    );
}
    // =====================================================
    // RENDERIZAR LISTA DE SERVIÇOS
    // =====================================================

    function renderizarListaServicos(
        servicos,
        elemento
    ) {

        if (!elemento) {
            return;
        }

        if (
            !servicos ||
            servicos.length === 0
        ) {

            elemento.innerHTML = `

                <p class="vazio">
                    Nenhum serviço encontrado.
                </p>

            `;

            return;
        }


        elemento.innerHTML =
            servicos.map(
                function (servico) {

                    const valor =
                        Number(
                            servico.valor
                        ) || 0;

                    const comissao =
                        Number(
                            servico.comissao
                        ) ||
                        valor * 0.50;


                    return `

                        <div class="registro">

                            <strong>
                                Cliente:
                            </strong>

                            ${escaparHTML(
                                servico.cliente
                            )}

                            <br>

                            <strong>
                                Barbeiro:
                            </strong>

                            ${escaparHTML(
                                servico.barbeiro
                            )}

                            <br>

                            <strong>
                                Serviço:
                            </strong>

                            ${escaparHTML(
                                servico.servico
                            )}

                            <br>

                            <strong>
                                Valor:
                            </strong>

                            R$ ${formatarMoeda(
                                valor
                            )}

                            <br>

                            <strong>
                                Pagamento:
                            </strong>

                            ${escaparHTML(
                                servico.pagamento
                            )}

                            <br>

                            <strong>
                                Data:
                            </strong>

                            ${escaparHTML(
                                servico.data
                            )}

                            às

                            ${escaparHTML(
                                servico.hora
                            )}

                            <br>

                            <strong>
                                Comissão:
                            </strong>

                            R$ ${formatarMoeda(
                                comissao
                            )}

                            <br>

                            <button
                                class="botao-excluir"
                                data-id="${servico.id || ""}"
                            >

                                Excluir

                            </button>

                        </div>

                    `;
                }
            ).join("");


        const botoes =
            elemento.querySelectorAll(
                ".botao-excluir"
            );


        botoes.forEach(
            function (
                botao,
                indice
            ) {

                botao.onclick =
                    function () {

                        const servico =
                            servicos[indice];

                        excluirServico(
                            servico
                        );
                    };
            }
        );
    }

// =====================================================
// EXCLUIR CLIENTE
// =====================================================

function excluirCliente(
    indice
) {

    let clientes =
        lerLocalStorage(
            "clientes",
            []
        );


    if (
        indice < 0 ||
        indice >= clientes.length
    ) {

        return;
    }


    const cliente =
        clientes[indice];


    const confirmar =
        confirm(
            `Deseja realmente excluir o cliente "${cliente.nome}"?`
        );


    if (!confirmar) {

        return;
    }


    clientes.splice(
        indice,
        1
    );


    salvarLocalStorage(
        "clientes",
        clientes
    );


    mostrarClientes();
}


window.excluirCliente =
    excluirCliente;
    // =====================================================
    // EXCLUIR SERVIÇO
    // =====================================================

   function excluirServico(
    servicoAlvo
) {

        let servicos =
            lerLocalStorage(
                "servicos",
                []
            );


        const indice =
            servicos.findIndex(
                function (item) {

                    if (
                        servicoAlvo.id &&
                        item.id
                    ) {

                        return (
                            item.id ===
                            servicoAlvo.id
                        );
                    }

                    return (
                        item.cliente ===
                        servicoAlvo.cliente &&

                        item.barbeiro ===
                        servicoAlvo.barbeiro &&

                        item.servico ===
                        servicoAlvo.servico &&

                        item.data ===
                        servicoAlvo.data &&

                        item.hora ===
                        servicoAlvo.hora
                    );
                }
            );


        if (
            indice === -1
        ) {

            return;
        }


        const confirmar =
            confirm(
                "Deseja realmente excluir este serviço?"
            );


        if (!confirmar) {
            return;
        }


        servicos.splice(
            indice,
            1
        );


        salvarLocalStorage(
            "servicos",
            servicos
        );


        mostrarTelaServicos();
    }


    window.excluirServico =
        excluirServico;


    // =====================================================
    // CADASTRO DE SERVIÇO
    // =====================================================

    const precos = {

        "Corte": 30,

        "Sobrancelha": 10,

        "Barba": 30,

        "Corte/Barba": 55,

        "Corte/Barbaterapia": 70,

        "Corte/Barba/Sobrancelha": 65,

        "Corte/Barbaterapia/Sobrancelha": 80,

        "Pezinho": 10,

        "Corte Kids": 35,

        "Corte Máquina": 20,

        "Corte Navalhado": 35
    };


    let servicosSelecionados = [];


    function abrirCadastroServico() {

        ativarMenu(
            "menuServicos"
        );

        servicosSelecionados = [];


        app.innerHTML = `

            <div class="painel">

                <h2>
                    Registrar serviço
                </h2>


                <label>
                    Cliente
                </label>

                <select id="cliente">

                    <option value="">
                        Selecione o cliente
                    </option>

                </select>


                <label>
                    Barbeiro
                </label>

                <select id="barbeiro">

                    <option value="">
                        Selecione o barbeiro
                    </option>

                </select>


                <label>
                    Serviço
                </label>

                <select id="servico">

                    <option value="">
                        Selecione o serviço
                    </option>

                    <option value="Corte">
                        Corte - R$ 30,00
                    </option>

                    <option value="Sobrancelha">
                        Sobrancelha - R$ 10,00
                    </option>

                    <option value="Barba">
                        Barba - R$ 30,00
                    </option>

                    <option value="Corte/Barba">
                        Corte/Barba - R$ 55,00
                    </option>

                    <option value="Corte/Barbaterapia">
                        Corte/Barbaterapia - R$ 70,00
                    </option>

                    <option value="Corte/Barba/Sobrancelha">
                        Corte/Barba/Sobrancelha - R$ 65,00
                    </option>

                    <option value="Corte/Barbaterapia/Sobrancelha">
                        Corte/Barbaterapia/Sobrancelha - R$ 80,00
                    </option>

                    <option value="Pezinho">
                        Pezinho - R$ 10,00
                    </option>

                    <option value="Corte Kids">
                        Corte Kids - R$ 35,00
                    </option>

                    <option value="Corte Máquina">
                        Corte Máquina - R$ 20,00
                    </option>

                    <option value="Corte Navalhado">
                        Corte Navalhado - R$ 35,00
                    </option>

                    <option value="multiplos">
                        Selecionar vários serviços
                    </option>

                </select>


                <div
                    id="areaServicoLivre"
                    style="display:none;"
                >

                    <label>
                        Buscar serviço
                    </label>

                    <input
                        type="text"
                        id="buscaServico"
                        placeholder="Digite o nome do serviço..."
                        autocomplete="off"
                    >


                    <div
                        id="sugestoesServico"
                    >
                    </div>


                    <label>
                        Serviços selecionados
                    </label>

                    <div
                        id="listaServicosSelecionados"
                    >
                    </div>

                </div>


                <label>
                    Valor
                </label>

                <input
                    type="text"
                    id="valor"
                    readonly
                >
<label>
    Data do atendimento
</label>

<input
    type="date"
    id="dataServico"
>

                <label>
                    Forma de pagamento
                </label>

                <select id="pagamento">

                    <option value="">
                        Selecione
                    </option>

                    <option value="Dinheiro">
                        Dinheiro
                    </option>

                    <option value="Pix">
                        Pix
                    </option>

                    <option value="Cartão">
                        Cartão
                    </option>

                    <option value="Outro">
                        Outro
                    </option>

                </select>


                <button
                    class="botao-principal"
                    id="salvarServico"
                >

                    Salvar Serviço

                </button>


                <button
                    class="botao-principal"
                    id="voltarDepoisCadastro"
                    style="margin-top:10px;"
                >

                    ← Voltar

                </button>

            </div>

        `;


        carregarClientesServico();

        carregarBarbeirosServico();

        configurarServico();
const campoDataServico =
    document.getElementById(
        "dataServico"
    );

if (campoDataServico) {

    const hoje =
        obterDataAtualISO();

    const dataMinima =
        alterarData(
            hoje,
            -7
        );

    campoDataServico.min =
        dataMinima;

    campoDataServico.max =
        hoje;

    campoDataServico.value =
        hoje;
}

        document.getElementById(
            "voltarDepoisCadastro"
        ).onclick =
            function () {

                mostrarTelaServicos();
            };
    }


    function carregarClientesServico() {

        const select =
            document.getElementById(
                "cliente"
            );

        if (!select) {
            return;
        }


        const clientes =
            lerLocalStorage(
                "clientes",
                []
            );


        clientes.forEach(
            function (cliente) {

                if (!cliente.nome) {
                    return;
                }

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    cliente.nome;

                option.textContent =
                    cliente.nome;

                select.appendChild(
                    option
                );
            }
        );
    }


    function carregarBarbeirosServico() {

        const select =
            document.getElementById(
                "barbeiro"
            );

        if (!select) {
            return;
        }


        const barbeiros =
            lerLocalStorage(
                "barbeiros",
                []
            );


        barbeiros.forEach(
            function (barbeiro) {

                if (!barbeiro.nome) {
                    return;
                }

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    barbeiro.nome;

                option.textContent =
                    barbeiro.nome;

                select.appendChild(
                    option
                );
            }
        );


        const sessao =
            obterSessao();


        if (
            sessao.tipo ===
            "barbeiro"
        ) {

            select.value =
                sessao.nome;

            select.disabled =
                true;
        }
    }


    function configurarServico() {

        const selectServico =
            document.getElementById(
                "servico"
            );

        const salvar =
            document.getElementById(
                "salvarServico"
            );


        if (
            !selectServico ||
            !salvar
        ) {

            return;
        }


        selectServico.onchange =
            function () {

                const valorInput =
                    document.getElementById(
                        "valor"
                    );

                const area =
                    document.getElementById(
                        "areaServicoLivre"
                    );


                if (
                    this.value ===
                    "multiplos"
                ) {

                    area.style.display =
                        "block";

                    servicosSelecionados =
                        [];

                    renderizarSelecionados();

                    configurarBuscaServicos();

                } else {

                    area.style.display =
                        "none";

                    const preco =
                        precos[
                            this.value
                        ] || 0;

                    valorInput.value =
                        "R$ " +
                        formatarMoeda(
                            preco
                        );
                }
            };


        salvar.onclick =
            function () {

                salvarNovoServico();
            };
    }


    function configurarBuscaServicos() {

        const campo =
            document.getElementById(
                "buscaServico"
            );

        const sugestoes =
            document.getElementById(
                "sugestoesServico"
            );


        if (
            !campo ||
            !sugestoes
        ) {

            return;
        }


        campo.oninput =
            function () {

                const texto =
                    this.value
                        .toLowerCase()
                        .trim();


                sugestoes.innerHTML =
                    "";


                if (!texto) {
                    return;
                }


                Object.keys(precos)
                    .filter(
                        function (nome) {

                            return nome
                                .toLowerCase()
                                .includes(
                                    texto
                                );
                        }
                    )
                    .forEach(
                        function (nome) {

                            const item =
                                document.createElement(
                                    "div"
                                );

                            item.className =
                                "registro";

                            item.style.cursor =
                                "pointer";

                            item.innerHTML =
                                nome +
                                " - R$ " +
                                formatarMoeda(
                                    precos[nome]
                                );


                            item.onclick =
                                function () {

                                    servicosSelecionados
                                        .push({

                                            nome:
                                                nome,

                                            preco:
                                                precos[
                                                    nome
                                                ]
                                        });


                                    renderizarSelecionados();


                                    campo.value =
                                        "";

                                    sugestoes.innerHTML =
                                        "";

                                    campo.focus();
                                };


                            sugestoes.appendChild(
                                item
                            );
                        }
                    );
            };
    }


    function renderizarSelecionados() {

        const lista =
            document.getElementById(
                "listaServicosSelecionados"
            );

        const valorInput =
            document.getElementById(
                "valor"
            );


        if (!lista) {
            return;
        }


        if (
            servicosSelecionados.length ===
            0
        ) {

            lista.innerHTML = `

                <p class="vazio">
                    Nenhum serviço selecionado.
                </p>

            `;

        } else {

            lista.innerHTML =
                servicosSelecionados
                    .map(
                        function (
                            item,
                            indice
                        ) {

                            return `

                                <div class="registro">

                                    <strong>
                                        ${escaparHTML(
                                            item.nome
                                        )}
                                    </strong>

                                    - R$
                                    ${formatarMoeda(
                                        item.preco
                                    )}

                                    <button
                                        class="botao-excluir"
                                        data-indice="${indice}"
                                    >

                                        

                                    </button>

                                </div>

                            `;
                        }
                    )
                    .join("");


            lista
                .querySelectorAll(
                    ".botao-excluir"
                )
                .forEach(
                    function (botao) {

                        botao.onclick =
                            function () {

                                const indice =
                                    Number(
                                        this.dataset.indice
                                    );

                                servicosSelecionados
                                    .splice(
                                        indice,
                                        1
                                    );

                                renderizarSelecionados();
                            };
                    }
                );
        }


        let total = 0;


        servicosSelecionados.forEach(
            function (item) {

                total +=
                    Number(
                        item.preco
                    ) || 0;
            }
        );


        if (valorInput) {

            valorInput.value =
                "R$ " +
                formatarMoeda(
                    total
                );
        }
    }


    function salvarNovoServico() {

        const cliente =
            document.getElementById(
                "cliente"
            ).value.trim();


        const sessaoServico = obterSessao();
        const barbeiro = sessaoServico.tipo === "barbeiro"
            ? sessaoServico.nome
            : document.getElementById("barbeiro").value;


        const servicoSelecionado =
            document.getElementById(
                "servico"
            ).value;


        const pagamento =
            document.getElementById(
                "pagamento"
            ).value;

const dataSelecionada =
    document.getElementById(
        "dataServico"
    ).value;
    
 

        let servico;

        let valor;


        if (
            servicoSelecionado ===
            "multiplos"
        ) {

            if (
                servicosSelecionados.length ===
                0
            ) {

                alert(
                    "Adicione pelo menos um serviço."
                );

                return;
            }


            servico =
                servicosSelecionados
                    .map(
                        function (item) {

                            return item.nome;
                        }
                    )
                    .join(" + ");


            valor = 0;


            servicosSelecionados.forEach(
                function (item) {

                    valor +=
                        Number(
                            item.preco
                        ) || 0;
                }
            );

        } else {

            servico =
                servicoSelecionado;

            valor =
                Number(
                    precos[
                        servicoSelecionado
                    ]
                ) || 0;
        }


       const partesData =
    dataSelecionada.split("-");

const data =
    partesData[2] +
    "/" +
    partesData[1] +
    "/" +
    partesData[0];

const agora =
    new Date();

const hora =
    agora.toLocaleTimeString(
        "pt-BR"
    );


        const novoServico = {

            id:
                Date.now().toString(),

            cliente:
                cliente,

            barbeiro:
                barbeiro,

            servico:
                servico,

            valor:
                valor,

            pagamento:
                pagamento,

            comissao:
                valor * 0.50,

            data:
                data,

            hora:
                hora
        };


        let servicos =
            lerLocalStorage(
                "servicos",
                []
            );


        servicos.push(
            novoServico
        );


        salvarLocalStorage(
            "servicos",
            servicos
        );


        servicosSelecionados =
            [];


        alert(
            "Serviço cadastrado com sucesso!"
        );


        mostrarServicosDoDia(
            converterDataServicoParaISO(
                data
            )
        );
    }


    // =====================================================
    // CLIENTES
    // =====================================================
function normalizarNomeCliente(nome) {
    return String(nome || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

function servicosVisiveisDoCliente(nome) {
    const filtro = getFiltroBarbeiro();
    return lerLocalStorage("servicos", []).filter(function (servico) {
        const mesmoCliente = normalizarNomeCliente(servico.cliente) === normalizarNomeCliente(nome);
        const barbeiroPermitido = !filtro || servico.barbeiro === filtro;
        return mesmoCliente && barbeiroPermitido;
    }).sort(function (a, b) {
        return (converterDataServicoParaISO(b.data) || "").localeCompare(converterDataServicoParaISO(a.data) || "");
    });
}

function criarRelatorioClienteHTML(nome, servicos) {
    if (!servicos.length) {
        return `<p class="vazio">Nenhum serviço encontrado para este cliente no seu acesso.</p>`;
    }

    const datas = servicos.map(function (item) { return converterDataServicoParaISO(item.data); }).filter(Boolean).sort();
    const primeiraData = datas[0] || "";
    const dataPrimeiroAtendimento = primeiraData ? new Date(primeiraData + "T12:00:00") : null;
    const aniversarioDoHistorico = dataPrimeiroAtendimento ? new Date(dataPrimeiroAtendimento) : null;
    if (aniversarioDoHistorico) aniversarioDoHistorico.setFullYear(aniversarioDoHistorico.getFullYear() + 1);
    const umAnoDeHistorico = aniversarioDoHistorico && aniversarioDoHistorico <= new Date();
    const gastoTotal = servicos.reduce(function (total, item) { return total + (Number(item.valor) || 0); }, 0);
    const hoje = new Date();
    const inicioDozeMeses = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);
    const gastosMensais = {};

    servicos.forEach(function (item) {
        const iso = converterDataServicoParaISO(item.data);
        if (!iso) return;
        const data = new Date(iso + "T12:00:00");
        if (data < inicioDozeMeses || data > hoje) return;
        const chave = iso.slice(0, 7);
        gastosMensais[chave] = (gastosMensais[chave] || 0) + (Number(item.valor) || 0);
    });

    const nomesMeses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const linhasMeses = Object.keys(gastosMensais).sort().reverse().map(function (chave) {
        const partes = chave.split("-");
        return `<div class="registro"><strong>${nomesMeses[Number(partes[1]) - 1]} de ${partes[0]}</strong><span style="float:right">R$ ${formatarMoeda(gastosMensais[chave])}</span></div>`;
    }).join("");

    const listaServicos = servicos.map(function (item) {
        return `<div class="registro"><strong>${escaparHTML(item.servico || "Serviço")}</strong><br><span>${escaparHTML(item.data || "Data não informada")}${item.hora ? " às " + escaparHTML(item.hora) : ""} · ${escaparHTML(item.barbeiro || "Barbeiro não informado")}</span><br><span>Pagamento: ${escaparHTML(item.pagamento || "Não informado")}</span><strong style="float:right">R$ ${formatarMoeda(item.valor)}</strong></div>`;
    }).join("");

    return `
        <div class="cards" style="margin-top:14px">
            <div class="card" style="cursor:default"><small>Atendimentos registrados</small><strong>${servicos.length}</strong></div>
            <div class="card" style="cursor:default"><small>Total gasto registrado</small><strong>R$ ${formatarMoeda(gastoTotal)}</strong></div>
        </div>
        <p style="margin-top:10px">Primeiro atendimento registrado: <strong>${primeiraData ? primeiraData.split("-").reverse().join("/") : "sem data"}</strong></p>
        ${umAnoDeHistorico ? `<p class="registro retorno-proximo"><strong>Cliente com histórico de 1 ano ou mais.</strong> O relatório abaixo mostra os gastos mensais dos últimos 12 meses.</p>` : `<p class="registro">O histórico disponível ainda não completa um ano; os atendimentos registrados já aparecem abaixo.</p>`}
        <h3>Gastos por mês - últimos 12 meses</h3>
        ${linhasMeses || `<p class="vazio">Nenhum gasto registrado nesse intervalo.</p>`}
        <h3>Histórico de serviços</h3>
        ${listaServicos}
    `;
}

function mostrarHistoricoCliente(nome) {
    ativarMenu("menuClientes");
    const servicos = servicosVisiveisDoCliente(nome);
    app.innerHTML = `
        <div class="painel">
            <h2>${escaparHTML(nome)}</h2>
            <p>Histórico de atendimentos e gastos registrados.</p>
            <button class="botao-secundario" id="voltarHistoricoCliente">Voltar para clientes</button>
            ${criarRelatorioClienteHTML(nome, servicos)}
        </div>
    `;
    document.getElementById("voltarHistoricoCliente").onclick = mostrarClientes;
}

function renderizarRelatorioBuscaCliente(texto, area, servicosFiltrados) {
    if (!servicosFiltrados.length) {
        area.innerHTML = `<p class="vazio">Nenhum atendimento encontrado para esse nome.</p>`;
        return;
    }
    const clientes = Array.from(new Set(servicosFiltrados.map(function (item) { return String(item.cliente || "").trim(); }).filter(Boolean)));
    area.innerHTML = clientes.map(function (nome) {
        const servicos = servicosVisiveisDoCliente(nome);
        return `<section class="painel"><h3>${escaparHTML(nome)}</h3>${criarRelatorioClienteHTML(nome, servicos)}<button class="botao-secundario" type="button" data-historico-cliente="${escaparHTML(nome)}">Abrir histórico completo</button></section>`;
    }).join("");
    area.querySelectorAll("[data-historico-cliente]").forEach(function (botao) {
        botao.onclick = function () { mostrarHistoricoCliente(this.dataset.historicoCliente); };
    });
}

function mostrarClientes() {

    ativarMenu("menuClientes");

    let clientes =
        lerLocalStorage(
            "clientes",
            []
        );


    app.innerHTML = `

        <div class="painel">

            <h2>
                Clientes
            </h2>

            <p>
                Cadastre, pesquise e consulte o histórico de cada cliente.
            </p>


            <label>
                Nome do cliente
            </label>

            <input
                type="text"
                id="nomeCliente"
                placeholder="Digite o nome"
            >


            <label>
                Telefone / WhatsApp
            </label>

            <input
                type="text"
                id="telefoneCliente"
                placeholder="(00) 00000-0000"
            >


            <label>
                Observações
            </label>

            <input
                type="text"
                id="observacaoCliente"
                placeholder="Observações"
            >
<button
    type="button"
    class="botao-principal"
    id="btnWhatsAppCliente"
>
    Testar WhatsApp
</button>

            <button
                class="botao-principal"
                id="salvarCliente"
            >
                Cadastrar cliente
            </button>


            <h3>
                Pesquisar clientes
            </h3>
<div class="painel">
    <h3>
        Retornos de clientes
    </h3>

    <p>
        Clientes que estão chegando ou já passaram
        do período de 20 dias desde o último atendimento.
    </p>

    <div id="areaRetornosClientes">
        <p class="vazio">
            Carregando retornos...
        </p>
    </div>
</div>
<div class="painel">

    <h3>
        Serviços realizados
    </h3>

    <div class="botoes-periodo">

        <button
            class="botao-secundario"
            id="btnServicosDia"
        >
            Dia
        </button>

        <button
            class="botao-secundario"
            id="btnServicosSemana"
        >
            Semana
        </button>

        <button
            class="botao-secundario"
            id="btnServicosMes"
        >
            Mês
        </button>

    </div>

    <div id="areaServicosPeriodo">

        <p class="vazio">
            Escolha um período para visualizar os serviços.
        </p>

    </div>

</div>
            <input
                type="text"
                id="pesquisaClienteCadastro"
                placeholder="Digite o nome do cliente..."
            >


            <div
                id="listaClientes"
                style="margin-top:15px;"
            >
            </div>

        </div>

    `;


    function atualizarLista() {

        const pesquisa =
            document.getElementById(
                "pesquisaClienteCadastro"
            ).value
                .toLowerCase()
                .trim();


        const lista =
            document.getElementById(
                "listaClientes"
            );


        const encontrados =
            clientes
                .map(
                    function (
                        cliente,
                        indice
                    ) {

                        return {
                            cliente:
                                cliente,

                            indice:
                                indice
                        };
                    }
                )
                .filter(
                    function (item) {

                        return String(
                            item.cliente.nome ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                pesquisa
                            );
                    }
                );


        if (
            encontrados.length ===
            0
        ) {

            lista.innerHTML = `

                <p class="vazio">
                    Nenhum cliente encontrado.
                </p>

            `;

            return;
        }


        lista.innerHTML =
            encontrados
                .map(
                    function (item) {

                        return `

                            <div
                                class="registro cliente-item"
                                data-indice="${item.indice}"
                                style="cursor:pointer;"
                            >

                                <strong>
                                    ${escaparHTML(
                                        item.cliente.nome
                                    )}
                                </strong>

                                <br>

                                Telefone: ${
                                    escaparHTML(
                                        item.cliente.telefone ||
                                        "Sem telefone"
                                    )
                                }

                                <br>

                                Observações: ${
                                    escaparHTML(
                                        item.cliente.observacao ||
                                        "Sem observações"
                                    )
                                }

                                <br>

                                <span>
                                    Clique para ver histórico
                                </span>

                                <br><br>

                                <button
                                    class="botao-excluir"
                                    data-indice="${item.indice}"
                                >
                                    Excluir
                                </button>

                            </div>

                        `;
                    }
                )
                .join("");


        lista
            .querySelectorAll(
                ".cliente-item"
            )
            .forEach(
                function (clienteElemento) {

                    clienteElemento.onclick =
                        function () {

                            const indice =
                                Number(
                                    this.dataset.indice
                                );

                            mostrarHistoricoCliente(
                                clientes[indice].nome
                            );
                        };
                }
            );


        lista
            .querySelectorAll(
                ".botao-excluir"
            )
            .forEach(
                function (botao) {

                    botao.onclick =
                        function (evento) {

                            evento.stopPropagation();

                            excluirCliente(
                                Number(
                                    this.dataset.indice
                                )
                            );
                        };
                }
            );
    }

const btnWhatsAppCliente =
    document.getElementById(
        "btnWhatsAppCliente"
    );


if (btnWhatsAppCliente) {

    btnWhatsAppCliente.onclick =
        function () {

            const telefone =
                document.getElementById(
                    "telefoneCliente"
                ).value.trim();


            if (!telefone) {

                alert(
                    "Digite o telefone / WhatsApp do cliente."
                );

                return;
            }


            const numero =
                telefone.replace(
                    /\D/g,
                    ""
                );


            const mensagem =
                "Olá! Aqui é da LN Barber. 😊";


            const link =
                "https://wa.me/55" +
                numero +
                "?text=" +
                encodeURIComponent(
                    mensagem
                );


            window.open(
                link,
                "_blank"
            );
        };
}
    document.getElementById(
        "salvarCliente"
    ).onclick =
        function () {

            const nome =
                document.getElementById(
                    "nomeCliente"
                ).value.trim();


            const telefone =
                document.getElementById(
                    "telefoneCliente"
                ).value.trim();


            const observacao =
                document.getElementById(
                    "observacaoCliente"
                ).value.trim();


            if (!nome) {

                alert(
                    "Digite o nome do cliente."
                );

                return;
            }


            const duplicado =
                clientes.some(
                    function (cliente) {

                        return String(
                            cliente.nome
                        )
                            .toLowerCase() ===
                            nome.toLowerCase();
                    }
                );


            if (duplicado) {

                alert(
                    "Este cliente já está cadastrado."
                );

                return;
            }


            clientes.push({

                nome:
                    nome,

                telefone:
                    telefone,

                observacao:
                    observacao
            });


            salvarLocalStorage(
                "clientes",
                clientes
            );


            alert(
                "Cliente cadastrado com sucesso!"
            );


            mostrarClientes();
        };


  document.getElementById(
    "pesquisaClienteCadastro"
).oninput =
    atualizarLista;

atualizarLista();

mostrarRetornosClientes();

document.getElementById(
    "btnServicosDia"
).onclick =
    function () {

        mostrarServicosPeriodoClientes(
            "dia"
        );

    };
document.getElementById(
    "btnServicosSemana"
).onclick =
    function () {

        mostrarServicosPeriodoClientes(
            "semana"
        );

    };
    document.getElementById(
        "btnServicosMes"
    ).onclick =
        function () {

            mostrarServicosPeriodoClientes(
                "mes"
            );

        };

    }
function mostrarServicosPeriodoClientes(
    periodoSelecionado
) {

    const servicos =
        lerLocalStorage(
            "servicos",
            []
        );

    const hoje =
        new Date();

    hoje.setHours(
        0,
        0,
        0,
        0
    );

    let servicosFiltrados =
        [];

    if (
        periodoSelecionado ===
        "dia"
    ) {

        servicosFiltrados =
            servicos.filter(
                function (servico) {

                    const dataISO =
                        converterDataServicoParaISO(
                            servico.data
                        );

                    if (!dataISO) {
                        return false;
                    }

                    const dataServico =
                        new Date(
                            dataISO +
                            "T12:00:00"
                        );

                    dataServico.setHours(
                        0,
                        0,
                        0,
                        0
                    );

                    return (
                        dataServico.getTime() ===
                        hoje.getTime()
                    );

                }
            );

    }


    if (
        periodoSelecionado ===
        "semana"
    ) {

        const diaSemana =
            hoje.getDay();

        const diferencaSegunda =
            diaSemana === 0
                ? 6
                : diaSemana - 1;

        const inicioSemana =
            new Date(
                hoje
            );

        inicioSemana.setDate(
            hoje.getDate() -
            diferencaSegunda
        );

        inicioSemana.setHours(
            0,
            0,
            0,
            0
        );

        const fimSemana =
            new Date(
                inicioSemana
            );

        fimSemana.setDate(
            inicioSemana.getDate() +
            6
        );

        fimSemana.setHours(
            23,
            59,
            59,
            999
        );

        servicosFiltrados =
            servicos.filter(
                function (servico) {

                    const dataISO =
                        converterDataServicoParaISO(
                            servico.data
                        );

                    if (!dataISO) {
                        return false;
                    }

                    const dataServico =
                        new Date(
                            dataISO +
                            "T12:00:00"
                        );

                    return (
                        dataServico >=
                        inicioSemana &&
                        dataServico <=
                        fimSemana
                    );

                }
            );

    }


    if (
        periodoSelecionado ===
        "mes"
    ) {

        const inicioMes =
            new Date(
                hoje.getFullYear(),
                hoje.getMonth(),
                1
            );

        inicioMes.setHours(
            0,
            0,
            0,
            0
        );

        const fimMes =
            new Date(
                hoje.getFullYear(),
                hoje.getMonth() + 1,
                0
            );

        fimMes.setHours(
            23,
            59,
            59,
            999
        );

        servicosFiltrados =
            servicos.filter(
                function (servico) {

                    const dataISO =
                        converterDataServicoParaISO(
                            servico.data
                        );

                    if (!dataISO) {
                        return false;
                    }

                    const dataServico =
                        new Date(
                            dataISO +
                            "T12:00:00"
                        );

                    return (
                        dataServico >=
                        inicioMes &&
                        dataServico <=
                        fimMes
                    );

                }
            );

    }


    let total =
        0;

    servicosFiltrados.forEach(
        function (servico) {

            total +=
                Number(
                    servico.valor
                ) || 0;

        }
    );


    const area =
        document.getElementById(
            "areaServicosPeriodo"
        );

    if (!area) {
        return;
    }


    let titulo =
        "Serviços de hoje";

    if (
        periodoSelecionado ===
        "semana"
    ) {

        titulo =
            "Serviços desta semana";

    }

    if (
        periodoSelecionado ===
        "mes"
    ) {

        titulo =
            "Serviços deste mês";

    }


    area.innerHTML = `

        <div class="financeiro-card">

            <strong>
                ${titulo}
            </strong>

            <span>
                ${servicosFiltrados.length}
                serviço(s)
            </span>

        </div>

        <div class="financeiro-card">

            <strong>
                Total
            </strong>

            <span>
                R$ ${formatarMoeda(total)}
            </span>

        </div>

        <input
            type="text"
            id="pesquisaServicoPeriodo"
            placeholder="Pesquisar cliente..."
        >

        <div
            id="listaServicosPeriodo"
            style="margin-top:15px;"
        >
        </div>

    `;


    function renderizarServicos() {

        const campoPesquisa =
            document.getElementById(
                "pesquisaServicoPeriodo"
            );

        const lista =
            document.getElementById(
                "listaServicosPeriodo"
            );

        const pesquisa =
            campoPesquisa.value
                .toLowerCase()
                .trim();

        const encontrados =
            servicosFiltrados.filter(
                function (servico) {

                    return String(
                        servico.cliente || ""
                    )
                        .toLowerCase()
                        .includes(
                            pesquisa
                        );

                }
            );


        if (
            encontrados.length ===
            0
        ) {

            lista.innerHTML = `

                <p class="vazio">
                    Nenhum serviço encontrado.
                </p>

            `;

            return;

        }


        lista.innerHTML =
            encontrados
                .map(
                    function (servico) {

                        return `

                            <div class="registro">

                                <strong>
                                    ${
                                        escaparHTML(
                                            servico.cliente
                                        )
                                    }
                                </strong>

                                <br>

                                Serviço: ${
                                    escaparHTML(
                                        servico.servico
                                    )
                                }

                                <br>

                                Barbeiro:
                                ${
                                    escaparHTML(
                                        servico.barbeiro ||
                                        "Não informado"
                                    )
                                }

                                <br>

                                Data: ${
                                    escaparHTML(
                                        servico.data ||
                                        "Sem data"
                                    )
                                }

                                <br>

                                Hora: ${
                                    escaparHTML(
                                        servico.hora ||
                                        "Sem horário"
                                    )
                                }

                                <br>

                                Pagamento: ${
                                    escaparHTML(
                                        servico.pagamento ||
                                        "Não informado"
                                    )
                                }

                                <br>

                                Valor:
                                <strong>
                                    R$ ${formatarMoeda(
                                        servico.valor
                                    )}
                                </strong>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    document.getElementById(
        "pesquisaServicoPeriodo"
    ).oninput =
        renderizarServicos;

    renderizarServicos();

}
function mostrarRetornosClientes() {

    const area =
        document.getElementById(
            "areaRetornosClientes"
        );

    if (!area) {
        return;
    }

    const clientes =
        lerLocalStorage(
            "clientes",
            []
        );

    const servicos =
        lerLocalStorage(
            "servicos",
            []
        );

    const hoje =
        new Date();

    hoje.setHours(
        0,
        0,
        0,
        0
    );

    const retornos = [];

    function criarDataLocal(dataISO) {

        if (!dataISO) {
            return null;
        }

        const partes =
            String(dataISO).split("-");

        if (partes.length !== 3) {
            return null;
        }

        const ano =
            Number(partes[0]);

        const mes =
            Number(partes[1]);

        const dia =
            Number(partes[2]);

        if (!ano || !mes || !dia) {
            return null;
        }

        const data =
            new Date(
                ano,
                mes - 1,
                dia
            );

        data.setHours(
            0,
            0,
            0,
            0
        );

        return data;
    }

    clientes.forEach(
        function (cliente) {

            if (
                !cliente ||
                !cliente.nome
            ) {
                return;
            }

            const nomeCliente =
                String(cliente.nome)
                    .trim()
                    .toLowerCase();

            const servicosCliente =
                servicos.filter(
                    function (servico) {

                        return (
                            String(
                                servico.cliente || ""
                            )
                                .trim()
                                .toLowerCase() ===
                            nomeCliente
                        );
                    }
                );

            if (
                servicosCliente.length === 0
            ) {
                return;
            }

            servicosCliente.sort(
                function (a, b) {

                    const dataA =
                        converterDataServicoParaISO(
                            a.data
                        );

                    const dataB =
                        converterDataServicoParaISO(
                            b.data
                        );

                    if (!dataA && !dataB) {
                        return 0;
                    }

                    if (!dataA) {
                        return 1;
                    }

                    if (!dataB) {
                        return -1;
                    }

                    const horaA =
                        a.hora || "00:00";

                    const horaB =
                        b.hora || "00:00";

                    const dataHoraA =
                        new Date(
                            dataA +
                            "T" +
                            horaA
                        );

                    const dataHoraB =
                        new Date(
                            dataB +
                            "T" +
                            horaB
                        );

                    return (
                        dataHoraB -
                        dataHoraA
                    );
                }
            );

            const ultimoServico =
                servicosCliente[0];

            const dataRetornoISO =
                calcularDataRetorno(
                    ultimoServico.data
                );

            const dataRetorno =
                criarDataLocal(
                    dataRetornoISO
                );

            if (!dataRetorno) {
                return;
            }

            let status = "";
            let classe = "";

            if (
                dataRetorno.getTime() ===
                hoje.getTime()
            ) {

                status =
                    "Retorno hoje";

                classe =
                    "retorno-hoje";

            } else if (
                dataRetorno < hoje
            ) {

                status =
                    "Retorno atrasado";

                classe =
                    "retorno-atrasado";

            } else {

                status =
                    "Próximo retorno";

                classe =
                    "retorno-proximo";
            }

            retornos.push({

                cliente:
                    cliente,

                ultimoServico:
                    ultimoServico,

                dataRetorno:
                    dataRetornoISO,

                dataRetornoDate:
                    dataRetorno,

                status:
                    status,

                classe:
                    classe
            });
        }
    );

    retornos.sort(
        function (a, b) {

            return (
                a.dataRetornoDate -
                b.dataRetornoDate
            );
        }
    );

    if (
        retornos.length === 0
    ) {

        area.innerHTML = `
            <p class="vazio">
                Nenhum retorno encontrado.
            </p>
        `;

        return;
    }

    area.innerHTML =
        retornos
            .map(
                function (item) {

                    const linkWhatsApp =
                        criarLinkWhatsAppRetorno(
                            item.cliente.telefone,
                            item.cliente.nome
                        );

                    return `
                        <div
                            class="registro ${item.classe}"
                        >

                            <strong>
                                ${escaparHTML(
                                    item.cliente.nome
                                )}
                            </strong>

                            <br>

                            ${item.status}

                            <br>

                            Último atendimento:
                            ${escaparHTML(
                                item.ultimoServico.data ||
                                "Sem data"
                            )}

                            ${
                                item.ultimoServico.hora
                                    ? `
                                        às
                                        ${escaparHTML(
                                            item.ultimoServico.hora
                                        )}
                                      `
                                    : ""
                            }

                            <br>

                            Retorno:
                            <strong>
                                ${formatarDataRetorno(
                                    item.dataRetorno
                                )}
                            </strong>

                            <br><br>

                            ${
                                linkWhatsApp
                                    ? `
                                        <a
                                            href="${linkWhatsApp}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="botao-principal"
                                            style="display:inline-block;text-decoration:none;text-align:center;"
                                        >
                                            WhatsApp
                                        </a>
                                      `
                                    : `
                                        <span>
                                            Sem WhatsApp cadastrado
                                        </span>
                                      `
                            }

                        </div>
                    `;
                }
            )
            .join("");
}

    // =====================================================
    // BARBEIROS
    // =====================================================

    function mostrarBarbeiros() {

        if (obterSessao().tipo !== "dono") {
            mostrarHome();
            return;
        }

        ativarMenu(
            "menuBarbeiros"
        );


        const barbeiros =
            lerLocalStorage(
                "barbeiros",
                []
            );


        app.innerHTML = `

            <div class="painel">

                <h2>
                    Barbeiros
                </h2>


                <button
                    class="botao-principal"
                    id="novoBarbeiro"
                >

                    Adicionar barbeiro

                </button>


                <div
                    id="caixaNovoBarbeiro"
                    style="display:none;"
                >

                    <label>
                        Nome do barbeiro
                    </label>

                    <input
                        type="text"
                        id="nomeBarbeiro"
                        placeholder="Nome"
                    >


                    <label>
                        Senha de acesso
                    </label>

                    <input
                        type="password"
                        id="senhaBarbeiro"
                        placeholder="Senha"
                    >


                    <button
                        class="botao-principal"
                        id="salvarNovoBarbeiro"
                    >

                        Salvar

                    </button>

                </div>


                <div
                    id="listaBarbeiros"
                    style="margin-top:20px;"
                >
                </div>

            </div>

        `;


        function atualizarBarbeiros() {

            const lista =
                document.getElementById(
                    "listaBarbeiros"
                );


            if (
                barbeiros.length ===
                0
            ) {

                lista.innerHTML = `

                    <p class="vazio">
                        Nenhum barbeiro cadastrado.
                    </p>

                `;

                return;
            }


            lista.innerHTML =
                barbeiros
                    .map(
                        function (
                            barbeiro,
                            indice
                        ) {

                            return `

                                <div class="registro">

                                    <strong>
                                        ${escaparHTML(
                                            barbeiro.nome
                                        )}
                                    </strong>

                                    <button
                                        class="botao-excluir"
                                        data-indice="${indice}"
                                    >

                                        Excluir

                                    </button>

                                </div>

                            `;
                        }
                    )
                    .join("");


            lista
                .querySelectorAll(
                    ".botao-excluir"
                )
                .forEach(
                    function (botao) {

                        botao.onclick =
                            function () {

                                excluirBarbeiro(
                                    Number(
                                        this.dataset.indice
                                    )
                                );
                            };
                    }
                );
        }


        document.getElementById(
            "novoBarbeiro"
        ).onclick =
            function () {

                document.getElementById(
                    "caixaNovoBarbeiro"
                ).style.display =
                    "block";
            };


        document.getElementById(
            "salvarNovoBarbeiro"
        ).onclick =
            function () {

                const nome =
                    document.getElementById(
                        "nomeBarbeiro"
                    ).value.trim();


                const senha =
                    document.getElementById(
                        "senhaBarbeiro"
                    ).value.trim();


                if (!nome) {

                    alert(
                        "Digite o nome do barbeiro."
                    );

                    return;
                }


                if (!senha) {

                    alert(
                        "Defina uma senha."
                    );

                    return;
                }


                const existe =
                    barbeiros.some(
                        function (barbeiro) {

                            return barbeiro.nome
                                .toLowerCase() ===
                                nome.toLowerCase();
                        }
                    );


                if (existe) {

                    alert(
                        "Esse barbeiro já está cadastrado."
                    );

                    return;
                }


                barbeiros.push({

                    nome:
                        nome,

                    senha:
                        senha
                });


                salvarLocalStorage(
                    "barbeiros",
                    barbeiros
                );


                preencherBarbeirosLogin();


                alert(
                    "Barbeiro cadastrado com sucesso!"
                );


                mostrarBarbeiros();
            };


        atualizarBarbeiros();
    }


    function excluirBarbeiro(
        indice
    ) {

        let barbeiros =
            lerLocalStorage(
                "barbeiros",
                []
            );


        if (
            indice < 0 ||
            indice >= barbeiros.length
        ) {

            return;
        }


        const nome =
            barbeiros[indice].nome;


        if (
            !confirm(
                "Deseja excluir o barbeiro " +
                nome +
                "?"
            )
        ) {

            return;
        }


        barbeiros.splice(
            indice,
            1
        );


        salvarLocalStorage(
            "barbeiros",
            barbeiros
        );


        preencherBarbeirosLogin();


        mostrarBarbeiros();
    }


    window.excluirBarbeiro =
        excluirBarbeiro;


    // =====================================================
    // FINANCEIRO
    // =====================================================

    function mostrarFinanceiro() {

    if (obterSessao().tipo !== "dono") {
        mostrarHome();
        return;
    }

    ativarMenu(
        "menuFinanceiro"
    );

    let servicos =
        lerLocalStorage(
            "servicos",
            []
        );

    const filtro =
        getFiltroBarbeiro();

    if (filtro) {

        servicos =
            servicos.filter(
                function (item) {

                    return (
                        item.barbeiro ===
                        filtro
                    );

                }
            );

    }

    app.innerHTML = `

        <div class="painel">

            <h2>
                Financeiro
            </h2>

            <p>
                Analise seu faturamento por período.
            </p>

            <div class="cards">

                <button
                    class="card"
                    id="financeiroHoje"
                >
                    <strong>
                        Hoje
                    </strong>

                    <small>
                        Faturamento do dia
                    </small>
                </button>


                <button
                    class="card"
                    id="financeiroSemana"
                >
                    <strong>
                        Esta semana
                    </strong>

                    <small>
                        Segunda a domingo
                    </small>
                </button>


                <button
                    class="card"
                    id="financeiroMes"
                >
                    <strong>
                        Este mês
                    </strong>

                    <small>
                        Mês atual
                    </small>
                </button>


                <button
                    class="card"
                    id="financeiroDia"
                >
                    <strong>
                        Escolher um dia
                    </strong>

                    <small>
                        Consulte uma data específica
                    </small>
                </button>


                <button
                    class="card"
                    id="financeiroMesEscolher"
                >
                    <strong>
                        Escolher um mês
                    </strong>

                    <small>
                        Consulte outro mês
                    </small>
                </button>

            </div>


            <div
                id="areaFinanceiroPeriodo"
                style="margin-top:25px;"
            >

                <p class="vazio">
                    Escolha um período para visualizar os resultados.
                </p>

            </div>

        </div>

    `;


    document.getElementById(
        "financeiroHoje"
    ).onclick =
        function () {

            mostrarFinanceiroPeriodo(
                "dia",
                new Date()
            );

        };


    document.getElementById(
        "financeiroSemana"
    ).onclick =
        function () {

            mostrarFinanceiroPeriodo(
                "semana",
                new Date()
            );

        };


    document.getElementById(
        "financeiroMes"
    ).onclick =
        function () {

            mostrarFinanceiroPeriodo(
                "mes",
                new Date()
            );

        };


    document.getElementById(
        "financeiroDia"
    ).onclick =
        function () {

            abrirEscolhaDataFinanceiro();

        };


    document.getElementById(
        "financeiroMesEscolher"
    ).onclick =
        function () {

            abrirEscolhaMesFinanceiro();

        };

}
// =====================================================
// FINANCEIRO POR PERÍODO
// =====================================================

function mostrarFinanceiroPeriodo(
    tipo,
    dataBase
) {

    let inicio;
    let fim;

    const data =
        new Date(dataBase);


    // ==============================
    // DEFINIR PERÍODO
    // ==============================

    if (tipo === "dia") {

        inicio =
            new Date(
                data.getFullYear(),
                data.getMonth(),
                data.getDate(),
                0,
                0,
                0,
                0
            );

        fim =
            new Date(
                data.getFullYear(),
                data.getMonth(),
                data.getDate() + 1,
                0,
                0,
                0,
                0
            );

    }


    if (tipo === "semana") {

        const diaSemana =
            data.getDay();

        const diferenca =
            diaSemana === 0
                ? 6
                : diaSemana - 1;

        inicio =
            new Date(
                data.getFullYear(),
                data.getMonth(),
                data.getDate() - diferenca,
                0,
                0,
                0,
                0
            );

        fim =
            new Date(
                inicio.getFullYear(),
                inicio.getMonth(),
                inicio.getDate() + 7,
                0,
                0,
                0,
                0
            );

    }


    if (tipo === "mes") {

        inicio =
            new Date(
                data.getFullYear(),
                data.getMonth(),
                1,
                0,
                0,
                0,
                0
            );

        fim =
            new Date(
                data.getFullYear(),
                data.getMonth() + 1,
                1,
                0,
                0,
                0,
                0
            );

    }


    // ==============================
    // SERVIÇOS
    // ==============================

    let servicos =
        lerLocalStorage(
            "servicos",
            []
        );


    const filtro =
        getFiltroBarbeiro();


    if (filtro) {

        servicos =
            servicos.filter(
                function (item) {

                    return (
                        item.barbeiro ===
                        filtro
                    );

                }
            );

    }


    // ==============================
    // CALCULAR RESULTADOS
    // ==============================

    let total = 0;

    let quantidade = 0;

    let dinheiro = 0;

    let pix = 0;

    let cartao = 0;

    let outro = 0;


    servicos.forEach(
        function (item) {

            if (!item.data) {
                return;
            }


            const partes =
                String(
                    item.data
                ).split("/");


            if (
                partes.length !== 3
            ) {
                return;
            }


            const dia =
                Number(partes[0]);

            const mes =
                Number(partes[1]) - 1;

            const ano =
                Number(partes[2]);


            const dataServico =
                new Date(
                    ano,
                    mes,
                    dia
                );


            if (
                dataServico >= inicio &&
                dataServico < fim
            ) {

                const valor =
                    Number(
                        item.valor
                    ) || 0;


                total += valor;

                quantidade++;


                const pagamento =
                    String(
                        item.pagamento ||
                        ""
                    ).toLowerCase();


                if (
                    pagamento ===
                    "dinheiro"
                ) {

                    dinheiro += valor;

                }
                else if (
                    pagamento ===
                    "pix"
                ) {

                    pix += valor;

                }
                else if (
                    pagamento ===
                    "cartão" ||
                    pagamento ===
                    "cartao"
                ) {

                    cartao += valor;

                }
                else {

                    outro += valor;

                }

            }

        }
    );


    // ==============================
    // COMISSÃO
    // ==============================

    const comissao =
        total * 0.50;


    const restante =
        total - comissao;


    // ==============================
    // TÍTULO
    // ==============================

    let titulo =
        "Financeiro";


    if (tipo === "dia") {

        titulo =
            "Financeiro — Hoje";

    }


    if (tipo === "semana") {

        titulo =
            "Financeiro — Esta semana";

    }


    if (tipo === "mes") {

        titulo =
            "Financeiro — Este mês";

    }


    // ==============================
    // MOSTRAR RESULTADO
    // ==============================

    const area =
        document.getElementById(
            "areaFinanceiroPeriodo"
        );


    if (!area) {
        return;
    }


    area.innerHTML = `

        <div class="painel">

            <h3>
                ${titulo}
            </h3>


            <div class="cards">

                <div class="card">

                    <strong>
                        Faturamento
                    </strong>

                    <p>
                        R$ ${formatarMoeda(total)}
                    </p>

                </div>


                <div class="card">

                    <strong>
                        Serviços
                    </strong>

                    <p>
                        ${quantidade}
                    </p>

                </div>


                <div class="card">

                    <strong>
                        Comissão (50%)
                    </strong>

                    <p>
                        R$ ${formatarMoeda(comissao)}
                    </p>

                </div>


                <div class="card">

                    <strong>
                        Restante
                    </strong>

                    <p>
                        R$ ${formatarMoeda(restante)}
                    </p>

                </div>

            </div>


            <h3 style="margin-top:25px;">
                Formas de pagamento
            </h3>


            <div class="cards">

                <div class="card">

                    Dinheiro

                    <strong>
                        R$ ${formatarMoeda(dinheiro)}
                    </strong>

                </div>


                <div class="card">

                    Pix

                    <strong>
                        R$ ${formatarMoeda(pix)}
                    </strong>

                </div>


                <div class="card">

                    Cartão

                    <strong>
                        R$ ${formatarMoeda(cartao)}
                    </strong>

                </div>


                <div class="card">

                    Outro

                    <strong>
                        R$ ${formatarMoeda(outro)}
                    </strong>

                </div>

            </div>


            <button
                class="botao-principal"
                id="voltarFinanceiro"
                style="margin-top:20px;"
            >

                ← Voltar

            </button>

        </div>

    `;


    const voltar =
        document.getElementById(
            "voltarFinanceiro"
        );


    if (voltar) {

        voltar.onclick =
            function () {

                mostrarFinanceiro();

            };

    }

}
function abrirEscolhaDataFinanceiro() {

    const data =
        document.createElement("input");

    data.type = "date";

    data.style.position = "fixed";
    data.style.left = "50%";
    data.style.top = "50%";
    data.style.transform = "translate(-50%, -50%)";
    data.style.zIndex = "9999";

    document.body.appendChild(data);

    data.focus();

    data.onchange =
        function () {

            const partes =
                this.value.split("-");

            if (partes.length !== 3) {
                return;
            }

            const ano =
                parseInt(partes[0]);

            const mes =
                parseInt(partes[1]) - 1;

            const dia =
                parseInt(partes[2]);

            const dataEscolhida =
                new Date(
                    ano,
                    mes,
                    dia
                );

            document.body.removeChild(data);

            mostrarFinanceiroPeriodo(
                "dia",
                dataEscolhida
            );
        };

    data.onclick =
        function () {
            if (data.showPicker) {
                data.showPicker();
            }
        };
}
function abrirEscolhaMesFinanceiro() {

    const data =
        document.createElement("input");

    data.type = "month";

    data.style.position = "fixed";
    data.style.left = "50%";
    data.style.top = "50%";
    data.style.transform = "translate(-50%, -50%)";
    data.style.zIndex = "9999";

    document.body.appendChild(data);

    data.focus();

    data.onchange =
        function () {

            const partes =
                this.value.split("-");

            if (partes.length !== 2) {
                return;
            }

            const ano =
                parseInt(partes[0]);

            const mes =
                parseInt(partes[1]) - 1;

            const dataEscolhida =
                new Date(
                    ano,
                    mes,
                    1
                );

            document.body.removeChild(data);

            mostrarFinanceiroPeriodo(
                "mes",
                dataEscolhida
            );
        };

    data.onclick =
        function () {
            if (data.showPicker) {
                data.showPicker();
            }
        };
}
    // =====================================================
    // CONTA
    // =====================================================

    function mostrarConta() {

        ativarMenu(
            "menuConta"
        );


        const conta =
            lerLocalStorage(
                "conta",
                {}
            );


        const sessao =
            obterSessao();


        let areaDono =
            "";


        if (
            sessao.tipo ===
            "dono"
        ) {

            const barbeiros =
                lerLocalStorage(
                    "barbeiros",
                    []
                );


            const filtroAtual =
                localStorage.getItem(
                    "filtroBarbeiro"
                ) || "";


            const opcoes =
                barbeiros
                    .map(
                        function (barbeiro) {

                            return `

                                <option
                                    value="${escaparHTML(
                                        barbeiro.nome
                                    )}"
                                    ${
                                        barbeiro.nome ===
                                        filtroAtual
                                            ? "selected"
                                            : ""
                                    }
                                >

                                    ${escaparHTML(
                                        barbeiro.nome
                                    )}

                                </option>

                            `;
                        }
                    )
                    .join("");


            areaDono = `

                <h3>
                    Senha do administrador
                </h3>


                <input
                    type="password"
                    id="novaSenhaAdmin"
                    placeholder="Nova senha"
                >


                <button
                    class="botao-principal"
                    id="salvarSenhaAdmin"
                >

                    Salvar senha

                </button>


                <h3>
                    Visualizar como barbeiro
                </h3>


                <select
                    id="filtroBarbeiroSelect"
                >

                    <option value="">
                        Todos os barbeiros
                    </option>

                    ${opcoes}

                </select>


                <button
                    class="botao-principal"
                    id="aplicarFiltroBarbeiro"
                >

                    Aplicar filtro

                </button>

            `;
        }


        const nomeExibido =
            sessao.tipo === "barbeiro"
                ? sessao.nome
                : (
                    conta.nome ||
                    "Minha Conta"
                );


        app.innerHTML = `

            <div class="painel">

                <h2>
                    ${escaparHTML(
                        nomeExibido
                    )}
                </h2>


                <label>
                    Nome
                </label>

                <input
                    type="text"
                    id="nomeConta"
                    value="${escaparHTML(
                        conta.nome || ""
                    )}"
                    placeholder="Nome da barbearia"
                >


                <label>
                    Telefone
                </label>

                <input
                    type="text"
                    id="telefoneConta"
                    value="${escaparHTML(
                        conta.telefone || ""
                    )}"
                    placeholder="Telefone"
                >


                <label>
                    Endereço
                </label>

                <input
                    type="text"
                    id="enderecoConta"
                    value="${escaparHTML(
                        conta.endereco || ""
                    )}"
                    placeholder="Endereço"
                >


                <button
                    class="botao-principal"
                    id="salvarConta"
                >

                    Salvar dados

                </button>


                ${areaDono}


                <button
                    class="botao-excluir"
                    id="btnSair"
                    style="
                        margin-top:20px;
                        width:100%;
                    "
                >

                    Sair

                </button>

            </div>

        `;


        document.getElementById(
            "salvarConta"
        ).onclick =
            function () {

                if (obterSessao().tipo !== "dono") {
                    alert("Somente o dono pode alterar os dados da barbearia.");
                    return;
                }

                salvarLocalStorage(
                    "conta",
                    {

                        nome:
                            document
                                .getElementById(
                                    "nomeConta"
                                )
                                .value
                                .trim(),

                        telefone:
                            document
                                .getElementById(
                                    "telefoneConta"
                                )
                                .value
                                .trim(),

                        endereco:
                            document
                                .getElementById(
                                    "enderecoConta"
                                )
                                .value
                                .trim()
                    }
                );


                alert(
                    "Dados salvos com sucesso!"
                );
            };


        document.getElementById(
            "btnSair"
        ).onclick =
            function () {

                sairDoApp();
            };


        if (
            sessao.tipo ===
            "dono"
        ) {

            document.getElementById(
                "salvarSenhaAdmin"
            ).onclick =
                function () {

                    const novaSenha =
                        document.getElementById(
                            "novaSenhaAdmin"
                        ).value.trim();


                    if (!novaSenha) {

                        alert(
                            "Digite uma nova senha."
                        );

                        return;
                    }


                    localStorage.setItem(
                        "senhaAdmin",
                        novaSenha
                    );


                    document.getElementById(
                        "novaSenhaAdmin"
                    ).value = "";


                    alert(
                        "Senha atualizada!"
                    );
                };


            document.getElementById(
                "aplicarFiltroBarbeiro"
            ).onclick =
                function () {

                    const filtro =
                        document.getElementById(
                            "filtroBarbeiroSelect"
                        ).value;


                    if (filtro) {

                        localStorage.setItem(
                            "filtroBarbeiro",
                            filtro
                        );

                    } else {

                        localStorage.removeItem(
                            "filtroBarbeiro"
                        );
                    }


                    alert(
                        "Filtro aplicado!"
                    );
                };
        }
    }


    // =====================================================
    // MENU INFERIOR
    // =====================================================

    const menuHome =
        document.getElementById(
            "menuHome"
        );


    const menuServicos =
        document.getElementById(
            "menuServicos"
        );


    const menuBarbeiros =
        document.getElementById(
            "menuBarbeiros"
        );


    const menuFinanceiro =
        document.getElementById(
            "menuFinanceiro"
        );

const menuClientes =
    document.getElementById("menuClientes");

if (menuClientes) {
    menuClientes.onclick =
        function () {

            mostrarClientes();

        };
}
    const menuConta =
        document.getElementById(
            "menuConta"
        );


    if (menuHome) {

        menuHome.onclick =
            function () {

                mostrarHome();
            };
    }


    if (menuServicos) {

        menuServicos.onclick =
            function () {

                mostrarTelaServicos();
            };
    }


    if (menuBarbeiros) {

        menuBarbeiros.onclick =
            function () {

                mostrarBarbeiros();
            };
    }


    if (menuFinanceiro) {

        menuFinanceiro.onclick =
            function () {

                mostrarFinanceiro();
            };
    }


  if (menuConta) {

    menuConta.onclick =
        function () {

            mostrarConta();
        };
}

});