// ============================================
// PERCENTAGE CALCULATOR FOR AFTER EFFECTS
// Version 1.6 with Advanced Error Handling
// ============================================


// ============================================
// BASE64 DECODE FUNCTION
// ============================================
function base64Decode(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }

    return output;
}


// ============================================
// BASE64 ENCODE FUNCTION (для парсера)
// ============================================
function base64Encode(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }

    return output;
}


// ============================================
// VALIDATE LAYER NAME FUNCTION
// ============================================
function validateLayerName(name) {
    if (name === "" || name === undefined || name === null) {
        return { valid: false, error: "Name cannot be empty" };
    }
    
    // Недопустимые символы для имён слоёв в AE
    var invalidChars = /[\[\]\(\)]/g;
    if (invalidChars.test(name)) {
        return { valid: false, error: "Name contains invalid characters: [ ] ( )" };
    }
    
    if (name.length > 50) {
        return { valid: false, error: "Name is too long (max 50 characters)" };
    }
    
    return { valid: true, error: null };
}


// ============================================
// CHECK FOR CONFLICTING LAYER NAMES
// ============================================
function checkConflictingNames(myComp, baseName) {
    var shapeName = 'SIZE | ' + baseName;
    var textName = 'TXT | ' + baseName;
    var percentageName = 'Percentage | ' + baseName;
    
    for (var i = 1; i <= myComp.numLayers; i++) {
        var layer = myComp.layer(i);
        if (layer.name === shapeName || layer.name === textName || layer.name === percentageName) {
            return { conflict: true, existingName: layer.name };
        }
    }
    
    return { conflict: false, existingName: null };
}


// ============================================
// CONSOLIDATED LAYER CREATION HANDLER
// ============================================
function handleCreateLayersClick(baseName, mode, selectedTextLayer) {
    var workComp = app.project.activeItem;
    
    if (workComp === null || !(workComp instanceof CompItem)) {
        alert("ERROR: Please select a composition first!");
        return false;
    }
    
    if (baseName === "") {
        alert("ERROR: Please enter a layer name!");
        return false;
    }
    
    // Валидация имени
    var validation = validateLayerName(baseName);
    if (!validation.valid) {
        alert("ERROR: " + validation.error);
        return false;
    }
    
    // Проверка конфликтов имён
    var conflict = checkConflictingNames(workComp, baseName);
    if (conflict.conflict) {
        alert("ERROR: Layer '" + conflict.existingName + "' already exists!\nPlease use a different name.");
        return false;
    }
    
    // Начинаем undo-группировку
    app.beginUndoGroup("Create Percentage Calculator Layers");
    
    try {
        var useAllLayers = (mode === 1 || mode === 3);
        var useBasedOnText = (mode === 3);
        
        CreateLayers(baseName, workComp, useAllLayers, useBasedOnText, selectedTextLayer);
        
        // Определяем сообщение помощи
        var helpMessage;
        if (mode === 1) {
            helpMessage = HELP_MESSAGES.button1;
        } else if (mode === 2) {
            helpMessage = HELP_MESSAGES.button2;
        } else {
            helpMessage = HELP_MESSAGES.button3;
        }
        
        showHelpDialog("Layers created successfully!", helpMessage);
        app.endUndoGroup();
        return true;
        
    } catch (e) {
        app.endUndoGroup();
        alert("ERROR during layer creation:\n" + e.message);
        return false;
    }
}


// ============================================
// REMOVE ALL KEYFRAMES FROM LAYER STYLES
// ============================================
function removeLayerStyleKeyframes(layer) {
    try {
        var layerStyles = layer.property("ADBE Layer Styles");
        if (!layerStyles) return;
        
        var frameStroke = layerStyles.property("frameFX/enabled");
        if (!frameStroke) return;
        
        try {
            var sizeProp = frameStroke.property("frameFX/size");
            while (sizeProp.numKeys > 0) {
                sizeProp.removeKey(1);
            }
        } catch (e) {}
        
        try {
            var colorProp = frameStroke.property("frameFX/color");
            while (colorProp.numKeys > 0) {
                colorProp.removeKey(1);
            }
        } catch (e) {}
        
        try {
            var opacityProp = frameStroke.property("frameFX/opacity");
            while (opacityProp.numKeys > 0) {
                opacityProp.removeKey(1);
            }
        } catch (e) {}
        
    } catch (e) {
        $.writeln("ERROR removing keyframes: " + e.message);
    }
}


