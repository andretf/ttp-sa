"use strict";

// Energia: valor de f(s'). No caso de minimização, queremos minimizar a energia


var SA = SA || (function() {
    //#region Membros Privados

    //#endregion Membros Privados

    //#region Membros Publicos
    return {
        Inicializa: function(options) {},

        /**
         * Executa o algoritmo Simulated Annealing para uma Solução Inicial e os parâmetros de configuração
         * @param {array[][]}	solucao      	Solução inicial
         * @param {int}			temperatura		Temperatura inicial
         * @param {float}		alfa			fator de esfriamento entre 0 e 1
         * @param {int} 		maxIteracoes	máximo de iterações até esfriar
         * @param {int} 		maxPerturb		máximo de perturbações por iteração
         * @param {int} 		maxSucessos		limite de sucessos por iteração
         */
        Exec: function(solucao, temperatura, alfa, maxIteracoes, maxPerturb, maxSucessos) {
            $('#grafico').html('');
            $('#grafico').append('<div>Novo valor ótimo: ' + Math.floor(TTP.FuncaoObj(solucao) * 1000) / 1000 + ' (Solução: ' + Math.floor(solucao * 1000) / 1000 + ')</div>');

            var sucessos = 1;

            for (var i = 0; i < maxIteracoes * 1000 && temperatura >= 1 && sucessos > 0; i++) {
                // para limitar sucessos por iteração do arrefecimento
                sucessos = 0;

                // Criar e analisar diversas perturbações limitando a uma qtd de perturbações e sucessos
                for (var ip = 0; ip < maxPerturb * 1000 && sucessos < maxSucessos * 1000; ip++) {

                    // Tentar achar uma nova solução
                    var solucao_ = TTP.Perturba(solucao, temperatura);

                    if (TTP.FuncaoObj(solucao_) >= 0) {
                        var f = TTP.FuncaoObj(solucao);
                        var f_ = TTP.FuncaoObj(solucao_);

                        // Analisa e atualiza se a perturbação oferece melhor solução
                        var delta = f_ - f;
                        var e = Math.exp(-delta / temperatura);
                        if (delta < 0 || e > Math.random()) {
                            solucao = solucao_;
                            sucessos++;
                        }
                    }
                }

                // Arrefecer
                temperatura *= alfa;

                $('#grafico').append('<div>Novo valor ótimo: ' + Math.floor(TTP.FuncaoObj(solucao) * 1000) / 1000 + ' (Solução: ' + Math.floor(solucao * 1000) / 1000 + ')</div>');
            }

            return solucao;
        }
    }
    //#endregion Membros Publicos
})();
