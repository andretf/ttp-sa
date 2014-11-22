var TTP = TTP || (function() {

    //#region Membros Privados


    /**
     * Gera matriz V(g) válida de visitantes, que dirá quando um jogo será em casa ou fora do time por rodada.
     * @param {times[]} times   lista dos times que se enfrentarão
     */
/*    function GeraVisitantes(times) {
        var calendario = [];
        var rodadas = 2 * (times.length - 1);
        var basket = geraCestas; // "cesta" de 0's e 1's disponíveis

        for (var j = 3; j < rodadas; j++) {
            // 1ª rodada: Escolha aleatoriamente os locais
            calendario[i] = [];

            for (var i = 0; j < times.length; j++) {
                calendario[i][j] = basket.times;
            }

        }

        return calendario;
    }
*/
    /**
     * Gera matriz V(g) válida do Calendário do torneio para cada time e rodada
     * @param {times[]} times   lista dos times que se enfrentarão
     */
    function GeraCalendario(times) {
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

            while(!rodadaPreenchida(calendario, j) && tentativas < 100){
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

                            UI.fillTableCell('V', i, j, oponente);
                            UI.fillTableCell('V', oponenteIndex, j, time);
                        }
                    }
                }
                catch(ex){

                }

                tentativas++;
            }

            if (tentativas === 100){
                console.log('Esgotou tentativas. Regera calendário.');
                return null;
            }
            cestas = cestaState;
        }

        return calendario;
    }


    //#endregion Membros Privados

    //#region Membros Publicos
    return {
        GeraSolucaoInicial: function(qtdTimes) {
            var timesEscolhidos = liga.slice(0, qtdTimes);
            var tentativas = 0;
            var calendarioCandidato = null;

            for (; tentativas < 100 && calendarioCandidato == null; tentativas++){
                calendarioCandidato = GeraCalendario(timesEscolhidos);
            }

            if (tentativas === 100){
                throw 'Máximo de tentativas esgotadas para gerar o calendário.';
            }

            return {
                calendario: calendarioCandidato,
                viagens: this.CriaMatrizViagens(calendarioCandidato)
            };
        },
        CriaMatrizViagens: function(calendario){
            var result = [];

            // dsi, dsj são índices correspondentes aos
            // índices 'i' e 'j' do jogo anterior
            var dsi, dsj;

            // Percorre cada oponente do calendario
            for (var i = 0; i < calendario.length; i++){
                result[i] = [];         // nova linha
                dsi = i;
                dsj = i;

                for (var j = 0; j < calendario[i].length; j++){

                    // Se item < 0: jogo-fora e faz viagem, senão joga em casa
                    dsj = (calendario[i][j] > 0)? i : - calendario[i][j] - 1;

                    result[i][j] = dataset[dsi][dsj];
                    UI.fillTableCell('A', i, j, result[i][j])
                    dsi = dsj;
                }

                // Volta pra casa
                // Se jogo anterior > 0: jogo foi em casa, permanece em casa (0)
                // Senão, jogo anterior foi fora, volta pra casa ([dsi][i])
                var j_ = calendario[i].length;
                result[i][j_] = (calendario[i][j_-1] > 0)? 0 : dataset[dsi][i];

                UI.fillTableCell('A', i, j, result[i][j_])
            }

            return result;
        },
        Perturba: function(solucao, temperatura) {
            return Math.max(0, Math.abs(solucao + (Math.random() - 0.5) * temperatura * 0.5));
        },

        /**
         * Calcula distância das rotas totais (Função objetivo) dada a Matriz das Viagens do calendário de jogos
         * @param {Array[][]} solucaoInicial Matriz de Viagens
         */
        FuncaoObj: function(solucao) {

            var valor = 0;

            for (var i = 0; i < solucao.length; i++){
                for (var j = 0; j < solucao[i].length; j++){
                    valor += solucao[i][j];
                }
            }
            
            return valor;
        }
    };
    //#endregion Membros Publicos
})();


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

    /** VARIÁVEIS: DESCRITAS E RENOMEADAS
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
    **/
    function sorteiaOponente(A, i, j, cestas){
        
        // oponente disponíveis para sorteio, após aplicação das restrições
        var disponiveis = cestas.porTime[i].filter(function(item, pos){
            return cestas.porRodada[j].indexOf(Math.abs(item)) > -1;             // restrições (1) e (2)
        });

        if (j > 0){
            util.popValue(disponiveis, -A[i][j-1]);                                    // restrição (3)

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













    function escolheOponenteIndex(calendario, i, j){
        var cesta = [];

        // Oponentes disponíveis para serem sorteiados:
        for (var cc = 0; cc < calendario.length; cc++){
            // se oponente está disponível nesta rodada (nem é o próprio time em questão), coloque-o no balaio do sorteio
            if (cc != i && calendario[cc][j] == undefined){
                cesta.push(cc);
            }
        }

        // Sorteia oponente
        var oponente = cesta[Math.floor(Math.random() * cesta.length)];

        return oponente;
    }

    function escolheOndeJogar(calendarioTime, oponente){
        // Look previous Match()
        for(var i = 0; i < calendarioTime.length; i++){ // retorna o jogo no outro local (casa/fora)
            if (Math.abs(calendarioTime[i]) == oponente){
                return - calendarioTime[i] / oponente;      
            }
        }

        return Math.random() < 0.5? -1: 1;
    }


    /**
     * Preecha a cesta com os elementos de maneira igual (mesmas quantidades)
     * @param  {int}        size        tamanho da cesta
     * @param  {array[]}    elementos   elementos a colocar na cesta
     */
    function equalFillBasket(size, elementos) {
        if (size % elementos.length > 0) {
            throw 'A cesta deve ter tamanho múltiplo da quantidade de elementos.';
        }

        var basket = [];
        var partitionSize = size / elementos.length; // tamanho de cada compartimento (qtas repetições do mesmo elemento)

        // Para cada compartimento da cesta
        for (var i = 0; i < size; i++) {
            basket.push(elementos[(size + i) % elementos.length]);
        }


        // Aleatoriza as posições na cesta:
        for (var i = 0; i < size * 2; i++) basket = basket.sort(function() { return Math.random() - 0.5 });

        return basket;
    }

    function geraCestas(timesQtd, rodadas){
        var result = {times:[], rodadas:[]};

        for (var i = 0; i < timesQtd; i++){
            result.times[i] = equalFillBasket(timesQtd, [0,1]);
        }
        for (var i = 0; i < rodadas; i++){
            result.rodadas[i] = equalFillBasket(rodadas, [0,1]);
        }

        return result;
    }
