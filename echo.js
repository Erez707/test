// variables
var phoneScreen = document.getElementById("phoneScreen");
var openAppButton = document.getElementById("openAppButton");
var onOffButton = document.querySelector(".onOffButton");
var appWrapper;
var mainTabWrapper;
var resultsTabWrapper;
var off = true;
var imageArray = [];
var index = 0;
var segmentationIsDisplayed = false;
var leftVentricleArea;
var ejectionFraction;
var lvVolumeArray = [];
var heartRateArray = [];
var globalLongitudinalStrainArray = [];
var arrhythmiaArray = [];
var lvVolumeChart;
var longStrainChart;
var endSystolicArray = [];
var endDiastolicArray = [];
var chamberView;
var ejectionFractionDisplay;

// functions

onOffButton.onclick = changeBackground;

function changeBackground() {
    if(off) {
        // turn on phone
        phoneScreen.classList.add("phoneScreen-active");
        openAppButton.classList.add("openAppButton-active");
        off = false;
    }
    else {
        // turn off phone
        phoneScreen.classList.remove("phoneScreen-active");
        openAppButton.classList.remove("openAppButton-active");
        if(appWrapper) {
            appWrapper.style.visibility = "hidden";
        }
        off = true;

    }
}

openAppButton.onclick = dyadEchoApp;

