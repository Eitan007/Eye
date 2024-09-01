const start_observer_btn = document.getElementById("start");//buttons
const register_btn = document.getElementById("register");
const inject_btn = document.getElementById("inject");
const train_btn = document.getElementById("train");
const stop_observer_btn = document.getElementById("stop");
const time_conversion_rate = 60000;//conversion to milliseconds
var discord_name = '';
var discord_Link = '';
//this webhook will be removed
var webhook = ""
var scrollspeed = 1700;
var guild_interval = 20000;


//functions for buttons
function register_server(){
    //get input details
    const inputs = document.querySelectorAll('input[type="text"]');
try{
    discord_name = inputs[0].value;
    discord_Link = inputs[1].value;
    scrollspeed = document.getElementById("speed").value;
    guild_interval = document.getElementById("guild").value * time_conversion_rate;
    
    //take Inputs
    webhook = document.getElementById("webhook").value;
}catch{console.log("Input all spaces"); return;}
    //send register to tab
    chrome.tabs.query( {active: true, currentWindow: true },
        function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                command : "register server", info: {
                    id: activeTab.id, 
                    discord_Link: discord_Link, 
                    discord_name: discord_name,
                    webhook: webhook,
                    scrollspeed: scrollspeed,
                    guild_interval: guild_interval
                }
            });
        }
    );

}
function train(){
    //get input details
    const inputs = document.querySelectorAll('input[type="text"]');
 
    discord_name = inputs[0].value;
    scrollspeed = document.getElementById("speed").value;

    //send message to tab 
    chrome.tabs.query( {active: true, currentWindow: true},
        function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                command : "train",
                info: {
                    id: activeTab.id,
                    discord_name: discord_name,
                    scrollspeed: scrollspeed
                }
            });
        }
    );

}
function send_start(){
    //get input details
    const inputs = document.querySelectorAll('input[type="text"]');
 
    discord_name = inputs[0].value;
    scrollspeed = document.getElementById("speed").value;
    guild_interval = document.getElementById("guild").value * time_conversion_rate;
    
/*
    console.log(`Discord name: ${discord_name}`);
    console.log(`Discord Link: ${discord_Link}`);
    console.log(`Scan Interval: ${webhook}`);
    console.log(`Scroll speed: ${scrollspeed}`);
    console.log(`Guild Interval: ${guild_interval}`);
*/

    //send message to tab 
    chrome.tabs.query( {active: true, currentWindow: true},
        function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                command : "start eye",
                info: {
                    id: activeTab.id,
                    discord_name: discord_name,
                    scrollspeed: scrollspeed,
                    guild_interval: guild_interval
                }
            });
        }
    );
}
function inject(){    
    //tell background to inject
    chrome.tabs.query( {active: true, currentWindow: true },
        function(tabs) {
            var activeTab = tabs[0];
            chrome.runtime.sendMessage({
                command: "insert obj", 
                tabId: activeTab.id
            });
        }
    );
}
function send_stop(){
    //send stop
    chrome.tabs.query( {active: true, currentWindow: true },
        function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                command : "stop eye", 
                info: {
                    id: activeTab.id, 
                }
            });
        }
    );
}

//click events
start_observer_btn.addEventListener("click", send_start);
register_btn.addEventListener("click", register_server);
inject_btn.addEventListener("click", inject);
train_btn.addEventListener("click", train);
stop_observer_btn.addEventListener("click", send_stop);
