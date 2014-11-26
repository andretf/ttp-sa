'use strict';

var liga = ['ATL', 'NYM', 'PHI', 'MON', 'FLA', 'PIT', 'CIN', 'CHI', 'STL', 'MIL', 'HOU', 'COL', 'SF', 'SD', 'LA', 'ARI'];

// Máximos de tentativas das iterações
// não definidos como parâmetro de entrada
var limites = {
    solInicial: 10, // em segundos
    preencherRodada: 100
};

$(document).ready(function() {
    // 
    $('#run').click(function () {
    	$('#results').hide();
    	$('#divSolucaoInicial').hide();
    	$('#solinicial-calendario').html('');
    	$('#solinicial-viagens').html('');
    	$('#solinicial-valor').text('');

    	//var bestOfAll = { si: 0, sf: 9999999, t : 0 };
    	//for (var n = 0; n < 30; n++) {
    	try {
    	    var qtdTimes = util.inputValueToNumber('QtdTimes', 2, 16, 1);
    	    var temperatura = util.inputValueToNumber('Temperatura', 1, 999999, 1);
    	    var alfa = util.inputValueToNumber('Alfa', 0, 1, 0.001);
    	    var maxIteracoes = util.inputValueToNumber('MaxIteracoes', 0, 999999, 1);
    	    var maxPerturb = util.inputValueToNumber('MaxPerturb', 0, 999999, 1);
    	    var maxSucessos = util.inputValueToNumber('MaxSucessos', 0, 9999, 1);

    	    $('#divSolucaoInicial').show();
    	    $('#solinicial-calendario').html(UI.geraEstruturaCalendario(liga, qtdTimes));
    	    $('#solinicial-viagens').html(UI.geraEstruturaViagens(liga, qtdTimes));

    	    UI.adicionaEventos('solinicial-calendario');
    	    UI.adicionaEventos('solinicial-viagens');

    	    //var perf = performance.now();
    	    var solucaoInicial = TTP.GeraSolucaoInicial(qtdTimes);

    	    // Funções de UI entram na conta da performance pq seu tempo computacional é desprezível
    	    $('#solinicial-valor').text(TTP.FuncaoObj(solucaoInicial));
    	    UI.atualizaTabela(solucaoInicial.calendario, 'V');
    	    UI.atualizaTabela(solucaoInicial.viagens, 'A');

    	    $('#results').show();
    	    var info = TTP.Info(qtdTimes);
    	    $('#instancia-feasible').text(info.feasibleSolution.value + ' ' + info.feasibleSolution.ref);
    	    $('#instancia-lowerbound').text(info.lowerBound.value + ' ' + info.lowerBound.ref);
    	    $('#result-optimal').text(' ');

    	    $('#solotima-calendario').html(UI.geraEstruturaOtima(liga, qtdTimes));
    	    UI.adicionaEventos('solotima-calendario');
    	    UI.atualizaTabela(solucaoInicial.calendario, 'O');

    	    var valorOtimo = SA.Exec(solucaoInicial, temperatura, alfa, maxIteracoes, maxPerturb, maxSucessos);
    	    //perf = performance.now() - perf;

    	    var fobj = TTP.FuncaoObj(valorOtimo);
    	    //var fsi = TTP.FuncaoObj(solucaoInicial);
            // Não conseguiu melhorar nada, descarta
    	    //if (fobj !== fsi) {
    	        //console.log(fsi + '\t' + fobj + '\t' + parseInt(perf) + 'ms')
    	    //}

    	    UI.atualizaTabela(valorOtimo.calendario, 'O');
    	    $('#result-optimal').text(fobj);

    	    /*if (fobj < bestOfAll.sf && fobj >= TTP.Info(qtdTimes).lowerBound.value && fobj !== fsi) {
    	        bestOfAll.si = fsi;
    	        bestOfAll.sf = fobj;
    	        bestOfAll.t = parseInt(perf);
    	    }*/
    	} catch (ex) {
    	    alert(ex);
    	}
    //}
    	//console.log('Melhor de todos (Si, Sf, ms):\n-------------------------------\n' + bestOfAll.si + '\t' + bestOfAll.sf + '\t' + bestOfAll.t);
    });

});


