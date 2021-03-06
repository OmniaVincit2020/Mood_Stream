// Execute functions according to button clicks. Note the flexibility in the logic of clickWrapper(a,b,c,d,e,f) --
// it MUST have the first 4 arguments, but also works with either 5 or 6 args (extras as optional callbacks).
function buttonHandler(source){
  var name = source.name;
  var mode = document.getElementById('mode').value;
  switch (name){
    // This case toggles between seeing only the map, and seeing the map with the href crawl beside it. 
    case 'mapOnly':
      // Toggle the text of the togTextVis button from 'Hide Text Crawl' to 'Show Text Crawl' 
      toggleWithCallback(document.getElementById('togTextVis-btn').firstChild, 'data', 'Show Text Crawl', 'Hide Text Crawl');
      // Toggle the display of the text crawl from 'inline-block' to 'none'
      toggleWithCallback(document.getElementById('text').style, 'display', 'none', 'inline-block');
      // Toggle the width of the map between 73% and 100% -- only see the map, when it's 100%.
      toggleWithCallback(document.getElementById('map').style, 'width', '100%', '73%');
      break;
    // This case comes from the user entering new text in the subject field -- tells the map to 
    // reset it's id, as the current id will no longer apply to the new search. 
    case 'subject':
      map._resetLastId.call(map, ""); 
      break;
    // Toggles the visibility of form inputs, according to the 'mode' -- if the user has chosen to 
    // stream, they don't need to enter dates, so hide the date inputs. If they choose to search
    // twitter, the dates are needed, so toggle the date input visibility back on. 
    case 'mode': 
      toggleWithCallback(document.getElementById('startlabel').style, 'display', 'none','block');
      toggleWithCallback(document.getElementById('endlabel').style, 'display', 'none','block');      
      break;
    // When the form is submitted, show the buttons which relate to controlling the map view 
    // state (contained in 'hidden-div'), call the formSubmit to send the form data to the server, 
    // call batchHide to hide the elements of the form, and shrink the width of the map, while 
    // showing the text crawl in the space that the map shrinkage just freed up.  
    case 'submit':
      // Only execute all those action IF the form validates. 
      if (formValidates(mode)){
        document.getElementById('hidden-div').style.display = 'block';
        formSubmit();
        batchHide(['submit-btn','starterror','enderror','form']);
        document.getElementById('map').style.width = '73%'
        document.getElementById('text').style.display = 'inline-block';
      } else {
        // If user inputs of dates are invalid, call this function to show the error messages. 
        showErrorMsgs();
      }
      break;
    case 'pause':
      // The formValidates is only relevant to when the 'pause' button toggles to showing 'Resume Mapping',
      // in which case, the user input needs to be re-validated, as he/she may have entered new 
      // search parameters. 
      if (formValidates(mode)){
        toggleWithCallback(document.getElementById('pause-btn').firstChild, 'data', 'Resume Mapping', 'Pause Mapping', formSubmit, pauseStream);
        // On a successful submit, hide the form. Show it again when the button says 'Resume Mapping'.
        toggleWithCallback(document.getElementById('form').style, 'display', 'block', 'none');  
      } else {
        // Show the error messages, the same as in the 'submit' case above, if the search parameters when the 
        // user chooses to resume mapping are no longer valid. Basically, the 'submit' case is for the first
        // search entry; the 'pause' case (its alternate state being 'resume') will validate the 
        // submissions for all subsequent searches. 
        showErrorMsgs();
      }
      break;
    // Toggle the visibility of the circles by executing map._togCircVis, while changing the button's text
    // back and forth between 'Show Circles' and 'Hide Circles'. Note that the map._togCircVis method is 
    // checking the text, to make sure its actions will make sense with what the user is seeing. 
            
    case 'togCircVis':
      toggleWithCallback(document.getElementById('togCircVis-btn').firstChild, 'data', 'Show Circles', 'Hide Circles',
                         map._togCircVis.call(map, document.getElementById('togCircVis-btn').firstChild.data));
      break;
    case 'clear':
      resetGlobals();
      break;       
  }

/*
  Refer to Readme.md "III: toggleWithCallback(elem, prop, newVal, oldVal, newOnClickMthd, oldOnClickMthd)" for further explanation of this 
  function.
*/ 
  
  // Paraphrasing these arguments:
  // 0: The html element you want to change. 
  // 1: The property of that element you want to change. 
  // 2: The new value you want. 
  // 3: The value it currently is, which it will then be toggled back to, on the next click. 
  // 4: A callback that you want to fire whenever the button is clicked.
  // 5: A callback that you want to fire when the element is showing the value found in arguments[3].
  //    Including this means the callback in agument[4] will be associated with the value in arguments[2].
  function toggleWithCallback(elem, prop, newVal, oldVal, newOnClickMthd, oldOnClickMthd){
    elem[prop] == oldVal ? clickAction(newVal, oldOnClickMthd) : clickAction(oldVal, newOnClickMthd);

    // Always set the new value. If there's one callback given in "arguments[4]", use that callback
    // whenever this button is clicked. If both argument[4] and argument[5] are given, use argument[4]
    // when the element shows newVal, and argument[5] when the element shows oldVal. If only the first 
    // 4 arguments are given, this function will toggle the element between oldVal and newVal, and not 
    // fire any callbacks.
    function clickAction(value, callback){
      elem[prop] = value;
      // This condition is true when the second callback is not given, but the first is. In that case, 
      // assign callback to "newOnClickMthd", and fire it whenever the button is clicked.
      if (!callback && newOnClickMthd){
        callback = newOnClickMthd;
      }
      // If no callback is given, nothing happens here, and this function only toggles the "elem[prop]".
      if (callback){        
        callback();
      }
    }
  }

  // Reset the global variables that relate to the user's view. 
  function resetGlobals(){
    // Note that the "._clearCircles" will track the id of the last circle from the circles array. That 
    // info is not lost, when the user choses to clear the circles. 
    map._clearCircles();
    globalMood = {"mood" : [0,0,0], "count" : 1 };
    document.getElementById('text').innerHTML = '';
    document.getElementById('togCircVis-btn').style.display = 'none';
    document.getElementById('togCircVis-btn').firstChild.data = 'Hide Circles';    
  }

  // Takes an array of html elements, toggles their display to 'none'.
  function batchHide(toBeHidden){
    toBeHidden.forEach(function(elem){
      document.getElementById(elem).style.display = 'none';
    })
  }

  // Show error messages that were set in formValidates if the messages are not blank. 
  // The two show independently of one another; one, the other, or both, could show. 
  function showErrorMsgs(){
    show(startErrMsg, starterror);
    show(endErrMsg, enderror);

    // A helper function to cut down on repeating the logic for both operations. 
    function show(msg, html){
      if (msg.length > 0){      
        document.getElementById(html).innerHTML = msg;
        document.getElementById(html).style.display = 'block';          
      }
    }  
  }  
}