// ============================================
// APPLY EMBEDDED STROKE FFX
// ============================================
function applyEmbeddedStroke(layer) {
    var strokeFFXBase64 = "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c2V0LWFuaW1hdGlvbjwvZGM6Zm9ybWF0PgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIEFmdGVyIEVmZmVjdHMgMjAyNCAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMjUtMTAtMjlUMjI6MzI6NDArMDM6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDI1LTEwLTI5VDIyOjMyOjQwKzAzOjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAyNS0xMC0yOVQyMjozMjo0MCswMzowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6NjczZjE3OTEtOTZlNi0zODRiLWE5YWFlLWZhZGI3N2RhNmU2YzwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDo2NzNmMTc5MS05NmU2LTM4NGItYTlhZS1mYWRiNzdkYTZlNmM8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDo2NzNmMTc5MS05NmU2LTM4NGItYTlhZS1mYWRiNzdkYTZlNmM8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo2NzNmMTc5MS05NmU2LTM4NGItYTlhZS1mYWRiNzdkYTZlNmM8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDI1LTEwLTI5VDIyOjMyOjQwKzAzOjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgQWZ0ZXIgRWZmZWN0cyAyMDI0IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKK3C9yZGY6UkRGPgogICA8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pg==";
    
    var binaryData = base64Decode(strokeFFXBase64);
    
    var tempFFXFile = new File(Folder.temp.fsName + "/TempStroke_" + new Date().getTime() + ".ffx");
    tempFFXFile.encoding = "BINARY";
    tempFFXFile.open("w");
    tempFFXFile.write(binaryData);
    tempFFXFile.close();
    
    try {
        layer.applyPreset(tempFFXFile);
    } catch (e) {
        $.writeln("ERROR applying preset: " + e.message);
        tempFFXFile.remove();
        throw new Error("Failed to apply stroke preset");
    }
    
    tempFFXFile.remove();
    removeLayerStyleKeyframes(layer);
}


// ============================================
// SHOW HELP DIALOG FUNCTION
// ============================================
function showHelpDialog(title, message) {
    var dialog = new Window("dialog", title);
    dialog.orientation = "column";
    dialog.alignChildren = ["center", "top"];
    dialog.spacing = 10;
    dialog.margins = 15;
    
    var messageText = dialog.add("statictext", undefined, message, {multiline: true});
    messageText.alignment = ["left", "top"];
    messageText.preferredSize = [400, 200];
    
    var okButton = dialog.add("button", undefined, "OK");
    okButton.alignment = ["center", "bottom"];
    
    okButton.onClick = function() {
        dialog.close();
    }
    
    dialog.show();
}


// ============================================
// HELP MESSAGES
// ============================================
var HELP_MESSAGES = {
    button1: "HOW TO USE:\n\n" +
             "• SIZE layer - MAIN controller\n" +
             "• TXT layer - text (linked to SIZE)\n" + 
             "• Percentage - shows % of screen\n\n" +
             "CONTROL:\n" +
             "Change Scale of SIZE layer - everything\n" +
             "will adjust automatically!\n\n" +
             "You can edit text, font, color -\n" +
             "sizes stay correct!",
    
    button2: "HOW TO USE:\n\n" +
             "• SIZE layer - MAIN controller\n" +
             "• Percentage - shows % of screen\n\n" +
             "CONTROL:\n" +
             "Change Scale of SIZE layer - percentage\n" +
             "updates automatically!\n\n" +
             "Perfect for measuring screen area\n" +
             "of any composition element!",
    
    button3: "HOW TO USE:\n\n" +
             "• TXT layer - your original text\n" +
             "• SIZE layer - MAIN controller\n" +
             "• Percentage - shows % of screen\n\n" +
             "CONTROL:\n" +
             "Change Scale of SIZE layer - text keeps\n" +
             "proportions, percentage updates!\n\n" +
             "Edit original text - sizes\n" +
             "adjust automatically!"
};


// ============================================
// MAIN UI - CREATE TABBED PANEL
// ============================================
var myPanel = new Window("palette", "Percentage Calculator v 1.6", undefined);
myPanel.orientation = "column";
myPanel.alignChildren = "fill";

var myTabbedPanel = myPanel.add("tabbedpanel", undefined);


// ============================================
// TAB 1: PERCENTAGE CALCULATOR
// ============================================
var tab1 = myTabbedPanel.add("tab", undefined, "Percentage Calculator");
tab1.orientation = "column";
tab1.alignChildren = "fill";