var util = util || {
    /**
     * Retorna e remove o elemento do array, de menor índice como critério de desempate.
     * @param  {Array}  array 	Array de onde será removido o elemento.
     * @param  {Object} value 	Valor do elemento a ser removido.
     * @return {[type]} Retorna o novo array.
     */
    popValue : function(array, value){
        var position = array.indexOf(value);
        if (~position){
            array.splice(position, 1);
        }
        return array;
    },
    /**
     * Retorna e remove todos as ocorrências do elemento do array.
     * @param  {Array}  array 	Array de onde será removido o elemento.
     * @param  {Object} value 	Valor do elemento a ser removido.
     * @return {[type]} Retorna o novo array.
     */
    popAllValues : function(array, value){
        var position = array.indexOf(value)
        while(~position){
            array.splice(position, 1);
            position = array.indexOf(value)
        }
        return array;
    },

    /**
     * Remove aleatoriamente 1 elemento do array, porém sem deixar somente elementos com mesmo valor absoluto.
     * @return {Object} Retorna o objeto retirado do array aleatoriamente.
     */
    randomRemove: function(array){
        return array.splice(Math.floor(Math.random() * array.length), 1)[0];
    },


    inputValueToNumber: function (idInput, min, max, precisao) {
        var valor = $.trim($('#' + idInput).val());
        if (!parseFloat(valor) || !isFinite(valor)) {
            throw "Todos os campos são obrigatórios e devem ser numéricos.";
        }

        valor = Math.floor(valor * (1 / precisao)) * precisao;
        $('#' + idInput).val(valor);

        if (valor < min || valor > max) {
            throw 'O campo "' + $('#' + idInput).closest('label').replace + '" deve estar entre ' + min + ' e ' + max + ', inclusive';
        }

        return valor;
    },

    /**
     * Check if value is a Number
     * @param  {[type]}  value [description]
     * @return {Boolean}       [description]
     */
    isNumber: function(value){
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    getSinal: function(value){
        if (!util.isNumber(value)){
            throw 'Impossível obter o sinal do valor, ele não é um número.';
            console.log(value);
        }

        return value/Math.abs(value);
    },

    swap: function(value1, value2){
    	var temp = value1;
    	value1 = value2;
    	value2 = temp;
    	return [value1, value2];
    },



    count: function(array, value){
    	return array.filter(function(item){
    		return item == value;
    	}).length;
    },

    countAbsoluto: function(array, value){
    	return array.filter(function(item){
    		return Math.abs(item) === value;
    	}).length;
    },


    matrizColuna: function(matriz, coluna){
    	var result = [];
    	
    	for (var i = 0; i < matriz.length; i++){
    		result.push(matriz[i][coluna]);
    	}

    	return result;
    },

    /**
     * Clona rapidamente a matriz.
     * @param  {array[][]} matriz matriz de origem
     * @return {array[][]}        Matriz clonada
     */
    clonaMatriz: function(matriz){
    	var clone = [];
    	
    	for(var i = 0; i < matriz.length; i++){
    		clone[i] = [];
	    	for(var j = 0; j < matriz[i].length; j++){
	    		clone[i].push(matriz[i][j]);
    		}
    	}

    	return clone;
    }
};


var UI = UI || {
	geraEstruturaCalendario: function(liga, qtdTimes){
        // Constrói tabela de Solução Inicial
        var html = '<tr><th>Times \\ Rodadas</th>';

        for(var i = 0; i < 2 * (qtdTimes - 1); i++){
            html += '<th style="text-align: center;">#'+(i+1)+'</th>';
        }
        html += '</tr>\n';
        for (var i = 0; i < qtdTimes; i++){
            html += '<tr><td class="time">'+(i+1)+': '+liga[i]+'</td>';

            for (var j = 0; j < 2 * (qtdTimes-1); j++){
                html += '<td id="V['+i+']['+j+']"></td>';
            }

            html += '</tr>';
        }

		return html;		
	},
	geraEstruturaOtima: function(liga, qtdTimes){
        // Constrói tabela de Solução Inicial
        var html = '<tr><th>Times \\ Rodadas</th>';

        for(var i = 0; i < 2 * (qtdTimes - 1); i++){
            html += '<th style="text-align: center;">#'+(i+1)+'</th>';
        }
        html += '</tr>\n';
        for (var i = 0; i < qtdTimes; i++){
            html += '<tr><td class="time">'+(i+1)+': '+liga[i]+'</td>';

            for (var j = 0; j < 2 * (qtdTimes-1); j++){
                html += '<td id="O['+i+']['+j+']"></td>';
            }

            html += '</tr>';
        }

		return html;		
	},
	geraEstruturaViagens: function(liga, qtdTimes){
        // Constrói tabela de Solução Inicial
        var html = '<tr><th>Times \\ Viagens</th>';

        for(var i = 0; i < 2 * (qtdTimes - 1); i++){
            html += '<th style="text-align: center;">'+i+' -> '+(i+1)+'</th>';
        }
        html += '<th style="text-align: center;">'+2*(qtdTimes-1)+' -> '+0+'</th>';

        html += '</tr>\n';
        for (var i = 0; i < qtdTimes; i++){
            html += '<tr><td class="time">'+(i+1)+': '+liga[i]+'</td>';

            for (var j = 0; j <= 2 * (qtdTimes-1); j++){
                html += '<td id="A['+i+']['+j+']"></td>';
            }

            html += '</tr>';
        }

		return html;		
	},

	adicionaEventos: function(tableId){
    	// Adiciona Eventos na tabela de Solução Inicial
        var $TabelaConteudo = $('#'+tableId+' td').not(':first-child');
        $('#'+tableId+' td:first-child').hover(function(){
        	var TimeID = $(this.parentNode).index();
    	    $(this.parentNode).addClass('line-selected');

        	$TabelaConteudo.each(function(index, element){
        		var conteudo = $(element).text();
			    if (conteudo == TimeID) {
			        $(element).addClass('jogo-casa');
			    }
			    else if (conteudo == -TimeID) {
			        $(element).addClass('jogo-fora');
			    }
			})
        }, function(){
    	    $(this.parentNode).removeClass('line-selected');
        	$TabelaConteudo.each(function(index, element){
		        $(element).removeClass('jogo-casa').removeClass('jogo-fora');
			})
        });

        $TabelaConteudo.hover(function(){
        	var TimeID = $(this.parentNode).index();
        	var OponenteID = Math.abs($(this).text());
        	var indices = [TimeID, OponenteID];

        	$('#'+tableId+' tr').filter(function(index) {
        		return indices.indexOf(index) > -1;
        	}).children().not(':first-child').each(function(index, element){
        		var conteudo = $(element).text();
			    if (conteudo == TimeID || conteudo == OponenteID) {
			        $(element).addClass('jogo-casa');
			    }
			    else if (conteudo == -TimeID || conteudo == -OponenteID) {
			        $(element).addClass('jogo-fora');
			    }
        	});
        }, function(){
        	$TabelaConteudo.each(function(index, element){
		        $(element).removeClass('jogo-casa').removeClass('jogo-fora');
			})
        });
    },

    /**
     * Preenche uma posição na tabela
     * @param  {string} prefixoMatriz Prefixo da Matriz
     * @param  {int} 	i             linha
     * @param  {int} 	j             coluna
     * @param  {int} 	value         valor a ser colocado na posição
     */
    fillTableCell: function(prefixoMatriz, i, j, value){
    	$(document.getElementById(prefixoMatriz+'['+i+']['+j+']')).text(value);
    },

    atualizaTabela: function(matriz, prefixoMatriz){
    	for(var i = 0; i < matriz.length; i++){
	    	for(var j = 0; j < matriz[i].length; j++){
		    	$(document.getElementById(prefixoMatriz + '['+i+']['+j+']')).text(matriz[i][j]);
		    }
	    }
    }
};

