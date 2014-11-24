'use strict';

var TTP = (function() {

    //#region Membros Privados
    var dataset = [
        [   0,  745,  665,  929,  605,  521,  370,  587,  467,  670,  700, 1210, 2130, 1890, 1930, 1592],
        [ 745,    0,   80,  337, 1090,  315,  567,  712,  871,  741, 1420, 1630, 2560, 2430, 2440, 2144],
        [ 665,   80,    0,  380, 1020,  257,  501,  664,  808,  697, 1340, 1570, 2520, 2370, 2390, 2082],
        [ 929,  337,  380,    0, 1380,  408,  622,  646,  878,  732, 1520, 1530, 2430, 2360, 2360, 2194],
        [ 605, 1090, 1020, 1380,    0, 1010,  957, 1190, 1060, 1270,  966, 1720, 2590, 2270, 2330, 1982],
        [ 521,  315,  257,  408, 1010,    0,  253,  410,  557,  451, 1140, 1320, 2260, 2110, 2130, 1829],
        [ 370,  567,  501,  622,  957,  253,    0,  250,  311,  325,  897, 1090, 2040, 1870, 1890, 1580],
        [ 587,  712,  664,  646, 1190,  410,  250,    0,  260,   86,  939,  916, 1850, 1730, 1740, 1453],
        [ 467,  871,  808,  878, 1060,  557,  311,  260,    0,  328,  679,  794, 1740, 1560, 1590, 1272],
        [ 670,  741,  697,  732, 1270,  451,  325,   86,  328,    0, 1005,  905, 1846, 1731, 1784, 1458],
        [ 700, 1420, 1340, 1520,  966, 1140,  897,  939,  679, 1005,    0,  878, 1640, 1300, 1370, 1016],
        [1210, 1630, 1570, 1530, 1720, 1320, 1090,  916,  794,  905,  878,    0,  947,  832,  830,  586],
        [2130, 2560, 2520, 2430, 2590, 2260, 2040, 1850, 1740, 1846, 1640,  947,    0,  458,  347,  654],
        [1890, 2430, 2370, 2360, 2270, 2110, 1870, 1730, 1560, 1731, 1300,  832,  458,    0,  112,  299],
        [1930, 2440, 2390, 2360, 2330, 2130, 1890, 1740, 1590, 1784, 1370,  830,  347,  112,    0,  358],
        [1592, 2144, 2082, 2194, 1982, 1829, 1580, 1453, 1272, 1458, 1016,  586,  654,  299,  358,    0]
    ];



    function inicializaCestas_PorRodada(qtdTimes){
        // Cria conjunto de elementos (ID dos times) para colocar em cada cesta
        var valores = [];
        for (var i = 1; i <= qtdTimes; i++){
            valores.push(i);
        }

        // Inicializa cada cesta com os IDs dos times
        var cestas = [];
        for (var i = 1; i <= 2*(qtdTimes-1); i++){
            cestas.push(valores.slice());
        }

        return cestas;
    }
    
    function inicializaCestas_PorTime(qtdTimes){
        // Inicializa cada cesta com os IDs dos times
        var cestas = [];
        
        for (var i = 1; i <= qtdTimes; i++){
            
            // Cria conjunto de elementos (ID dos times) para colocar em cada cesta
            var valores = [];
            for (var j = 1; j <= qtdTimes; j++){
                if (i !== j){
                    valores.push(-j);
                    valores.push(j);
                }
            }

            cestas.push(valores);
        }

        return cestas;
    }

    /* Sorteia o oponente dada restrições. Ver nota no fim do arquivo. */
    function sorteiaOponente(A, i, j, cestas){
        
        // oponente disponíveis para sorteio, após aplicação das restrições
        var disponiveis = cestas.porTime[i].filter(function(item, pos){
            return cestas.porRodada[j].indexOf(Math.abs(item)) > -1;             // restrições (1) e (2)
        });

        if (j > 0){
            util.popValue(disponiveis, -A[i][j-1]);                              // restrição (3)

            if (j > 3){
                disponiveis = disponiveis.filter(function(item, pos){
                    var somaSinaisAnteriores = 0;

                    for (var k = 1; k <= 3 && k <= j; k++){
                        somaSinaisAnteriores += A[i][j-k] / Math.abs(A[i][j-k]);
                    }

                    somaSinaisAnteriores += item / Math.abs(item);

                    return somaSinaisAnteriores <= 3;                           // restrição (4)
                });
            }
        }

        if (!disponiveis || disponiveis.length === 0){
            throw 'Não pode ser escolhido o oponente do time "' + liga[i] + '" na rodada ' + j + '.';
        }

        // retorna o oponente sorteiado
        return disponiveis[Math.floor(Math.random() * disponiveis.length)];
    }

    function rodadaPreenchida(A, j){
        for(var i = 0; i < A.length; i++){
            if (A[i][j] == undefined){
                return false;
            }
        }

        return true;
    }

    /**
     * Gera matriz V(g) válida do Calendário do torneio para cada time e rodada
     * @param {times[]} times   lista dos times que se enfrentarão
     */
    function geraCalendario(times) {
        // Declara e inicializa calendario
        var calendario = [];
        for (var i = 0; i < times.length; i++){
            calendario.push([]);
        }

        var rodadas = 2 * (times.length - 1);
        var cestas = {
            porTime: inicializaCestas_PorTime(times.length),
            porRodada: inicializaCestas_PorRodada(times.length)
        }; // Cesta de seleção aleatória



        for (var j = 0; j < rodadas; j++) {
            // 1ª rodada: Escolha aleatoriamente seus oponentes, dadas as escolhas disponíveis

            var cestaState = cestas;
            var tentativas = 0;

            while(!rodadaPreenchida(calendario, j) && tentativas < 1000){
                cestas = cestaState;

                try {
                    for(var i = 0; i < times.length; i++){
                        // Aij = sorteiaOponente(A, i, j, cestas);

                        if (calendario[i][j] == undefined) {
                            // Se jogo inédito, randomiza locais, senão troca visitante<->casa
                            //var oponenteIndex = escolheOponenteIndex(calendario, i, j);
                            var oponente = sorteiaOponente(calendario, i, j, cestas);
                            var oponenteIndex = Math.abs(oponente)-1;
                            var time = (i+1) * - util.getSinal(oponente);

                            calendario[i][j] = oponente;
                            calendario[oponenteIndex][j] = time;

                            util.popValue(cestas.porTime[i], oponente);
                            util.popValue(cestas.porTime[i], time);

                            util.popValue(cestas.porRodada[j], Math.abs(oponente));
                            util.popValue(cestas.porRodada[j], Math.abs(time));

                            //UI.fillTableCell('V', i, j, oponente);
                            //UI.fillTableCell('V', oponenteIndex, j, time);
                        }
                    }
                }
                catch(ex){

                }

                tentativas++;
            }

            if (tentativas === 1000){
                console.log('Esgotou tentativas. Regera calendário.');
                return null;
            }
            cestas = cestaState;
        }

        return calendario;
    }

    function clonaMatriz(matriz){
        var clone = [];
    	
        for(var i = 0; i < matriz.length; i++){
            clone[i] = [];
            for(var j = 0; j < matriz[i].length; j++){
                clone[i].push(matriz[i][j]);
            }
        }

        return clone;
    }

    // Troca rodadas...
    function trocaColunas(A) {
        var swap;
        var qtdRodadas = A[0].length;
        var saveState_matriz = clonaMatriz(A);

        var combinacoes = [];
        for (var i = 0; i < A[0].length - 1; i++) {
            for (var j = 1; j < A[0].length; j++) {
                if (i !== j && combinacoes.filter(function (a) { return a[0] === j && a[1] === i }).length === 0) {
                    combinacoes.push([i, j]);
                }
            }
        }

        while (combinacoes.length > 0) {
            var comb = combinacoes.push();
            var j1 = comb[0];
            var j2 = comb[1];

            for (var i = 0; i < A.length; i++) {
                swap = A[i][j1];
                A[i][j1] = A[i][j2];
                A[i][j2] = swap;
            }

            if (TTP.SolucaoValida(A)) {
                break;
            }
            else {
                A = clonaMatriz(saveState_matriz);
            }
        }
        if (combinacoes.length === 0) {
            return null;
            //throw 'A matriz perturbada não é válida.';
        }

        return { calendario: A, viagens: TTP.CriaMatrizViagens(A) };
    }

    // Troca calendário entre 2 times
    function trocaLinhas(A) {
        var swap;
        var combinacoes = [];
        var saveState_matriz = clonaMatriz(A);

        for (var i = 0; i < A.length - 1; i++) {
            for (var j = 1; j < A.length; j++) {
                if (i !== j && combinacoes.filter(function (a) { return a[0] === j && a[1] === i }).length === 0) {
                    combinacoes.push([i, j]);
                }
            }
        }

        while (combinacoes.length > 0) {
            // Seleciona 2 times
            var comb = combinacoes.push();
            var i1 = comb[0];
            var i2 = comb[1];

            // rodadas onde ocorre confronto direto entre os 2 times selecionados
            var rodadas = [];

            for (var j = 0; j < A[0].length; j++) {
                // troca exceto se for entre eles mesmos (não queremos um time jogando com ele mesmo)
                if (Math.abs(A[i1][j]) !== i2+1 && Math.abs(A[i2][j]) !== i1+1) {
                    swap = A[i1][j];
                    A[i1][j] = A[i2][j];
                    A[i2][j] = swap;
                }
                else {
                    rodadas.push(j);
                }
            }

            if (TTP.SolucaoValida(A)) {
                break;
            }

            // Troca jogos entre times... evitar sequencias > 3
            swap = A[i1][rodadas[0]];
            A[i1][rodadas[0]] = A[i1][rodadas[1]];
            A[i1][rodadas[1]] = tmp;

            swap = A[i2][rodadas[0]];
            A[i2][rodadas[0]] = A[i2][rodadas[1]];
            A[i2][rodadas[1]] = tmp;

            if (TTP.SolucaoValida(A)) {
                break;
            }
            else {
                A = clonaMatriz(saveState_matriz);
            }
        }
        if (combinacoes.length === 0) {
            return null;
            //throw 'A matriz perturbada não é válida.';
        }

        return { calendario: A, viagens: TTP.CriaMatrizViagens(A) };
    }

    var perturb = {
        combinacoes: []
    };

    function trocaPosicoes(A) {
        // Seleciona 2 times
        var comb = perturb.combinacoes[Math.floor(Math.random() * perturb.combinacoes.length)];
        var i1 = comb[0];
        var i2 = comb[1];

        // tentativas
        for (var i = 0; i < A[0].length*10; i++) {
            var rodadas = [];
            // rodadas onde ocorre confronto direto entre os 2 times selecionados
            for (var j = 0; j < A[0].length; j++) {
                // adiciona se não for entre eles mesmos (não queremos um time jogando com ele mesmo)
                if (Math.abs(A[i1][j]) !== i2 + 1 && Math.abs(A[i2][j]) !== i1 + 1) {
                    rodadas.push(j);
                }
            }

            var swap;
            while (rodadas.length > 0) {
                var j = util.randomRemove(rodadas);
                swap = A[i1][j];
                A[i1][j] = A[i2][j];
                A[i2][j] = swap;

                if (TTP.SolucaoValida(A)) {
                    //console.log('Pertubou matriz com sucesso!');
                    return A;
                }
                else {
                    //console.log('Não pertubou sucesso!');
                }
            }
        }

        return null;
    }

    //#endregion Membros Privados

    //#region Membros Publicos
    return {
        GeraSolucaoInicial: function(qtdTimes) {
            if (qtdTimes == undefined){
                throw 'Quantidade de times não especificada para gerar a solução inicial.';
            }

            var timesEscolhidos = liga.slice(0, qtdTimes);
            var tentativas = 0;
            var calendarioCandidato = null;

            for (; tentativas < 100 && calendarioCandidato == null; tentativas++){
                calendarioCandidato = geraCalendario(timesEscolhidos);
            }

            if (tentativas === 100){
                throw 'Máximo de tentativas esgotadas para gerar o calendário.';
            }

            return {
                calendario: calendarioCandidato,
                viagens: this.CriaMatrizViagens(calendarioCandidato)
            };
        },
        // A perturbação ocorre quando alteramos a solução dada.
        // Nesse algoritmo, perturbar significará trocar 2 jogos:
        // trocar os oponentes de 2 times numa determinada rodada
        Perturba: function(solucao, temperatura, tempInicial) {
            if (!this.SolucaoValida(solucao.calendario)) {
                throw 'A matriz a ser perturbada não é válida.';
            }
            var A = clonaMatriz(solucao.calendario);
            //var perturbou = false;
            //var qtdRodadas = A[0].length;
            //var candidato;

            //if (candidato === null) {
            //    candidato = trocaColunas(A);
            //    if (candidato === null) {
            //        candidato = trocaLinhas(A);
            //    }
            //}

            for (var t = 0; t < temperatura; t++) {
                candidato = trocaPosicoes(A);
                if (candidato !== null) {
                    A = candidato;
                }
            }

            if (A === null) {
                return solucao;
            }

            return { calendario: A, viagens: TTP.CriaMatrizViagens(A) };
            //UI.atualizaTabela(A, 'O'); // debug
        },

        PreparaPertubacoes: function (solucao) {
            var A = solucao.calendario;

            perturb.combinacoes = [];
            for (var i = 0; i < A.length - 1; i++) {
                for (var j = i + 1; j < A.length; j++) {
                    if (i !== j) {
                        perturb.combinacoes.push([i, j]);
                    }
                }
            }
        },

        /**
         * Calcula distância das rotas totais (Função objetivo) dada a Matriz das Viagens do calendário de jogos
         * @param {Array[][]} solucaoInicial Matriz de Viagens
         */
        FuncaoObj: function(solucao) {
            var A = solucao.viagens;
            var valor = 0;

            for (var i = 0; i < A.length; i++){
                for (var j = 0; j < A[i].length; j++){
                    valor += A[i][j];
                }
            }
            
            return valor;
        },

        SolucaoValida: function (A) {
            var colunas = [];
            for (var i = 0; i < A.length; i++) {
                var somalinha = 0;

                for (var j = 0; j < A[i].length; j++) {
                    var absAtual = Math.abs(A[i][j]);

                    // Não pode jogar consigo mesmo
                    if (absAtual === i + 1) {
                        return false;
                    }
                    
                    // oponente * localidade deve ser único
                    if (A[i].lastIndexOf(A[i][j]) > j) {
                        return false;
                    }

                    // A x -B ou -B x A
                    if (A[i][j] === -A[absAtual - 1][j]) {
                        return false;
                    }

                    // Somente 1 jogo do time por rodada
                    if (colunas[j] === undefined) {
                        colunas[j] = [];
                    }
                    colunas[j].push(absAtual);
                    if (colunas[j].indexOf(absAtual) < i) {
                        return false;
                    }

                    if (j > 0) {
                        // Não deve ter sequencia de jogos A x B, B x A
                        if (absAtual === Math.abs(A[i][j - 1])) {
                             return false;
                        }

                        // Sequencia máx de 3 jogos em casa/fora
                        if (j > 2){
                            var soma = 0;
                            soma += A[i][j]   / absAtual;
                            soma += A[i][j-1] / Math.abs(A[i][j-1]);
                            soma += A[i][j-2] / Math.abs(A[i][j-2]);
                            soma += A[i][j-3] / Math.abs(A[i][j-3]);

                            if (soma === 4) {
                                return false;
                            }
                        }
                    }

                    somalinha += A[i][j];
                }

                // Somas das oponentes * localidade do time == 0
                if (somalinha !== 0) {
                     return false;
                }
            }

            return true;
        },

        CriaMatrizViagens: function (calendario){
            var result = [];

            // dsi, dsj são índices correspondentes aos
            // índices 'i' e 'j' do jogo anterior
            var dsi, dsj;

            try {
                // Percorre cada oponente do calendario
                for (var i = 0; i < calendario.length; i++) {
                    result[i] = []; // nova linha
                    dsi = i;
                    dsj = i;

                    for (var j = 0; j < calendario[i].length; j++) {

                        // Se item < 0: jogo-fora e faz viagem, senão joga em casa
                        dsj = (calendario[i][j] > 0) ? i : - calendario[i][j] - 1;

                        result[i][j] = dataset[dsi][dsj];
                        //UI.fillTableCell('A', i, j, result[i][j])
                        dsi = dsj;
                    }

                    // Volta pra casa
                    // Se jogo anterior > 0: jogo foi em casa, permanece em casa (0)
                    // Senão, jogo anterior foi fora, volta pra casa ([dsi][i])
                    var j_ = calendario[i].length;
                    result[i][j_] = (calendario[i][j_ - 1] > 0) ? 0 : dataset[dsi][i];

                    //UI.fillTableCell('A', i, j, result[i][j_])
                }
            }
            catch (ex) {
                result = [];
            }

            return result;
        },


        Info: function(qtdTimes){
            var info = [{
                    qtdTimes: 4,
                    feasibleSolution:   { value: 8276, ref: ''},
                    lowerBound:         { value: 8276, ref: ''}
                },{
                    qtdTimes: 6,
                    feasibleSolution:   { value: 23916, ref: '(Easton, May 7, 1999)'},
                    lowerBound:         { value: 22969, ref: '(Trick, May 1, 1999)'}
                },{
                    qtdTimes: 8,
                    feasibleSolution:   { value: 39721, ref: '(Easton, August 25 2002)'},
                    lowerBound:         { value: 38760, ref: '(Trick, Dec 15, 2000)'}
                },{
                    qtdTimes: 10,
                    feasibleSolution:   { value: 59436, ref: '(Langford, June 13, 2005)'},
                    lowerBound:         { value: 56506, ref: '(Waalewijn, July 2001)'}
                },{
                    qtdTimes: 12,
                    feasibleSolution:   { value: 110729, ref: '(Van Hentenryck and Vergados, May 30 2007)'},
                    lowerBound:         { value: 107483, ref: '(Waalewign August 2001)'}
                },{
                    qtdTimes: 14,
                    feasibleSolution:   { value: 188728, ref: '(Van Hentenryck and Vergados, May 18 2006)'},
                    lowerBound:         { value: 182797, ref: '(Waalewign August 2001)'}
                },{
                    qtdTimes: 16,
                    feasibleSolution:   { value: 261687, ref: '(Van Hentenryck and Vergados, May 30 2007)'},
                    lowerBound:         { value: 248852, ref: '(Easton January 2002)'}
                }
            ];

            return info.filter(function(element){
                return element.qtdTimes == qtdTimes;
            })[0];
        }

    };
    //#endregion Membros Publicos
})();