// ============ GROUP 1 ============
var inputGroup1st = tab1.add("panel", undefined, "CREATE 3 LAYERS: TXT, ShapeControl, Percentage");
inputGroup1st.alignChildren = ['fill','top'];
inputGroup1st.orientation = "column";

    var panelText1st = inputGroup1st.add("statictext", undefined, "Enter the creating Mask Name:");
    panelText1st.alignment = "left";

    var theName1st = "";
    var myTextField1st = inputGroup1st.add("edittext", undefined, theName1st);
    myTextField1st.characters = 20;

    myTextField1st.onChange = function() {
        theName1st = this.text;
    }

    var myButton1st = inputGroup1st.add("button", undefined, "Create 3 layers");
    myButton1st.helpTip = "Creates 3 layers:\n• TXT (text)\n• SIZE (shape - main controller)\n• Percentage (% of screen)\n\nControl: Scale SIZE layer\n\nGoal: Create title with % area control";

// ============ GROUP 2 ============
var inputGroup2nd = tab1.add("panel", undefined, "CREATE 2 LAYERS: Shape, Percentage");
inputGroup2nd.alignChildren = ['fill','top'];
inputGroup2nd.orientation = "column";

    var panelText2nd = inputGroup2nd.add("statictext", undefined, "Enter the creating layer Mask Name:");
    panelText2nd.alignment = "left";

    var theName2nd = "";
    var myTextField2nd = inputGroup2nd.add("edittext", undefined, theName2nd);
    myTextField2nd.characters = 20;

    myTextField2nd.onChange = function() {
        theName2nd = this.text;
    }

    var myButton2nd = inputGroup2nd.add("button", undefined, "Create 2 Simple layers");
    myButton2nd.helpTip = "Creates 2 layers:\n• SIZE (shape - resizable)\n• Percentage (% of screen)\n\nControl: Scale SIZE layer\n\nGoal: Measure screen area";

// ============ GROUP 3 ============
var inputGroup3rd = tab1.add("panel", undefined, "CREATE 2 LAYERS (Based on Text)");
inputGroup3rd.alignChildren = ['fill','top'];
inputGroup3rd.orientation = "column";

    var panelText3rd = inputGroup3rd.add("statictext", undefined, "Enter the creating Mask Name:");
    panelText3rd.alignment = "left";

    var theName3rd = "";
    var myTextField3rd = inputGroup3rd.add("edittext", undefined, theName3rd);
    myTextField3rd.characters = 20;

    myTextField3rd.onChange = function() {
        theName3rd = this.text;
    }

    var myButton3rd = inputGroup3rd.add("button", undefined, "Create layers based on Text");
    myButton3rd.helpTip = "Creates layers from selected text:\n• TXT (original text layer)\n• SIZE (shape - main controller)\n• Percentage (% of screen)\n\nControl: Scale SIZE layer\n\nGoal: Control % area of existing text";

// ============ CONTACTS ============
var panelTextContact1st = tab1.add("statictext", undefined, "tannenspiel@gmail.com   eddiedie@yandex.ru");


// ============================================
// TAB 2: FFX PARSER
// ============================================
var tab2 = myTabbedPanel.add("tab", undefined, "Parsing FFX");
tab2.orientation = "column";
tab2.alignChildren = "fill";

// ///////////////////////////////////////////////////////////////
// FFX PARSER: READS BINARY FFX AND ENCODES TO BASE64
// Saves Base64 string to text file with logging
// ///////////////////////////////////////////////////////////////

var parserPanel = tab2.add("panel", undefined, "FFX to Base64 Converter");
parserPanel.alignChildren = ['fill','top'];
parserPanel.orientation = "column";

    var parserText = parserPanel.add("statictext", undefined, "Select FFX file and convert to Base64");
    parserText.alignment = "left";

    var parserButton = parserPanel.add("button", undefined, "Select and Convert FFX");
    parserButton.helpTip = "Opens file dialog.\nReads FFX as binary data.\nSaves Base64 to text file + creates log.";

    var parserStatus = parserPanel.add("statictext", undefined, "Ready for conversion");
    parserStatus.alignment = "left";

