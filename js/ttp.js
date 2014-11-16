var TTP = TTP || (function() {

    //#region Membros Privados

    //#endregion Membros Privados

    //#region Membros Publicos
    return {
        GeraSolucaoInicial: function() {
            return Math.random() * 100;
        },
        Perturba: function(solucao, temperatura) {
            return Math.max(0, Math.abs(solucao + (Math.random() - 0.5) * temperatura * 0.5));
        },
        FuncaoObj: function(solucao) {
            //return 4*Math.sin(solucao) + solucao;
            //return 4*Math.sin(solucao) + 4*Math.cos(solucao) + 2*solucao;
            return -solucao + 100;
        }
    };
    //#endregion Membros Publicos
})();