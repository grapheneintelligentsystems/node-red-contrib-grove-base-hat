var path = require('path');

module.exports = function(RED) {
    function GroveGestureSensorNode(config) {

        RED.nodes.createNode(this,config);

        this.port_name = "I2C";
        this.status({fill:"blue",shape:"dot",text:this.port_name});
        
        var node = this;
        var msg;

        const gpio_pin = this.port_number;
        const spawn = require('child_process').spawn;
        const grove_python = spawn('python', [ '-u' , path.join( __dirname , 'grove-gesture-sensor.py') ]);
        this.status({fill:"green",shape:"dot",text:this.port_name + " listened"});
        
        this.on("input", function(msg) {
            this.send(msg);
        });

        grove_python.stdout.on('data', (data) => {
            // console.log(`stdout: ${data}`);
            this.status({fill:"blue",shape:"dot",text:this.port_name + " value chanded"});
            let _self = this;

            msg = {};
            msg.payload = String(data).split("\n").join("");
            node.send(msg);
            
            setTimeout(
                function(){
                    _self.status({fill:"green",shape:"dot",text:_self.port_name + " listened"});
                },200
            )
            
        });
        
        grove_python.stderr.on('data', (data) => {
            // console.log(`stderr: ${data}`);
            this.status({fill:"red",shape:"ring",text:this.port_name + " error"});
            let jsonData = data.toString();
            msg = {};
            msg.payload = jsonData;
            node.send(msg);
        });
        
        grove_python.on('close', (code) => {
            this.status({fill:"red",shape:"ring",text:this.port_name + " disconnected"});

            // console.log(`child process exited with code ${code}`);
            let jsonData = "child process exited with code " + code;
            msg = {};
            msg.payload = jsonData;
            node.send(msg);
        });
    }
    RED.nodes.registerType("grove-gesture-sensor",GroveGestureSensorNode);
}