function dyadEchoApp() {
    if(appWrapper) {
        // show existing app
        appWrapper.style.visibility = "visible";
    }
    else {
        // create app
        // remove the button visibility 
        openAppButton.classList.remove("openAppButton-active");
        phoneScreen.classList.remove("phoneScreen-active");

        // create an app wrapper
        appWrapper = document.createElement("div");
        appWrapper.setAttribute("class", "appWrapper");
        phoneScreen.appendChild(appWrapper);

        // create the tabs section
        var appTabsWrapper = document.createElement("div");
        appTabsWrapper.setAttribute("class", "appTabsWrapper");

        // ------------- create each tab ------------- \\
        // create main tab
        var mainWindowTab = document.createElement("div");
        mainWindowTab.setAttribute("class", "mainWindowTab");
        mainWindowTab.innerHTML = "<img src='images/dyad_logo.gif' width=\'25px\' height=\'30px\'>";
        // create results tab
        var resultsTab = document.createElement("div");
        resultsTab.setAttribute("class", "resultsTab");
        resultsTab.innerHTML = "Results Tab";

        // Append tabs to the tabs wrapper
        appTabsWrapper.appendChild(mainWindowTab);
        appTabsWrapper.appendChild(resultsTab);
        // appTabsWrapper.appendChild(dyadTab);
        appWrapper.appendChild(appTabsWrapper);

        // create mainTabWrapper
        mainTabWrapper = document.createElement("div");
        mainTabWrapper.setAttribute("class", "mainTabWrapper");
        appWrapper.appendChild(mainTabWrapper);

        // create resultsTabWrapper
        resultsTabWrapper = document.createElement("div");
        resultsTabWrapper.setAttribute("class", "resultsTabWrapper");
        resultsTabWrapper.style.visibility = "hidden";
        appWrapper.appendChild(resultsTabWrapper);

        resultsTab.onclick = showResultsContent;
        mainWindowTab.onclick = showMainTabContent;


        // cine through the images
        playEchoCine();

        /////// create right side ruler ///////

        // main ruler will have longer tick marks with small numbers to the left
        var mainRulerWrapper = document.createElement("div");
        mainRulerWrapper.setAttribute("class", "mainRulerWrapper");
        mainTabWrapper.appendChild(mainRulerWrapper);

        // create main ruler tick marks
        for(var i = 0; i < 15; i++) {
            var mainRuler = document.createElement("hr");
            mainRuler.setAttribute("class", "mainRulerMarks");
            mainRulerWrapper.appendChild(mainRuler);
        }

        // small ruler will have shorter tick marks and will be seen in between the larger ones
        var smallRulerWrapper = document.createElement("div");
        smallRulerWrapper.setAttribute("class", "smallRulerWrapper");
        mainTabWrapper.appendChild(smallRulerWrapper);

        // create small ruler tick marks
        for(var i = 0; i < 75; i++) {
            var smallRuler = document.createElement("hr");
            smallRuler.setAttribute("class", "smallRulerMarks");
            smallRulerWrapper.appendChild(smallRuler);
        }

        /////// ///////////////////// ///////

        // create a show/hide segmentation button
        var toggleSegmentationButton = document.createElement("div");
        toggleSegmentationButton.setAttribute("class", "toggleSegmentationButton");
        toggleSegmentationButton.innerHTML = "Show Segmentation";
        mainTabWrapper.appendChild(toggleSegmentationButton);


        // manage click events for toggleSegmentationButton

        toggleSegmentationButton.onclick = toggleSegmentation;

        function toggleSegmentation() {
            if(segmentationIsDisplayed == false) {
                playSegmentCine();

                if(document.getElementById("labelForCreateChart")) 
                    mainTabWrapper.removeChild(document.getElementById("labelForCreateChart"));

                lineChart();
                toggleSegmentationButton.innerHTML = "Hide Segmentation"
                return segmentationIsDisplayed = true;
            }
            else {
                // delete segmentation
                clearTimeout(playSegmentTimeout); // NEED TO FIND HOW TO STOP SHOWING THE SEGMENTATION WITHOUT STOPPING THE IMAGE FROM RUNNING

                if(mainTabWrapper.children) {
                    // if there are canvases inside the mainTabWrapper they will all be deleted before new one is created
                    var nodeList = mainTabWrapper.querySelectorAll(".segmentationCanvas");
                    for(var node of nodeList) {
                        mainTabWrapper.removeChild(node);
                    }
                }
                toggleSegmentationButton.innerHTML = "Show Segmentation"
                return segmentationIsDisplayed = false;
            }
        }

        // Create area / volume chart canvas
        var areaVolumeChart = document.createElement("canvas");
        areaVolumeChart.setAttribute("id", "areaVolumeChart");
        mainTabWrapper.appendChild(areaVolumeChart);

        // create label to tell user to create the area/volumes chart
        var labelForCreateChart = document.createElement("label");
        labelForCreateChart.setAttribute("id", "labelForCreateChart");
        labelForCreateChart.innerHTML = "Click below to generate volume chart";
        mainTabWrapper.appendChild(labelForCreateChart);

        // display ejection fraction
        ejectionFractionDisplay = document.createElement("div");
        ejectionFractionDisplay.setAttribute("class", "ejectionFractionDisplay");
        mainTabWrapper.appendChild(ejectionFractionDisplay);

        // ----------------------- create labels within the display ----------------------- \\
        // // Desired Chamber View Key
        // var desiredChamberViewKey = document.createElement("p");
        // desiredChamberViewKey.setAttribute("class", "desiredChamberViewKey");
        // desiredChamberViewKey.innerHTML = "Desired View: 4-Chamber";
        // ejectionFractionDisplay.appendChild(desiredChamberViewKey);

        // // Current Chamber View Key
        // var currentChamberViewKey = document.createElement("p");
        // currentChamberViewKey.setAttribute("class", "currentChamberViewKey");
        // currentChamberViewKey.innerHTML = "Current View: ";
        // ejectionFractionDisplay.appendChild(currentChamberViewKey);
        // // Current Chamber View Value
        // var currentChamberViewValue = document.createElement("p");
        // currentChamberViewValue.setAttribute("class", "currentChamberViewValue");
        // currentChamberViewValue.innerHTML = "EF";
        // ejectionFractionDisplay.appendChild(currentChamberViewValue);

        // // Heart Rate key
        // var hearRateKey = document.createElement("p");
        // hearRateKey.setAttribute("class", "hearRateKey");
        // hearRateKey.innerHTML = "HR: ";
        // ejectionFractionDisplay.appendChild(hearRateKey);
        // // Heart Rate value
        // var hearRateValue = document.createElement("p");
        // hearRateValue.setAttribute("class", "hearRateValue");
        // hearRateValue.innerHTML = "HR: ";
        // ejectionFractionDisplay.appendChild(hearRateValue);

        // // Ejection Fraction key
        // var ejectionFractionKey = document.createElement("p");
        // ejectionFractionKey.setAttribute("class", "ejectionFractionKey");
        // ejectionFractionKey.innerHTML = "EF";
        // ejectionFractionDisplay.appendChild(ejectionFractionKey);
        // // Ejection Fraction value
        // var ejectionFractionValue = document.createElement("p");
        // ejectionFractionValue.setAttribute("class", "ejectionFractionValue");
        // ejectionFractionValue.innerHTML = "EF";
        // ejectionFractionDisplay.appendChild(ejectionFractionValue);

        // // Arrhythmia key
        // var arrhythmiaKey = document.createElement("p");
        // arrhythmiaKey.setAttribute("class", "arrhythmiaKey");
        // arrhythmiaKey.innerHTML = "Arrhythmia";
        // ejectionFractionDisplay.appendChild(arrhythmiaKey);
        // // Arrhythmia value
        // var arrhythmiaValue = document.createElement("p");
        // arrhythmiaValue.setAttribute("class", "arrhythmiaValue");
        // arrhythmiaValue.innerHTML = "Arrhythmia";
        // ejectionFractionDisplay.appendChild(arrhythmiaValue);

        // // Global Longitudinal Strain key
        // var glsKey = document.createElement("p");
        // glsKey.setAttribute("class", "glsKey");
        // glsKey.innerHTML = "GLS";
        // ejectionFractionDisplay.appendChild(glsKey);
        // // Global Longitudinal Strain value
        // var glsValue = document.createElement("p");
        // glsValue.setAttribute("class", "glsValue");
        // glsValue.innerHTML = "GLS";
        // ejectionFractionDisplay.appendChild(glsValue);
        

        ejectionFractionAndHeartRate();
    
        create17SegmentHeart();

    }
}

