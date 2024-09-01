//variables and constants
var LIVE = true;
var sync = 0;
var discordLink = "";
var discord_name = "";
var new_user_scan = false;
var scan_interval = 180000;
var scrollspeed = 1350;
var stop_scroll = 0;
var stop_scrollup = 0;
var stop_scrolldown = 0;
var guild_interval = 20000;
const guild_interval_Initial_delay = 10000;
var stop_scan = 0;
var stop_guild_check = 0; 
var prev_guild_size = 0; // input the previous size they have.
var scanning = false;
var username_safe = new Set();
var new_user_list = new Set();
var tab_ID = 0;
var webook = '';
var observer_on = false;
//const SBoxClass = '[class="members__573eb thin_b1c063 scrollerBase_f742b2 fade_ba0fa0 customTheme_e72fe3"]';
const SBoxClass = '[class="members_cbd271 thin_eed6a8 scrollerBase_eed6a8 fade_eed6a8 customTheme_eed6a8"]';
const MBoxClass = '[role="list"]';
const username_text = "name_c3d448 username__4a6f7 desaturateUserColors_eb6bd2";
var registering = false;

//systemic variable
var tricky_period = false;
var end_of_tricky_period = false;


//the eye
const eye = new MutationObserver(get_usernames);

console.log('Eye INJECTED');


//listener to control protocols
chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
  if (message.command === "Guild Update"){
	if(observer_on){
    //console.log(`Server size: ${message.data} members`);    
    decide_(parseInt(message.data));}

    return false
  }
  if (message.command === "start eye") {
    //discord link and tab ID
    tab_ID = message.info.id;
    discord_name = message.info.discord_name;
    
    //timing settings
    guild_interval = message.info.guild_interval;
    scrollspeed = message.info.scrollspeed;

     
    console.log(`${discord_name}:`, "Starting Oberver..");

    //change title of tab to server name
    document.getElementsByTagName('title')[0].innerText = message.info.discord_name; 

    console.log(`Tab Id: ${tab_ID}`);
    console.log(`Discord Name: ${discord_name}`);
   // console.log(`Invite Link: ${discordLink}`);

    //retrieve usernames data from local
    console.log(`${discord_name}:`, "Retrieving Usernames..");
    chrome.runtime.sendMessage({ command: "get usernames", id: tab_ID, name: discord_name }, function(response){
        //usernames_from_storage = JSON.parse(response.response);        
        console.log(`${discord_name}:`, "usernames retrieved");
        
/*
        console.log(response);
*/

        try{
          //username list
          let usernames_ = JSON.parse(response.response);
/*
          console.log(usernames_);

*/
          prev_guild_size = usernames_["guild_size"];
          webook = usernames_["webhook"];
	        discordLink = usernames_["link"];
          users_array = usernames_["usernames"];     

          //username list converted to set for unique element saving
          username_safe = new Set(users_array);
          console.log(username_safe);  

        }catch{console.log(`${discord_name}:`, "no usernames captured, please register server"); 
        return;
      }      
        
        // initiate scanning members and guild updating as interval calls
        start_observer();

    });

    return false
  }
  if (message.command === "register server"){
    registering = true;
    document.getElementsByTagName('title')[0].innerText = message.info.discord_name;

    //discord link and tab ID
    tab_ID = message.info.id;
    discord_name = message.info.discord_name;
    discordLink = message.info.discord_Link;
    webook = message.info.webhook

    console.log(`Tab Id: ${tab_ID}`);
    console.log(`Discord Name: ${discord_name}`);
    console.log(`Invite Link: ${discordLink}`);

    //timing settings
    scrollspeed = message.info.scrollspeed;

    let box = document.querySelector(SBoxClass);
    let members = box.querySelector('[role="list"]');

    scan_members(eye, box, members);
  }
  if (message.command === "stop eye") {
    if (observer_on){
      clearInterval(stop_scroll);
      clearInterval(stop_scrolldown);
      clearInterval(stop_scrollup);
      clearInterval(stop_guild_check);
      eye.disconnect();
      save();
      username_safe.clear();
      observer_on = false;
      
    }
    
    //return response
    console.log(`${discord_name}:`, "OBSERVER ENDED");
    return false

  }
  if (message.command === "train"){
    //discord link and tab ID
    tab_ID = message.info.id;
    discord_name = message.info.discord_name;
    
    //timing settings
    scrollspeed = message.info.scrollspeed;

    console.log(`${discord_name}:`, "Starting Oberver..");

    //change title of tab to server name
    document.getElementsByTagName('title')[0].innerText = message.info.discord_name; 

    console.log(`Tab Id: ${tab_ID}`);
    console.log(`Discord Name: ${discord_name}`);   

    //retrieve usernames data from local
    console.log(`${discord_name}:`, "Retrieving Usernames..");
    chrome.runtime.sendMessage({ command: "get usernames", id: tab_ID, name: discord_name }, function(response){
        //usernames_from_storage = JSON.parse(response.response);        
        console.log(`${discord_name}:`, "usernames retrieved");
        
/*
        console.log(response);
*/

        try{
          //username list
          let usernames_ = JSON.parse(response.response);
/*
          console.log(usernames_);

*/
          prev_guild_size = usernames_["guild_size"];
          webook = usernames_["webhook"];
	        discordLink = usernames_["link"];
          users_array = usernames_["usernames"];     

          //username list converted to set for unique element saving
          username_safe = new Set(users_array);
          
          console.log(username_safe);  
        }catch{console.log(`${discord_name}:`, "no usernames captured");}   
        
        let box = document.querySelector(SBoxClass);
        let members = box.querySelector('[role="list"]');
      
	      scan_members(eye, box, members);
    	  setInterval(()=>{if(!scanning){scan_members(eye, box, members);}}, 600000);

        setInterval(()=>{sendNotification(report, webhook);}, 3600000);
    });
  }
});


