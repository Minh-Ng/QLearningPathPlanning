define(['ReinforcementLearning'], function (rlearn) {
    //console.log('Loader Module Dependencies Loaded');
    var retModule = function () {
        this.config = null;
        this.module = null;

        this.start = function() {
            var timedOut = true;
            var xmlHttp = new XMLHttpRequest();

            function httpGetAsync(Url, callback) {
                xmlHttp.onreadystatechange = function() { 
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                        callback(xmlHttp.responseText);
                }
                xmlHttp.open("GET", Url, true); // true for asynchronous 
                xmlHttp.send(null);
            }

            function run(response) {
                timedOut = false;
                this.config = JSON.parse(response);
                this.module = new rlearn();

                this.module.create(this.config);
            }

            var data = httpGetAsync('/config/config.json', run);
            setTimeout(function() {
                if(timedOut) {
                    xmlHttp.abort();
                    console.log("Config request timed out"); 
                }
            }, 15000); // 15 second time out
        };
    };

    return retModule;
});