/**************  NOTAS *****************************
****************************************************
*
*
*
* 
* TTP.sorteiaOponente():
* ==================================================================
* VARIÁVEIS: DESCRITAS E RENOMEADAS
* ---------------------------
* Sendo,
* TimeID = i + 1;
* x = Time.ID * {  1: jogo em casa,
*                 -1: jogo fora de casa };
* A = Calendario
* i = linha atual;
* j = coluna atual;
*
* ALGORITMO:
* ---------------------------
* sorteiaOponente(A, i, j, cestas) x tal que:
* |x| Є cestas.porTime[j] &&                           (1)
*  x  Є cestas.porRodada[i] &&                         (2)
* |x| ≠ A[i][j-1] &&                                   (3)
* | (∑[k=1 to 3] A[i][j-k]/|A[i][j-k]| + x/|x| | ≤ 3   (4)
*
* Isto é:
* ---------------------------
* Nesta rodada E para este time (Calendario[i][j])
* (1) : oponente está na cesta pra ser sorteiado
* (2) : oponente E local está na cesta pra ser sorteiado
* (3) : não jogou com oponente na rodada anterior
* (4) : jogo não faz parte de sequencia > 3 de jogos em casa/fora
* 
* ==================================================================
* 
*/







// Seleciona 1 rodada
/*                var j = colunas[Math.floor(Math.random() * colunas.length)];
                util.popValue(colunas, j);

                
                if (Math.abs(A[i1][j]) !== i2+1 && Math.abs(A[i2][j]) !== i1+1){
                    var saveState = {
                        matriz : util.clonaMatriz(A),
                        j : parseInt(j),
                        colunas: colunas.slice()
                    };

                    // 1ª Perturbação
                    var swap = A[i1][j];
                    A[i1][j] = A[i2][j];
                    A[i2][j] = swap;
                    perturbou = true;

                    // Até ter uma solução válida, continua perturbando para ajustar a solução
                    var t = 0;
                    for (; t < 1000 && !this.SolucaoValida(A); t++){
                        // Procura por jogos duplicados de outras rodadas ainda não pertubadas, e os perturba
                        var j_ = [A[i1].indexOf(A[i1][j]), A[i1].lastIndexOf(A[i1][j])]
                        j_ = j_.filter(function(value) {
                            return colunas.indexOf(value) > -1;
                        });

                        if (j_.length > 0){
                            j = j_[Math.floor(Math.random() * j_.length)];
                            swap = A[i1][j];
                            A[i1][j] = A[i2][j];
                            A[i2][j] = swap;
                            util.popValue(colunas, j);
                        }
                        else{
                            var j_ = [A[i2].indexOf(A[i2][j]), A[i2].lastIndexOf(A[i2][j])]
                            j_ = j_.filter(function(value) {
                                return colunas.indexOf(value) > -1;
                            });

                            if (j_.length > 0){
                                j = j_[Math.floor(Math.random() * j_.length)];
                                swap = A[i1][j];
                                A[i1][j] = A[i2][j];
                                A[i2][j] = swap;
                                util.popValue(colunas, j);
                            }
                            else {
                                break;
                            }
                        }
                    }

                    if(!this.SolucaoValida(A)){
                        //console.log('Esgotadas as tentativas de perturbações e a solução continua inválida. Efetuano um rollback na pertubação.');
                        A = util.clonaMatriz(saveState.matriz);
                        j = saveState.j;
                        colunas = saveState.colunas;
                        perturbou = false;
                    }
                }
                

            if (!this.SolucaoValida(A)) {
                A = util.clonaMatriz(saveState.matriz);
                j = saveState.j;
                colunas = saveState.colunas;
                perturbou = false;

                console.log('fima: ' + TTP.FuncaoObj(solucao) + ' :: ' + TTP.SolucaoValida(solucao.calendario));
                //console.log('Esgotadas as tentativas de perturbações e a solução continua inválida. Efetuano um rollback na pertubação.');
                return solucao;
            }

            //UI.atualizaTabela(A, 'O');
            console.log('fim: '+ TTP.FuncaoObj({viagens: this.CriaMatrizViagens(A)}) + ' :: ' + TTP.SolucaoValida(A));
            return {
                calendario : A,
                viagens : this.CriaMatrizViagens(A)
            };
            */