// ///////////////////////////////////////////////////////////////
// FFX PARSER BUTTON HANDLER
// ///////////////////////////////////////////////////////////////
parserButton.onClick = function() {
    var ffxFile = File.openDialog("Select PercentageCalcStroke.ffx", "*.ffx");

    if (ffxFile && ffxFile.exists) {
        try {
            parserStatus.text = "Processing...";
            
            ffxFile.encoding = "BINARY";
            ffxFile.open("r");
            var binaryData = ffxFile.read();
            ffxFile.close();
            
            if (binaryData.length == 0) {
                parserStatus.text = "ERROR: File is empty!";
                alert("ERROR: FFX file is empty!");
                return;
            }
            
            parserStatus.text = "Encoding Base64...";
            
            var base64String = base64Encode(binaryData);
            
            if (base64String === undefined || base64String === "") {
                parserStatus.text = "ERROR: Encoding failed!";
                alert("ERROR: base64Encode returned empty value!");
                return;
            }
            
            // Choose output file location
            var outputFile = File.saveDialog("Save Base64 output as...", "Text files:*.txt");
            
            if (outputFile === null) {
                parserStatus.text = "Cancelled by user";
                return;
            }
            
            outputFile.encoding = "UTF-8";
            outputFile.open("w");
            outputFile.write(base64String);
            outputFile.close();
            
            // Create log file in same directory
            var logFile = new File(outputFile.parent.fsName + "/FFXParser_Log.txt");
            logFile.encoding = "UTF-8";
            logFile.open("w");
            var timestamp = new Date();
            logFile.writeln("FFX Parser Log");
            logFile.writeln("==============");
            logFile.writeln("Timestamp: " + timestamp);
            logFile.writeln("Source file: " + ffxFile.name);
            logFile.writeln("Binary size: " + binaryData.length + " bytes");
            logFile.writeln("Base64 length: " + base64String.length + " characters");
            logFile.writeln("Output file: " + outputFile.name);
            logFile.writeln("\nConversion completed successfully");
            logFile.close();
            
            parserStatus.text = "SUCCESS! Files saved";
            alert(
                "SUCCESS!\n\n" +
                "Base64 file:\n" +
                outputFile.name + "\n\n" +
                "Log file:\n" +
                "FFXParser_Log.txt\n\n" +
                "Original size: " + binaryData.length + " bytes\n" +
                "Base64 length: " + base64String.length + " characters"
            );
            
        } catch (e) {
            parserStatus.text = "ERROR: " + e.message;
            alert("ERROR during conversion:\n" + e.message);
        }
    } else {
        parserStatus.text = "File not selected";
    }
}

// ///////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////


// ============================================
// EVENT HANDLERS
// ============================================

myButton1st.onClick = function() {
    handleCreateLayersClick(theName1st, 1, null);
}

myButton2nd.onClick = function() {
    handleCreateLayersClick(theName2nd, 2, null);
}

myButton3rd.onClick = function() {
    var workComp = app.project.activeItem;
    
    if (workComp === null || !(workComp instanceof CompItem)) {
        alert("ERROR: Please select a composition first!");
        return;
    }
    
    var selectedLayers = workComp.selectedLayers;
    
    if (selectedLayers.length !== 1) {
        alert("ERROR: Please select EXACTLY ONE text layer!");
        return;
    }
    
    var selectedLayer = selectedLayers[0];
    
    if (selectedLayer.matchName !== "ADBE Text Layer") {
        alert("ERROR: Selected layer is not a Text layer!");
        return;
    }
    
    if (theName3rd === "") {
        alert("ERROR: Please enter a layer name!");
        return;
    }
    
    handleCreateLayersClick(theName3rd, 3, selectedLayer);
}

myPanel.show();


