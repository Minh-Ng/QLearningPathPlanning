// Load modules and use them together
require(['LoadConfig'], function(ReinforcementLearningLoader){
	//console.log('Main Module Dependencies Loaded');
    var module = new ReinforcementLearningLoader();
    module.start();
});