function showResultsContent() {
    if(mainTabWrapper) {
        mainTabWrapper.style.visibility = "hidden";
    }
    resultsTabWrapper.style.visibility = "visible";

    // Create strain chart canvas
    if(document.getElementById("longStrainChartCanvas")) {
        resultsTabWrapper.removeChild(document.getElementById("longStrainChartCanvas"));
    }
        var longStrainChartCanvas = document.createElement("canvas");
        longStrainChartCanvas.setAttribute("id", "longStrainChartCanvas");
        resultsTabWrapper.appendChild(longStrainChartCanvas);
        strainChart();  

}

function showMainTabContent() {
    if(resultsTabWrapper) {
        resultsTabWrapper.style.visibility = "hidden";
    }
    mainTabWrapper.style.visibility = "visible";

}

// -------------------------------------- SEGMENTATION -------------------------------------- \\
function playSegmentCine() {
    (function (delay, callback) {
      var loop = function () {
        callback();
        playSegmentTimeout = setTimeout(loop, delay);
      };
      loop();
    })(80, cineSegmentDisplay);
}

function cineSegmentDisplay() {
    if( index === 199) {
        index = 0;
        displaySegmentation(index);
    } else {
        // increment index by positive 1
        index++;
        displaySegmentation(index);
    }
}