// ============================================
// CREATE LAYERS FUNCTION
// CRITICAL: DO NOT MODIFY EXPRESSION STRUCTURE!
// ============================================
function CreateLayers(BaseName, myComp, isAllLayers, isBasedOnText, selectedTextLayer) {
    var myComp = app.project.activeItem;

    ShapeName = 'SIZE | ' + BaseName;
    TextName = 'TXT | ' + BaseName;
    PercentageName = 'Percentage | ' + BaseName;
    var title = "TITLE";

    var shapeLayer = myComp.layers.addShape();
    shapeLayer.name = "SIZE | " + BaseName;
    var rect = shapeLayer.content.addProperty("ADBE Vector Shape - Rect");
    rect.name = "Rectangle 1";
    var rectPath = rect.property("ADBE Vector Rect Size");

    var percentageLayer = myComp.layers.addText("Percentage | " + title);
    percentageLayer.name = "Percentage | " + BaseName;
    percentageLayer.property("Text").property("Source Text").setValue("Percentage | " + title);   

    // Store original position for mode 3 (based on text)
    var originalPosition = null;

    if(isAllLayers) {
        var txtLayer;
        if(isBasedOnText) { 
            selectedTextLayer.name = "TXT | " + BaseName;
            txtLayer = selectedTextLayer;
            // Save original position
            originalPosition = txtLayer.property("Transform").property("Position").value;
        } else {
            txtLayer = myComp.layers.addText("TXT | " + title);            
            txtLayer.name = "TXT | " + BaseName;
            txtLayer.property("Text").property("Source Text").setValue("TITLE");
        }

        shapeLayer.selected = false;

        for (var i = 1; i <= myComp.numLayers; i++) {
            myComp.layer(i).selected = false;
        }

        txtLayer.selected = true;
        applyEmbeddedStroke(txtLayer);

        txtLayer.moveBefore(shapeLayer);
        percentageLayer.moveBefore(txtLayer);

        percentageLayer.guideLayer = true;
        shapeLayer.guideLayer = true;
    }   
    
    if(isAllLayers) {
        rectPath.expression =
            '// Find text layer\
            var textLayer = thisComp.layer("' + TextName + '");\
            \n// Get text stroke\
            var textStroke = thisComp.layer("' + TextName + '").layerStyle.stroke.size;\
            \n// Get text dimensions\
            var textWidth = textLayer.sourceRectAtTime(time, false).width + textStroke*2;\
            var textHeight = textLayer.sourceRectAtTime(time, false).height + textStroke*2;\
            \n// Get text scale\
            var textScale = textLayer.transform.scale / 100;\
            \n[textWidth * textScale[0], textHeight * textScale[1]]';

        shapeLayer.property("Transform").property("Anchor Point").expression =              
            '// Find text layer\
            var textLayer = thisComp.layer("' + TextName + '");\
            var textBox = thisComp.layer("' + TextName + '").sourceRectAtTime(time, false);\
            \n// Get text dimensions\
            var textHeight = textBox.height;\
            var textWidth = textBox.width;\
            var textLeft = textBox.left;\
            var textTop = textBox.top;\
            \nvar x = textWidth/-2-textLeft;\
            var y = textHeight/-2-textTop;\
            \n// Get text scale\
            var textScale = textLayer.transform.scale / 100;\
            \n[x * textScale[0], y * textScale[1]]';
    }

    shapeLayer.property("Contents").property("Rectangle 1").property("Position").expression = '[0,0]'

    var fill = shapeLayer.content.addProperty("ADBE Vector Graphic - Fill");
    fill.property("Color").setValue([Math.random(), Math.random(), Math.random()]);

    var stroke = shapeLayer.content.addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("Stroke Width").setValue(0);
   
    var percentageProp = percentageLayer.property("Source Text");
    var percentageDocument = percentageProp.value;
    percentageDocument.fillColor = [Math.random(), Math.random(), Math.random()];
    percentageProp.setValue(percentageDocument);

    if(isAllLayers) {
        txtLayer.property("Transform").property("Anchor Point").expression =
            '// Find text layer\
            var textBox = thisLayer.sourceRectAtTime(time, false);\
            \n// Get text dimensions\
            var textHeight = textBox.height;\
            var textWidth = textBox.width;\
            var textLeft = textBox.left;\
            var textTop = textBox.top;\
            var x = textLeft+textWidth/2;\
            var y = textTop+textHeight/2;\
            \n// Get text scale\
            var textScale = thisLayer.transform.scale / 100;\
            \n[x * textScale[0], y * textScale[1]]';

        txtLayer.property("Transform").property("Position").expression = '[0, 0]'
        txtLayer.property("Transform").property("Scale").expression = '[100, 100]'

        txtLayer.property("Transform").property("Position").setValue([0, 0]);
        txtLayer.property("Transform").property("Scale").setValue([100, 100]);

        percentageLayer.property("Transform").property("Position").setValue([myComp.width / 2, myComp.height / 4]);

        txtLayer.parent = shapeLayer;
        
        // For mode 3: move shape to original text position
        if(isBasedOnText && originalPosition !== null) {
            shapeLayer.property("Transform").property("Position").setValue(originalPosition);
        }
    }

    percentageLayer.property("Source Text").expression =
        'var rectLayer = thisComp.layer("' + ShapeName + '");\
        \nvar xSize = rectLayer.content("Rectangle 1").size[0];\
        var ySize = rectLayer.content("Rectangle 1").size[1];\
        \n// Get rectangle scale\
        var rectScale = rectLayer.transform.scale / 100;\
        \n// Account for scale in dimensions\
        xSize *= rectScale[0];\
        ySize *= rectScale[1];\
        \n var rectArea = xSize * ySize;\
        var compArea = thisComp.width * thisComp.height;\
        var percentage = (rectArea / compArea) * 100;\
        \n percentage = thisLayer.name.split(" | ")[1] +": " + percentage.toFixed(2) + "%";';
}
