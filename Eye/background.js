
permitted_link = "https://discord.com/channels/*";
//all server guilds property
const guilds = {};

class GuildManager{
  constructor(name, mID, discordlink){ //server name instead?
    this.name = name;
    this.main_tabId = mID;
    this.link = discordlink;
    this.tabcheck = false;
    this.nID = null;
  }
}

/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if ( tab.url && tab.url.includes(permitted_link) ) {
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      files: ["observant.js"]
    });
  }




});//CHECK
*/


chrome.runtime.onMessage.addListener( (message, sender, sendResponse) =>{
     
    // go to storage and get usernames for case tab
    if (message.command === "get usernames") {  
      console.log(`${message.name} : Requesting usernames`);
     
      
      //pull usernames from storage
      chrome.storage.local.get(String(message.name), 
        (data) => {
            console.log(`${message.name}: `);
            console.log(data);
            let usernames_ = data[String(message.name)];
            let link_ = usernames_["link"];

            console.log(usernames_);
            serialize_data = JSON.stringify(usernames_);
           
            let guild_object = new GuildManager( message.name, message.id, link_ );
            guilds[String(message.name)] = guild_object;
            console.log(`${message.name} : New guild created`);
            console.log(guilds);

            //send a reponse to sender containing all saved usernames
            sendResponse({ response : serialize_data });
            console.log(`${message.name} : Usernames retrieved!`);
      });

      return true 
    }
    //create guild and tab to retrieve guild size A
    if (message.command === "check guild size"){ 
      console.log(`${message.name}: Requesting Guild size check`);
      
      let guild_object = guilds[String(message.name)];

      chrome.tabs.create({url: message.url}, (newTab)=>{
        guild_object.nID = newTab.id;
    });
        console.log(guild_object)
    
        console.log(guild_object.nID);
        setTimeout(()=>{
          chrome.scripting.executeScript({
            target: {tabId: guild_object.nID},
            func: getNumber,
            args: [guild_object.nID, message.id, message.name]
          });
        }, 15000);
    
    
      return false
    }
    //create guild and tab to retrieve guild size B
    if (message.command === "reinject getNumber") {
      setTimeout(()=>{      
        chrome.scripting.executeScript({
          target: { tabId: message.tabId },
            func: getNumber, 
            args: [message.tabId, message.mainId, message.name]
          });
          console.log("reinjected getNumber");
      }, 10000);

      return false
      
    }  
    //create guild and tab to retrieve guild size C
    if (message.command === "send Guild Size"){
      console.log(message.data);

      let key = message.mainId;
      let discord_name = message.name;
    	console.log(discord_name);

      chrome.tabs.sendMessage(key, { command: "Guild Update", data: message.data });

      chrome.tabs.remove(message.tabId, ()=> {
        console.log(`${discord_name} : Guild Update sent`);
      });

      return false

    }
    //inject observant to a page
    if (message.command === "insert obj"){
        chrome.scripting.executeScript({
          target: {tabId: message.tabId},
          files: ["observant.js"]
        });

        return false
    }
    //save username SET  
    if (message.command === "save"){

      console.log(`${message.name} : Requesting Save`);
      let deserializedData = JSON.parse(message.data);

      //chrome.storage.local save into existing list
      chrome.storage.local.set({ [message.name]: deserializedData },
      () => {
          sendResponse({response: "Saved!"});
          console.log(`${message.name} : Save completed !`);
      
      }
      ); 
      return true      
    }
    //send
    if (message.command === 'send notification') {
      let arr_of_usernames = JSON.parse(message.data);
      
      console.log("USERNAMES TO SEND:");
      console.log(arr_of_usernames);
      arr_of_usernames = arr_of_usernames["usernames"];
      
      arr_of_usernames.forEach((username) => {
        const webhookUrl = message.webhook;
        //console.log(`${message.name}: Sending Notifications to discord`);
        console.log(`${message.name}: Sending Notification for ${username}`);
        
        const maxRetries = 5; // Maximum number of retries
        let retries = 0;
        
        const sendWebhook = () => {
          fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: username
            })
          }).then(response => {
            if (!response.ok) {
              retries++;
              if (retries <= maxRetries) {
                console.log(`${message.name}: Retrying (${retries}/${maxRetries}) for ${username}`);
                sendWebhook(); // Retry sending
              } else {
                console.log(`${message.name}:`, `Error sending webhook message: ${username}`, response.statusText);
              }
            } else {
              console.log(`${message.name}:`, 'Webhook message sent successfully.');
            }
          }).catch(error => {
            retries++;
            if (retries <= maxRetries) {
              console.error(`${message.name}: Retrying (${retries}/${maxRetries}) for ${username}`);
              sendWebhook(); // Retry sending
            } else {
              console.error(`${message.name}:`, `Error sending webhook message: ${username}`, error);
            }
          });
        };
        
        sendWebhook(); // Initial call to send the webhook
      });
    }

/*
    if (message.command === 'send notification') {


      let arr_of_usernames = JSON.parse(message.data);
      
      console.log("USERNAMES TO SEND:");
      console.log(arr_of_usernames);
      arr_of_usernames = arr_of_usernames["usernames"];
      
      arr_of_usernames.forEach((username)=>{
      //const webhookUrl = server_webhook;    
      const webhookUrl = message.webhook;
      console.log(`${message.name}: Sending Notification`);
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: username
        })
      }).then(response => {
        if (!response.ok) {
          console.log(`${message.name}:`, `Error sending webhook message: ${username}`, response.statusText);
        } else {
          console.log(`${message.name}:`, 'Webhook message sent successfully.');
        }
      }).catch(error => {
        console.error(`${message.name}:`, `|Error sending webhook message|: ${username}`, error);
      });


      });
      

    }*/


});


//functions
function getNumber(param, main_param, name){
const memberSizeClass = '[class="defaultColor_a595eb text-sm/normal_dc00ef pillMessage_b83a05"]';
  console.log("extracting member count");

  try{
   let member_size = document.querySelectorAll(memberSizeClass)[1].textContent;
    let xList = member_size.match(/\d+/g).map(String);
    let x = xList.join("");
    console.log(member_size);
    console.log(x);
    console.log(param);
    
    chrome.runtime.sendMessage( {command: "send Guild Size", tabId: param, mainId: main_param, name: name, data: x} );
  } catch {
    console.log(param);
    
    chrome.runtime.sendMessage( {command: "reinject getNumber", tabId: param, mainId: main_param, name: name} );
  }
}


 async function wait_till(operation) {
  //wait if scanning is in progress
    return new Promise(resolve => {
      const interval_ = setInterval(() => {
        if (!operation){
          clearInterval(interval_);
          resolve();
        }else{}
      }, 5000);
    });
  }

/*
//send info to background console
if (message.command === "ping"){
  console.log(`${message.name}: Ping!`);
}
*/