function displaySegmentation(index) {
    // show segmentation results on screen
    fetch("echoData/triage/triage" + index + ".json").then(function(response) {
        return response.json();
    }).then(function(segmentationJson) {
        // console.log(segmentationJson.LV);
        createNewMask(segmentationJson);
        // refresh data in chart
        addData(lvVolumeChart, segmentationJson.LV_Volume) 

        // // change the heart rate and ejection fraction based on the current frame
        // if(heartRate[index] == "Collecting") {
        //     var efNumber = Math.random() * (+69 - +67) + +67;  //  ------------------------------- HARD CODED -------------------------------  \\
        //     var hrNumber = Math.random() * (+56 - +55) + +55;
        //     document.querySelector(".ejectionFractionDisplay").innerHTML = "Desired View: 4-Chamber \t Current View: " + chamberView + "<br>HR: " + hrNumber.toFixed(0) + "<br>EF: " + efNumber.toFixed(2) + "% <br>" + arrhythmiaArray[index];
        //     ejectionFractionBar(efNumber); 
    
        // } else {
        //     document.querySelector(".ejectionFractionDisplay").innerHTML = "Desired View: 4-Chamber \t Current View: " + chamberView + "<br>HR: " + heartRate[index] + "<br>EF: " + ejectionFraction.toFixed(2) + "% <br>" + arrhythmiaArray[index];
        //     ejectionFractionBar(ejectionFraction); 
    
        // }

        if(arrhythmiaArray[index] == "--") {
            document.querySelector(".ejectionFractionDisplay").innerHTML = "Desired View: 4-Chamber \t Current View: " + chamberView 
                                    + "<br>HR: " + heartRateArray[index] 
                                    + "<br>EF: " + ejectionFraction.toFixed(2) + "% <br>Arrhythmia: " + arrhythmiaArray[index];
            ejectionFractionBar(ejectionFraction); 
        } else {
            document.querySelector(".ejectionFractionDisplay").innerHTML = "Desired View: 4-Chamber \t Current View: " + chamberView 
                                    + "<br>HR: " + heartRateArray[index] 
                                    + "<br>EF: " + ejectionFraction.toFixed(2) + "% <br>" + arrhythmiaArray[index];
            ejectionFractionBar(ejectionFraction); 

        }

        
    });
}

function deleteSegmentation() {
    if(mainTabWrapper.children) {
        // if there are canvases inside the mainTabWrapper they will all be deleted before new one is created
        var nodeList = mainTabWrapper.querySelectorAll(".segmentationCanvas");
        for(var node of nodeList) {
            mainTabWrapper.removeChild(node);
        }
    }
}

function createNewMask(segmentationJson) {
    var leftVentricle = segmentationJson.LV; // this is a 2d array of x,y coordinates
    var x = leftVentricle[0]; // represents the x coordinate in the segmentation image
    var y = leftVentricle[1]; // represents the y coordinate in the segmentation image
  
    deleteSegmentation();
    
    // create the canvas for segmentation results
    var segmentationCanvas = document.createElement("canvas");
    segmentationCanvas.setAttribute("class", "segmentationCanvas");
    mainTabWrapper.appendChild(segmentationCanvas);

    // create segmentationCanvas context
    var segmentationContext = segmentationCanvas.getContext("2d");

    var phoneCanvas = document.querySelector(".phoneCanvas");
    segmentationCanvas.width = phoneCanvas.width;
    segmentationCanvas.height = phoneCanvas.height
    var imgData = segmentationContext.createImageData(segmentationCanvas.width, segmentationCanvas.height);


    for(var i = 0; i < x.length; i++) {
        var pixel = (4 * x[i] * segmentationCanvas.width + y[i]*4); //(for rgba accessing canvas pixel -->> represents each pixel in the segmentationCanvas

        imgData.data[pixel] = 140; // Red
        imgData.data[pixel + 1] = 32; // Green
        imgData.data[pixel + 2] = 32; // Blue
        imgData.data[pixel + 3] = 200; // alpha
        
    }

    segmentationContext.putImageData(imgData, 0, 0);
}

// function fillImageArray() {
//     // hard coded length for demo purposes
//     for( var i = 0; i < 200; i++) {
//         // create image object to hold imag
//         var echoImage = new Image();
//         echoImage.src = "echoData/Images/frame" + i  + ".png";

//         // add each echo image to the imageArray
//         imageArray.push(echoImage);
//     }
// }


// -------------------------------------- ECHO IMAGES -------------------------------------- \\