//eye's function
function get_discordUsername(string) {
  let htmlString = string;
  
  let match = htmlString.match(/aria-label="([^,]+),/);
  let username = match ? match[1] : null;
  
  return username;
}
function get_usernames(mutationsList) {
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for(const removedNode of mutation.removedNodes) {
        if (removedNode.innerHTML) {
          try{
            let userUID = get_discordUsername(removedNode.innerHTML);
            if (!username_safe.has(userUID)){
              username_safe.add(userUID); // add to main username list
              new_user_list.add(userUID); // add to new user suggestions
              
            }
          }catch (error) {console.error(`${discord_name}:`, error)}
        }
      }
    }
  }
}


/////operator functions
//starts the eye 
function start_observer() {
//scan check for guild-size every 5mins
   guild();
   sync += 1;
observer_on = true;
  stop_guild_check = setInterval( ()=>{
  if (!scanning){
    guild();

    sync += 1;
    if (sync > 4){
      tricky_period = true; //after we are done with the tricky period we shall set it false
      clearInterval(stop_guild_check);

    }
  }

  }, guild_interval ); // start 5min interval
}
//function to extract guild size
function guild() {
  chrome.runtime.sendMessage({
    command: "check guild size", 
    url: discordLink,
    id: tab_ID,
    name: discord_name
  })
  console.log(`${discord_name}:`, "Checking guild size..");  
}
//function compare previous and new guild size  
function decide_(guild_size) {
    //if starting
  if (guild_size === prev_guild_size){
    console.log("NO CHANGE.");
  }
  if (!tricky_period){
    if ( prev_guild_size === 0 ){
      prev_guild_size = guild_size;
    }
    if ( guild_size > prev_guild_size){    
      //update guild_size
      prev_guild_size = guild_size;
      console.log(`${discord_name}: INCREASED.`);
      console.log(`${discord_name}: Total Members ${prev_guild_size}`);

      //wait till not scanning
      wait_till_not_scanning(scanning);
      
      //start scan
      //this switch ensures that new users are saved exclusively and send to a discord server
      new_user_scan = true;
      
      let box = document.querySelector(SBoxClass);
      let members = box.querySelector('[role="list"]');

      inverted_scan_members_quick(eye, box, members);
    }
    // if guild didn't increase
    if (guild_size < prev_guild_size){
      //update guild_size 
      prev_guild_size = guild_size;

      console.log(`${discord_name}: REDUCED.`);
      console.log(`${discord_name}: Total Members ${prev_guild_size}`);
    }
  }else{
    if ( guild_size > prev_guild_size){
      wait_till_not_scanning(scanning);

      //update guild_size
      prev_guild_size = guild_size;
      console.log(`${discord_name}: INCREASED.`);
      console.log(`${discord_name}: Total Members ${prev_guild_size}`);
      
      new_user_scan = true;
    }

    let box = document.querySelector(SBoxClass);
    let members = box.querySelector('[role="list"]');

    inverted_scan_members(eye, box, members);
  }

}
//scan members func
function scan_members(eye, box, members) {
  //ngwa eye observe the observee
  eye.observe(members, { childList : true });

  //scan indicators
  scanning = true;
  console.log(`${discord_name}:`, "Scanning..");

  //scroll function
  scrollspeed = parseInt(scrollspeed);
  let x = 0;
  let y = scrollspeed;
  //console.log(y, typeof(y));
  //scroll down every 2 seconds
  stop_scroll = setInterval(() => {
    //scroll
    box.scrollTo(x,y);
    y += scrollspeed;
    //console.log(y, typeof(y));

    
    //check if bottom reached
    if ( y >= members.scrollHeight ){
      //stop scrolldown
      clearInterval(stop_scroll);
      // start scroll up every 2 seconds
      stop_scrollup = setInterval( () => {
        y -= scrollspeed;
        box.scrollTo(x,y);
        //check if top reached
        if (y <= members.scrollHeight*0){
          //stop scrolling up
          clearInterval(stop_scrollup);
          //reset params and save
          eye.disconnect();    
          
          //call afterscroll protocol
          after_scroll_protocol();
        }   

      }, 2500 );
    }
  }, 2500 );
}
//send notifications to discord
function sendNotification(arr_of_usernames, webhook) {
  unserialize_data = { usernames: arr_of_usernames }
  serialize_data = JSON.stringify(unserialize_data);

  chrome.runtime.sendMessage({
    command: 'send notification',
    webhook: webhook,
    data: serialize_data,
    id: tab_ID,
    name: discord_name
  });


}

