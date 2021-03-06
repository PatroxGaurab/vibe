/****************************************************
 * Fetch Indian events from reps.mozilla.org and 
 * write the data to a data file in same folder.
 ***************************************************/

var https = require('https');
var fs = require('fs');
var isFirstRequest = true;
var dateToday = new Date();
var dateString = dateToday.getFullYear() + "-" + (dateToday.getMonth()+1) + "-" + dateToday.getDate()
var repsUri = 'https://reps.mozilla.org/api/v1/event/?offset=0&limit=0&start__gte=' + dateString + '&query=india';

/*jslint white: true, devel: true, onevar: true, browser: true, undef: true, nomen: true, regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50, indent: 4 */
var jsl = typeof jsl === 'undefined' ? {} : jsl;

/**
 * jsl.format - Provide json reformatting in a character-by-character approach, so that even invalid JSON may be reformatted (to the best of its ability).
 *
**/
jsl.format = (function () {

    function repeat(s, count) {
        return new Array(count + 1).join(s);
    }

    function formatJson(json) {
        var i           = 0,
            il          = 0,
            tab         = "    ",
            newJson     = "",
            indentLevel = 0,
            inString    = false,
            currentChar = null;
        for (i = 0, il = json.length; i < il; i += 1) { 
            currentChar = json.charAt(i);

            switch (currentChar) {
            case '{': 
            case '[': 
                if (!inString) { 
                    newJson += currentChar + "\n" + repeat(tab, indentLevel + 1);
                    indentLevel += 1; 
                } else { 
                    newJson += currentChar; 
                }
                break; 
            case '}': 
            case ']': 
                if (!inString) { 
                    indentLevel -= 1; 
                    newJson += "\n" + repeat(tab, indentLevel) + currentChar; 
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ',': 
                if (!inString) { 
                    newJson += ",\n" + repeat(tab, indentLevel); 
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ':': 
                if (!inString) { 
                    newJson += ": "; 
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ' ':
            case "\n":
            case "\t":
                if (inString) {
                    newJson += currentChar;
                }
                break;
            case '"': 
                if (i > 0 && json.charAt(i - 1) !== '\\') {
                    inString = !inString; 
                }
                newJson += currentChar; 
                break;
            default: 
                newJson += currentChar; 
                break;                    
            } 
        } 

        return newJson; 
    }

    return { "formatJson": formatJson };

}());


https.get(repsUri, function(res) {
        
        res.on('data', function(eventData) {
            if(isFirstRequest){
                // First Time Request
		var formattedEventData = jsl.format.formatJson(eventData.toString());
                fs.writeFile("data", formattedEventData);
                isFirstRequest = false;
                console.log("true");
            
            }
            else{
                fs.appendFileSync("data", eventData);
		var fileData = fs.readFileSync("data");
		var formattedEventData = jsl.format.formatJson(fileData.toString());
                fs.writeFile("data", formattedEventData);
                console.log("false");
            
            }
        });
        }).on('error', function(e) {
            console.error(e);
});