function displayEchoData(newIndex) {
    // create the canvas (main display)
    var phoneCanvas = document.createElement("canvas");
    phoneCanvas.setAttribute("class", "phoneCanvas");

    // create phoneCanvas context
    var context = phoneCanvas.getContext("2d");

    // create image object
    var echoImage = new Image();
    echoImage.src = "echoData/Images/frame" + newIndex  + ".png";

    echoImage.onload = function () {
        phoneCanvas.width = this.width;
        phoneCanvas.height = this.height; // SET THE SIZE OF THE CANVAS HERE ---->> NOT IN CSS BECAUSE IT WILL CHANGE THE ASPECT RATION OF THE IMAGE
    
        if(mainTabWrapper.children) {
            // if there are canvases inside the mainTabWrapper they will all be deleted before new one is created
            var nodeList = mainTabWrapper.querySelectorAll(".phoneCanvas");
            for(var node of nodeList) {
                mainTabWrapper.removeChild(node);
            }
        }
        mainTabWrapper.appendChild(phoneCanvas);  
        context.drawImage(echoImage, 0, 0, phoneCanvas.width, phoneCanvas.height);
    }
    // // change the heart rate and ejection fraction based on the current frame
    // document.querySelector(".ejectionFractionDisplay").innerHTML = "HR: " + heartRate[index] + "<br>EF: " + ejectionFraction.toFixed(2) + "%";
    // ejectionFractionBar(ejectionFraction); 
    
}

function playEchoCine() {
    (function (delay, callback) {
      var loop = function () {
        callback();
        playEchoTimeout = setTimeout(loop, delay);
      };
      loop();
    })(40, cineMainDisplay);
}

function cineMainDisplay() {
    if( index === 199) {
        index = 0;
        displayEchoData(index);
    } else {
        // increment index by positive 1
        index++;
        displayEchoData(index);
    }
}

// -------------------------------------- EJECTION FRACTION AND HEART RATEINFORMATION -------------------------------------- \\

// Caculate Ejection Fraction ---->> EF = (EDV - ESV) / EDV
function ejectionFractionAndHeartRate() {
    var chamberArray = [];
    for(var i = 0; i < 200; i++) {
        fetch("echoData/triage/triage" + i + ".json").then(function(response) {
            return response.json();
        }).then(function(data) {
            lvVolumeArray.push(data.LV_Volume);
            heartRateArray.push(data.Heart_Beat_Rate);
            chamberArray.push(data.Target_View);
            arrhythmiaArray.push(data.Arrhythmia);
            // if(data.global_longitudinal_strain !== "Collecting")
                globalLongitudinalStrainArray.push(data.global_longitudinal_strain);  // there is also a value for global_longitudinal_strain_min ---> need to see what that is!!!! ***********
            // console.log(globalLongitudinalStrainArray);
  
            // fill arrays showing the ED and ES locations and values
            if(data.ES_found == "True") {
                endSystolicArray.push(data.ES_list)
            }
            if(data.ED_found == "True") {
                endDiastolicArray.push(data.ED_list)
            }
            // var testingAlert = "3CH";
            if(data.Target_View == "4CH") {
                chamberView = data.Target_View;
                // delete the red tint if it exists and the desired chamber view is correct
                if(document.querySelector(".undesiredViewAlert")) {
                    mainTabWrapper.removeChild(document.querySelector(".undesiredViewAlert"));
                }
            } 
            else {
                chamberView = data.Target_View;
                // turn screen redish with red box-shadow if the desired chamber view is incorrect
                if(document.querySelector(".undesiredViewAlert")) {
                    mainTabWrapper.removeChild(document.querySelector(".undesiredViewAlert"));
                }
                var undesiredViewAlert = document.createElement("div");
                undesiredViewAlert.setAttribute("class", "undesiredViewAlert");
                mainTabWrapper.appendChild(undesiredViewAlert);
            }

            if(lvVolumeArray.length == 200) {
                var endSystolic = Math.min(...lvVolumeArray);
                var endDiastolic = Math.max(...lvVolumeArray);
 
                // var endSystolic = lvVolumeArray[0]; // = Math.min(...lvVolumeArray);
                // var endDiastolic = lvVolumeArray[0]; // = Math.max(...lvVolumeArray);
                // var currentBeat = lvVolumeArray[i];
                // if(currentBeat > endDiastolic) {
                //     endDiastolic = currentBeat;
                // } else {
                //     endDiastolicArray.push(endDiastolic);
                // }

                
                ejectionFraction = (endDiastolic - endSystolic) / endDiastolic * 100;                       

                document.querySelector(".ejectionFractionDisplay").innerHTML = "Desired View: 4-Chamber \t Current View: " + chamberView 
                                        + "<br>HR: " + heartRateArray[0] 
                                        + "<br>EF: " + ejectionFraction.toFixed(2) + "% <br>Arrhythmia: " + arrhythmiaArray[0];
                ejectionFractionBar(ejectionFraction); 
    
            }  
        });
    }
    // console.log(chamberArray);
    // console.log(endSystolicArray);
    // console.log(endDiastolicArray);

}


