const Eureka = require("eureka-js-client").Eureka;
const client = new Eureka({
    filename: 'eureka-client',
    cwd: __dirname
});
client.logger.level('debug');
client.start(function(error){
    console.log(error || 'complete');
});