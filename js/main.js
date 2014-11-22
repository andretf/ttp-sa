var liga = ['ATL', 'NYM', 'PHI', 'MON', 'FLA', 'PIT', 'CIN', 'CHI', 'STL', 'MIL', 'HOU', 'COL', 'SF', 'SD', 'LA', 'ARI'];
var dataset = [
    [0, 745, 665, 929, 605, 521, 370, 587, 467, 670, 700, 1210, 2130, 1890, 1930, 1592],
    [745, 0, 80, 337, 1090, 315, 567, 712, 871, 741, 1420, 1630, 2560, 2430, 2440, 2144],
    [665, 80, 0, 380, 1020, 257, 501, 664, 808, 697, 1340, 1570, 2520, 2370, 2390, 2082],
    [929, 337, 380, 0, 1380, 408, 622, 646, 878, 732, 1520, 1530, 2430, 2360, 2360, 2194],
    [605, 1090, 1020, 1380, 0, 1010, 957, 1190, 1060, 1270, 966, 1720, 2590, 2270, 2330, 1982],
    [521, 315, 257, 408, 1010, 0, 253, 410, 557, 451, 1140, 1320, 2260, 2110, 2130, 1829],
    [370, 567, 501, 622, 957, 253, 0, 250, 311, 325, 897, 1090, 2040, 1870, 1890, 1580],
    [587, 712, 664, 646, 1190, 410, 250, 0, 260, 86, 939, 916, 1850, 1730, 1740, 1453],
    [467, 871, 808, 878, 1060, 557, 311, 260, 0, 328, 679, 794, 1740, 1560, 1590, 1272],
    [670, 741, 697, 732, 1270, 451, 325, 86, 328, 0, 1005, 905, 1846, 1731, 1784, 1458],
    [700, 1420, 1340, 1520, 966, 1140, 897, 939, 679, 1005, 0, 878, 1640, 1300, 1370, 1016],
    [1210, 1630, 1570, 1530, 1720, 1320, 1090, 916, 794, 905, 878, 0, 947, 832, 830, 586],
    [2130, 2560, 2520, 2430, 2590, 2260, 2040, 1850, 1740, 1846, 1640, 947, 0, 458, 347, 654],
    [1890, 2430, 2370, 2360, 2270, 2110, 1870, 1730, 1560, 1731, 1300, 832, 458, 0, 112, 299],
    [1930, 2440, 2390, 2360, 2330, 2130, 1890, 1740, 1590, 1784, 1370, 830, 347, 112, 0, 358],
    [1592, 2144, 2082, 2194, 1982, 1829, 1580, 1453, 1272, 1458, 1016, 586, 654, 299, 358, 0]
];

$(document).ready(function() {
    // 
    $('#run').click(function() {
        try {
            var qtdTimes = InputValueToNumber('QtdTimes', 2, 16, 1);
            var temperatura = InputValueToNumber('Temperatura', 1, 10000, 1);
            var alfa = InputValueToNumber('Alfa', 0, 1, 0.001);
            var maxIteracoes = InputValueToNumber('MaxIteracoes', 0, 99999, 1);
            var maxPerturb = InputValueToNumber('MaxPerturb', 0, 999, 1);
            var maxSucessos = InputValueToNumber('MaxSucessos', 0, 999, 1);
        } catch (ex) {
            alert(ex);
        }


		$('#divSolucaoInicial').show();
        $('#solinicial-calendario').html(UI.geraEstruturaCalendario(liga, qtdTimes));
        $('#solinicial-viagens').html(UI.geraEstruturaViagens(liga, qtdTimes));

        UI.adicionaEventos('solinicial-calendario');
        UI.adicionaEventos('solinicial-viagens');

        var solucaoInicial = TTP.GeraSolucaoInicial(qtdTimes);
    	$('#solinicial-valor').text(TTP.FuncaoObj(solucaoInicial.viagens));

        //UI.preencheTabelaViagens(solucaoInicial.viagens);

        //var opt = SA.Exec(solucaoInicial, temperatura, alfa, maxIteracoes, maxPerturb, maxSucessos);
        //$('#result-optimal').html('Novo valor ótimo: ' + Math.floor(TTP.FuncaoObj(opt) * 1000) / 1000 + ' (Solução: ' + Math.floor(solucaoInicial * 1000) / 1000 + ')');
    });

});

function InputValueToNumber(idInput, min, max, precisao) {
    valor = $.trim($('#' + idInput).val());
    if (!parseFloat(valor) || !isFinite(valor)) {
        throw "Todos os campos são obrigatórios e devem ser numéricos.";
    }

    valor = Math.floor(valor * (1 / precisao)) * precisao;
    $('#' + idInput).val(valor);

    if (valor < min || valor > max) {
        throw 'O campo "' + $('#' + idInput).closest('label').replace + '" deve estar entre ' + min + ' e ' + max + ', inclusive';
    }

    return valor;
}


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
        return array.splice(Math.floor(Math.random() * array.length), 1);

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

/*
    preencheTabelaViagens: function(matriz){
    	for (var i = 0; i < matriz.length; i++){
	    	for (var j = 0; j < matriz.length; j++){
	    		this.fillTableCell('A', i, j, matriz[i][j]);
	    	}
    	}
    },*/


    /**
     * Preenche uma posição na tabela
     * @param  {string} prefixoMatriz Prefixo da Matriz
     * @param  {int} 	i             linha
     * @param  {int} 	j             coluna
     * @param  {int} 	value         valor a ser colocado na posição
     */
    fillTableCell: function(prefixoMatriz, i, j, value){
    	$(document.getElementById(prefixoMatriz+'['+i+']['+j+']')).text(value);
    }

};