// -------------------------------------- EJECTION FRACTION BAR -------------------------------------- \\

function ejectionFractionBar(ejectionFraction) {
    if(document.querySelector(".ejectionFractionBar")) {
        ejectionFractionDisplay.removeChild(document.querySelector(".ejectionFractionBar"));
    }
    // create the bar div tag
    var efBar = document.createElement("div");
    efBar.setAttribute("class", "ejectionFractionBar");
    ejectionFractionDisplay.appendChild(efBar);

    // create the bar location div tag
    if(document.querySelector(".ejectionFractionBarLocation")) {
        ejectionFractionDisplay.removeChild(document.querySelector(".ejectionFractionBarLocation"));
    }
    var efBarLocation = document.createElement("div");
    efBarLocation.setAttribute("class", "ejectionFractionBarLocation");
    ejectionFractionDisplay.appendChild(efBarLocation);

    var positionZero = 48;
    efBarLocation.style.left = positionZero + 22 * (ejectionFraction/100) + "%";
}

// -------------------------------------- LEFT VENTRICLE VOLUME CHART -------------------------------------- \\

function addData(chart, data) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function lineChart() { 
    var inputData;
    //create timepoint array
    var timePointsArray = [];
    for(var i = 0; i < 200; i++) {
        timePointsArray.push(i);
    }
    var ctx = document.getElementById('areaVolumeChart').getContext('2d');
    lvVolumeChart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: timePointsArray,
            datasets: [{
                label: 'Left Ventricle Volume', // Left Ventricle Volume
                // backgroundColor: 'rgba(212, 57, 0, 0.1)',
                borderColor: 'rgb(210, 65, 75)',
                data: inputData,
                borderWidth: 1,
                pointBorderColor: "#00000000",
            }
            //{
            //     label: 'Left Ventricle Area',  // Left Ventricle Area
            //     // backgroundColor: 'rgba(0, 57, 212, 0.3)',
            //     borderColor: 'rgb(130, 190, 255)',
            //     data: leftVentricleArea, 
            //     borderWidth: 1,
            //     pointBorderColor: "#00000000",

            // }
        ]
        },
        // Configuration options go here
        options: {
            tooltips: {
                // Disable the on-canvas tooltip
                enabled: false
            },
            responsive: false,
            animation: false,
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: 'white'
                }
            }
        }
        
    });
    return lvVolumeChart;
  }


  // -------------------------------------- LONGITUDINAL STRAIN CHART -------------------------------------- \\

