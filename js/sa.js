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


//////////////////////////////////////////////////////////////////////////////
/*
(function() {

    Array.prototype.shuffle = function() {
        return this.sort(function() {
            return 0.5 - Math.random();
        });
    };

    Array.prototype.sum = function() {
        return this.reduce((function(a, b) {
            return a + b;
        }), 0);
    };

    this.onmessage = function(_arg) {
        var C, M, N, T, Tho, a, accepted, b, cost, costs, data, delta, deltas, dist, empty_round, i, id, links, local_cost, pick, pick2, swap, tried, updatecost, _i, _ref, _ref2, _ref3, _ref4, _ref5, _results;
        _ref = _arg.data, N = _ref.N, Tho = _ref.Tho, M = _ref.M, C = _ref.C;
        links = [];
        for (i = 0, _ref2 = N * N; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
            links[i] = [];
            if (i >= N) links[i].push(i - N);
            if (i < (N - 1) * N) links[i].push(i + N);
            if (i % N !== 0) links[i].push(i - 1);
            if (i % N !== N - 1) links[i].push(i + 1);
        }
        dist = function(a, b) {
            return Math.abs(a % N - b % N) + Math.abs(~~(a / N) - ~~(b / N));
        };
        costs = [];
        local_cost = function(id) {
            var c, link, _i, _len, _ref3;
            c = 0;
            _ref3 = links[id];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
                link = _ref3[_i];
                c += dist(data[id], data[link]);
            }
            return c;
        };
        updatecost = function(id) {
            var link, _i, _len, _ref3;
            _ref3 = links[id];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
                link = _ref3[_i];
                costs[link] = local_cost(link);
            }
            return costs[id] = local_cost(id);
        };
        swap = function(a, b) {
            var after, c, _ref3;
            c = costs[a] + costs[b];
            _ref3 = [data[b], data[a]], data[a] = _ref3[0], data[b] = _ref3[1];
            after = (updatecost(a)) + (updatecost(b));
            return 2 * (after - c);
        };
        pick = function() {
            return~~ (Math.random() * N * N);
        };
        pick2 = function() {
            var a, b;
            a = pick();
            b = pick();
            while (a === b) {
                b = pick();
            }
            return [a, b];
        };
        data = (function() {
            _results = [];
            for (var _i = 0, _ref3 = N * N; 0 <= _ref3 ? _i < _ref3 : _i > _ref3; 0 <= _ref3 ? _i++ : _i--) {
                _results.push(_i);
            }
            return _results;
        }).apply(this).shuffle();
        empty_round = 3;
        accepted = 1;
        costs = (function() {
            var _ref4, _results2;
            _results2 = [];
            for (id = 0, _ref4 = N * N; 0 <= _ref4 ? id < _ref4 : id > _ref4; 0 <= _ref4 ? id++ : id--) {
                _results2.push(local_cost(id));
            }
            return _results2;
        })();
        deltas = [];
        for (i = 0; i < 100; i++) {
            _ref4 = pick2(), a = _ref4[0], b = _ref4[1];
            deltas.push(Math.abs(swap(a, b)));
        }
        T = -(deltas.sum() / deltas.length) / Math.log(Tho);
        cost = costs.sum();
        while (accepted > 0 || empty_round >= 0) {
            if (accepted === 0) {
                empty_round -= 1;
            } else {
                empty_round = 3;
            }
            accepted = 0;
            tried = 0;
            while (accepted < 12 * M && tried < 100 * M) {
                tried += 1;
                _ref5 = pick2(), a = _ref5[0], b = _ref5[1];
                delta = swap(a, b);
                if (delta < 0 || Math.random() < Math.exp(-(delta + 1) / T)) {
                    accepted += 1;
                    cost += delta;
                } else {
                    swap(a, b);
                }
            }
            postMessage(['update', cost, T, accepted, tried, data, false]);
            T *= C;
            if (T < 1e-10) {
                postMessage(['log', 'Killed']);
                break;
            }
        }
        return postMessage(['update', cost, T, 0, 0, data, true]);
    };

}).call(this);
*/