////household functions
//save
function save() {
  console.log(`${discord_name}:`, "Saving..");
  unserialize_data = { guild_size: prev_guild_size, webhook: webook, link: discordLink, usernames: Array.from(username_safe) }
  serialize_data = JSON.stringify(unserialize_data);

  chrome.runtime.sendMessage({
    command: "save", 
    data: serialize_data, 
    id: tab_ID,
    name: discord_name },
    function (response){
      console.log(response.response)
    }
  );

  if(registering){
    registering = false;
    observer_on = false;
    console.log(`${discord_name}: Server registered to extension`);
  }else{
    console.log(`${discord_name}: Username Amount: ${username_safe.size}\nTotal Subscribers: ${prev_guild_size}`);
    Intel = (username_safe.size/prev_guild_size) * 100;
    Intel = Math.ceil(Intel * 100) / 100; 
  // console.log(`${discord_name}: Intel Size: ${Intel} % `);
  }
}

async function wait_till_not_scanning(operation) {
//wait if scanning is in progress
  return new Promise(resolve => {
    const interval_ = setInterval(() => {
      if (!operation){
        clearInterval(interval_);
        resolve();
      }else{}
    }, 30000);
  });
}
//after scroll
function after_scroll_protocol(){
  scanning = false;
  console.log(`${discord_name}:`, "Scan done !");
  let report = [`${username_safe.size }`];
  //sendNotification(report);

  //if someone just joined 
  if (new_user_scan) {
    //send message to discord
    new_user_scan = false;
    console.log("new_user_list:");
    console.log(new_user_list);
    console.log("username_safe:");
    console.log(username_safe);
//////////////////// this is where to start
  let new_user_list_modified = [];
  new_user_list.forEach((username)=>{
    new_user_list_modified.push(`${discord_name}: ${username}`);
  });
  //const new_user_list_string = Array.from(new_user_list).join('\n');

  //new_user_list_modified.push(`${discord_name}: \n${new_user_list_string}`);
  sendNotification(new_user_list_modified, webook);
  console.log(`${discord_name}: SENT.`);
  new_user_list.clear();
  }else{
    new_user_list.clear();
  }

  // end scanning and save data
  save();      

  //conditions for end of tricky period and beginning of new set of 5 guilds
  if (tricky_period){
    // end tricky period and reset count
    document.getElementsByTagName('title')[0].innerText = discord_name;
    tricky_period = false;
    sync = 0;
    start_observer();
  }
}

function inverted_scan_members(eye, box, members) {
  //ngwa eye observe the observee
  eye.observe(members, { childList : true });

  //scan indicators
  scanning = true;
  console.log(`${discord_name}:`, "Scanning..");

  //scroll function
  scrollspeed = parseInt(scrollspeed);
  let x = 0;
  let y = members.scrollHeight;
  //console.log(y, typeof(y));
  //scroll down every 2 seconds
  stop_scroll = setInterval(() => {
    //scroll
    box.scrollTo(x,y);
    y -= scrollspeed;
    //console.log(y, typeof(y));

    
    //check if bottom reached
    if ( y <= members.scrollHeight*0.1 ){
      //stop scrolldown
      clearInterval(stop_scroll);
    
      // start scroll up every 2 seconds
      stop_scrolldown = setInterval( () => {
        y += scrollspeed;
        box.scrollTo(x,y);
        //check if top reached
        if (y >= members.scrollHeight){
          //stop scrolling down
          clearInterval(stop_scrolldown);
          
          eye.disconnect(); 

          //call afterscroll protocol
          after_scroll_protocol();
        }   

      }, 2500 );

    }
  }, 2000 );
}
// target
function inverted_scan_members_quick(eye, box, members) {
  //ngwa eye observe the observee
  eye.observe(members, { childList : true });

  //scan indicators
  scanning = true;
  console.log(`${discord_name}:`, "Scanning..");

  //scroll function
  scrollspeed = parseInt(scrollspeed);
  let x = 0;
  let y = members.scrollHeight;
  //console.log(y, typeof(y));
  //scroll down every 2 seconds
  stop_scroll = setInterval(() => {
    //scroll
    box.scrollTo(x,y);
    y -= scrollspeed;
    //console.log(y, typeof(y));

    
    //check if bottom reached
    if ( y <= members.scrollHeight*0.1 ){
      //stop scrolldown
      clearInterval(stop_scroll);
      eye.disconnect(); 
      after_scroll_protocol();

      
    /*
      // start scroll up every 2 seconds
      stop_scrolldown = setInterval( () => {
        y += scrollspeed;
        box.scrollTo(x,y);
        //check if top reached
        if (y >= members.scrollHeight){
          //stop scrolling down
          clearInterval(stop_scrolldown);
          
          //call afterscroll protocol
          after_scroll_protocol();
        }   

      }, 2500 );

      */
    }
  }, 2000 );
}