function strainChart() { 
    // globalLongitudinalStrainArray.forEach(element => {
    //     if(element === "Collecting") {
    //         element = null;
    //     } else {
    //         element = element*100;        // NOT DOING ANYTHING
    //     }
    // });
    //create timepoint array
    var timePointsArray = [];
    for(var i = 0; i < 200; i++) {
        timePointsArray.push(i);
    }
    var ctx = document.getElementById('longStrainChartCanvas').getContext('2d');
    longStrainChart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: timePointsArray,
            datasets: [{
                label: 'Global Longitudinal Strain', // Left Ventricle Volume
                // backgroundColor: 'rgba(212, 57, 0, 0.1)',
                borderColor: 'rgb(210, 65, 75)',
                data: globalLongitudinalStrainArray,
                borderWidth: 1,
                pointBorderColor: "#00000000",
            }
            //{
            //     label: 'Left Ventricle Area',  // Left Ventricle Area
            //     // backgroundColor: 'rgba(0, 57, 212, 0.3)',
            //     borderColor: 'rgb(130, 190, 255)',
            //     data: leftVentricleArea, 
            //     borderWidth: 1,
            //     pointBorderColor: "#00000000",

            // }
        ]
        },
        // Configuration options go here
        options: {
            tooltips: {
                // Disable the on-canvas tooltip
                enabled: false
            },
            responsive: false,
            animation: false,
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: 'white'
                }
            }
        }
        
    });
    return longStrainChart;
  }

  // -------------------------------------- 17 SEGMENT HEART MODEL -------------------------------------- \\


  function create17SegmentHeart() {
    var heartSegmentWrapper = document.createElement("div");
    heartSegmentWrapper.setAttribute("class", "heartSegmentWrapper");
    resultsTabWrapper.appendChild(heartSegmentWrapper);    

    // ------- 1 - 6 ------- \\

    var segment1to6 = document.createElement("div");
    segment1to6.setAttribute("class", "segment1to6");
    heartSegmentWrapper.appendChild(segment1to6); 

    // create segment 1
    var segment1 = document.createElement("div");
    segment1.setAttribute("class", "segment1");
    segment1to6.appendChild(segment1);  

    // create segment 2
    var segment2 = document.createElement("div");
    segment2.setAttribute("class", "segment2");
    segment1to6.appendChild(segment2);  

    // create segment 3
    var segment3 = document.createElement("div");
    segment3.setAttribute("class", "segment3");
    segment1to6.appendChild(segment3);  

    // create segment 4
    var segment4 = document.createElement("div");
    segment4.setAttribute("class", "segment4");
    segment1to6.appendChild(segment4);  

    // create segment 5
    var segment5 = document.createElement("div");
    segment5.setAttribute("class", "segment5");
    segment1to6.appendChild(segment5);  

    // create segment 6
    var segment6 = document.createElement("div");
    segment6.setAttribute("class", "segment6");
    segment1to6.appendChild(segment6);  


    // ------- 7 - 12 ------- \\

    var segment7to12 = document.createElement("div");
    segment7to12.setAttribute("class", "segment7to12");
    heartSegmentWrapper.appendChild(segment7to12); 

    // create segment 7
    var segment7 = document.createElement("div");
    segment7.setAttribute("class", "segment7");
    segment7to12.appendChild(segment7);  

    // create segment 8
    var segment8 = document.createElement("div");
    segment8.setAttribute("class", "segment8");
    segment7to12.appendChild(segment8);  

    // create segment 9
    var segment9 = document.createElement("div");
    segment9.setAttribute("class", "segment9");
    segment7to12.appendChild(segment9);  
    
    // create segment 10
    var segment10 = document.createElement("div");
    segment10.setAttribute("class", "segment10");
    segment7to12.appendChild(segment10);  

    // create segment 11
    var segment11 = document.createElement("div");
    segment11.setAttribute("class", "segment11");
    segment7to12.appendChild(segment11);  

    // create segment 12
    var segment12 = document.createElement("div");
    segment12.setAttribute("class", "segment12");
    segment7to12.appendChild(segment12);  


    // ------- 13 - 16 ------- \\

    var segment13to16 = document.createElement("div");
    segment13to16.setAttribute("class", "segment13to16");
    heartSegmentWrapper.appendChild(segment13to16); 

    // create segment 13
    var segment13 = document.createElement("div");
    segment13.setAttribute("class", "segment13");
    segment13to16.appendChild(segment13);  

    // create segment 14
    var segment14 = document.createElement("div");
    segment14.setAttribute("class", "segment14");
    segment13to16.appendChild(segment14);  
    
    // create segment 15
    var segment15 = document.createElement("div");
    segment15.setAttribute("class", "segment15");
    segment13to16.appendChild(segment15);  

    // create segment 16
    var segment16 = document.createElement("div");
    segment16.setAttribute("class", "segment16");
    segment13to16.appendChild(segment16);  


    // ------- 17 ------- \\
    
    // create segment 17
    var segment17 = document.createElement("div");
    segment17.setAttribute("class", "segment17");
    heartSegmentWrapper.appendChild(segment17);  

  }
