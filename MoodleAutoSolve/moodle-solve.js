let settings

// Get the current settings from the local storage
chrome.storage.local.get(
  ["moodleAutoSolveSettings"], function(result) {
    settings = result.moodleAutoSolveSettings
    if (settings == undefined) {
        settings = {
          "mod1":  true,
          "debug": false
        }
        chrome.storage.local.set({"moodleAutoSolveSettings": settings}, function() {})
    }
})

// Execute the rest of the script if certain conditions are met
window.addEventListener('load', function () {
	if (document.baseURI.match(/moodle.*.de\/mod\/hvp/g)) {
		let heading = document.body.getElementsByClassName("page-header-headings")
		let h1 = heading.item(0).textContent
		if(h1.search("Englisch") != -1 || h1.search("English") != -1) {
		    if (settings.debug) {console.log("English-Course")}
		    createButtons()
		}
		else {if (settings.debug) {console.log("Not Englisch-Course")}}
	}
})

// Create a button at the bottom of the H5P frame
function createButtons() {
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    let button_divs = iframe_content.getElementsByClassName("h5p-question-buttons");
    for (let i = 0; i < button_divs.length; i++) {
        let button_div = button_divs[i]
        let button_div_childs = button_div.childNodes
        let button_solve = document.createElement("button")
        let button_check = iframe_content.getElementsByClassName("h5p-question-check-answer")[0]
        button_solve.innerHTML = "Auto Solve"
        button_solve.style.maxHeight = "2.1875em"
        button_solve.className = "h5p-joubelui-button"
        button_solve.setAttribute("page", i.toString())
        button_solve.addEventListener("click", solve, false)
        button_div.insertBefore(button_solve, button_div_childs[1])
        button_divs[i] = button_div
    }
}

// Checks the type of the task and starts the solving function
function solve(event){
    let page = parseInt(event.srcElement.attributes.page.textContent, 10)
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    if (settings.debug) {console.log("Page:" + page)}
    if (settings.debug) {console.log(iframe)}
    let qContainer
    if (iframe_content.getElementsByClassName("questionset").length == 1) {
        let qContainers = iframe_content.getElementsByClassName("question-container")
        qContainer = qContainers[page]
    }
    else {
        qContainer = iframe_content.getElementsByClassName("h5p-container")[0]
    }

    if (qContainer.classList.contains("h5p-blanks")) {h5pBlanks(page)}
    else if (qContainer.classList.contains("h5p-drag-text")) {h5pDragText(page)}
    else if (qContainer.classList.contains("h5p-mark-the-words")) {h5pMarkWords(page)}
    else if (qContainer.classList.contains("h5p-multichoice")) {h5pMultiplechoice(page)}
    else if (qContainer.classList.contains("h5p-dragquestion")) {h5pDragquestion(page)}
    else (alert("Type of the Quiz unknown"))
}

// Solves tasks of type Blanks
function h5pBlanks(page) {
    if (settings.debug) {console.log("Task Type: Blanks")}
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    let qContainer
    if (iframe_content.getElementsByClassName("questionset").length == 1) {
        let qContainers = iframe_content.getElementsByClassName("question-container")
        qContainer = qContainers[page]
    }
    else {
        qContainer = iframe_content.getElementsByClassName("h5p-container")[0]
    }
    let data = document.all[18].innerHTML
    data = JSON.parse(data.slice((data.search("var H5PIntegration =")+21), data.search("//]]>")-2))["contents"]
    let cid = Object.keys(data)[0]
    data = data[cid]
    data = data["jsonContent"]
    data = JSON.parse(data)
    if (settings.debug) {console.log(data)}
    let text = ""
    if (typeof data["questions"][page] == typeof "String") {
        for (let i = 0; i < data["questions"].length; i++)
        text = text + data["questions"][i]
    }
    else {
        if (settings.debug) {console.log("Multiple Pages")}
        text = data["questions"][page]["params"]["questions"][0]
    }
    let answers
    if (settings.mod1) {answers = extractAnswersModified(text)}
    else {answers = extractAnswers(text)}
    let inputs = qContainer.getElementsByClassName("h5p-text-input")
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = answers[i]
    }
}

// Nearly solves tasks of type Drag Text
function h5pDragText(page) {
    if (settings.debug) {console.log("Task Type: Drag Text")}
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    let qContainer
    if (iframe_content.getElementsByClassName("questionset").length == 1) {
        let qContainers = iframe_content.getElementsByClassName("question-container")
        qContainer = qContainers[page]
    }
    else {
        qContainer = iframe_content.getElementsByClassName("h5p-container")[0]
    }
    let data = document.all[18].innerHTML
    data = JSON.parse(data.slice((data.search("var H5PIntegration =")+21), data.search("//]]>")-2))["contents"]
    let cid = Object.keys(data)[0]
    data = data[cid]
    data = data["jsonContent"]
    data = JSON.parse(data)
    if (settings.debug) {console.log(data)}
    let text
    if (typeof data["textField"] == typeof "String") {
        if (settings.debug) {console.log("Single Page")}
        text = data["textField"]
    }
    else {
        if (settings.debug) {console.log("Multiple Pages")}
        text = data["questions"][page]["params"]["textField"]
    }
    let answers = extractAnswers(text)
    let fields = qContainer.getElementsByClassName("ui-droppable")
    for (let i = 0; i < fields.length; i++) {
        fields[i].textContent = answers[i]
    }
}

// Solves tasks of type Mark the Words
function h5pMarkWords(page) {
    if (settings.debug) {console.log("Task Type: Mark the Words")}
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    let qContainer
    if (iframe_content.getElementsByClassName("questionset").length == 1) {
        let qContainers = iframe_content.getElementsByClassName("question-container")
        qContainer = qContainers[page]
    }
    else {
        qContainer = iframe_content.getElementsByClassName("h5p-container")[0]
    }
    let data = document.all[18].innerHTML
    data = JSON.parse(data.slice((data.search("var H5PIntegration =")+21), data.search("//]]>")-2))["contents"]
    let cid = Object.keys(data)[0]
    data = data[cid]
    data = data["jsonContent"]
    data = JSON.parse(data)
    if (settings.debug) {console.log(data)}
    let text
    if (typeof data["textField"] == typeof "String") {
        if (settings.debug) {console.log("Single Page")}
        text = data["textField"]
    }
    else {
        if (settings.debug) {console.log("Multiple Pages")}
        text = data["questions"][page]["params"]["textField"]
    }
    let answers = extractAnswers(text)
    let words = qContainer.getElementsByClassName("h5p-word-selectable-words")[0]
    let wordsEMtmp = words.querySelectorAll("em")
    let wordsEM = []
    for (let i = 0; i < wordsEMtmp.length; i++) {
        let tmp = wordsEMtmp[i].querySelectorAll("span[role='option']")
        for (let j = 0; j < tmp.length; j++) {
            wordsEM.push(tmp[j])
        }  
    }
    let wordsSTtmp = words.querySelectorAll("strong")
    let wordsST = []
    for (let i = 0; i < wordsSTtmp.length; i++) {
        let tmp = wordsSTtmp[i].querySelectorAll("span[role='option']")
        for (let j = 0; j < tmp.length; j++) {
            wordsST.push(tmp[j])
        }  
    }
    if ((wordsEM.length > 0 || wordsST.length > 0)) {
        let tmp = 0
        for (let i = 0; i < answers.length; i++) {
            for (let j = tmp; j < wordsEM.length; j++) {
                if (wordsEM[j].textContent == answers[i]) {
                    wordsEM[j].setAttribute("aria-selected", "true")
                    tmp = j
                    break
                }
            }
            for (let j = tmp; j < wordsST.length; j++) {
                if (wordsST[j].textContent == answers[i]) {
                    wordsST[j].setAttribute("aria-selected", "true")
                    tmp = j
                    break
                }
            }
        }
    } 
    else {
        words = words.querySelectorAll("span[role='option']")
        if (settings.debug) {console.log(words)}
            if (settings.debug) {console.log(answers)}
        for (let x = 0; x < words.length; x++) {
            for (let i = 0; i < answers.length; i++) {
                if (words[x].textContent == answers[i]) {
                    words[x].setAttribute("aria-selected", "true")
                    break
                }
            }
        }
    }
}

// Solves tasks of type Multiple Choice
function h5pMultiplechoice(page) {
    if (settings.debug) {console.log("Task Type: Multiple Choice")}
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    let qContainer
    if (iframe_content.getElementsByClassName("questionset").length == 1) {
        let qContainers = iframe_content.getElementsByClassName("question-container")
        qContainer = qContainers[page]
    }
    else {
        qContainer = iframe_content.getElementsByClassName("h5p-container")[0]
    }
    let data = document.all[18].innerHTML
    data = JSON.parse(data.slice((data.search("var H5PIntegration =")+21), data.search("//]]>")-2))["contents"]
    let cid = Object.keys(data)[0]
    data = data[cid]
    data = data["jsonContent"]
    data = JSON.parse(data)
    data = data["questions"][page]["params"]["answers"]
    let solution = []
    for (let i = 0; i < data.length; i++) {
        if (data[i]["correct"] == true) {
            solution.push(data[i]["text"].slice(5).slice(0, -7))
        }
    }
    if (settings.debug) {console.log(solution)}
    let answers = qContainer.getElementsByClassName("h5p-answer")
    for (let i = 0; i < answers.length; i++) {
        for (let j = 0; j < solution.length; j++) {
            if (answers[i].innerText == solution[j]) {
                answers[i].setAttribute("aria-checked", true)
                answers[i].classList.add("h5p-selected")
                break
            }
            else {
                answers[i].setAttribute("aria-checked", false)
                if (answers[i].classList.contains("h5p-selected")) {
                    answers[i].classList.remove("h5p-selected")
                }
            }
        }
    }
}

// Nearly solves tasks of type Drag-Questions
function h5pDragquestion(page) {
    if (settings.debug) {console.log("Task Type: Drag-Question")}
    let iframe = document.getElementsByClassName("h5p-iframe")[0]
    let iframe_content = iframe.contentWindow.document.body
    let qContainer
    if (iframe_content.getElementsByClassName("questionset").length == 1) {
        let qContainers = iframe_content.getElementsByClassName("question-container")
        qContainer = qContainers[page]
    }
    else {
        qContainer = iframe_content.getElementsByClassName("h5p-container")[0]
    }
    let data = document.all[18].innerHTML
    data = JSON.parse(data.slice((data.search("var H5PIntegration =")+21), data.search("//]]>")-2))["contents"]
    let cid = Object.keys(data)[0]
    data = data[cid]
    data = data["jsonContent"]
    data = JSON.parse(data)
    if (settings.debug) {console.log(data)}
    data = data["questions"][page]["params"]["question"]["task"]["dropZones"]
    let answers = []
    for (let i = 0; i < data.length; i++) {
        answers.push(data[i]["label"].slice(5).slice(0, -7))
    }
    let fields = qContainer.getElementsByClassName("ui-droppable")
    for (let i = 0; i < fields.length; i++) {
        fields[i].innerText = answers[i]
    }
    
}

// Extracts the answers from a given text (*Input/Output* will be convertet to answer 'Input/Output')
function extractAnswers(text) {
    let inside = false
    let temp = ""
    let answers = []
    for (let i = 0; i < text.length; i++) {
        if (text[i] == "*" && inside == false) {
            inside = true
        }
        else if (text[i] == "*" && inside == true) {
            inside = false
            answers.push(temp)
            temp = ""
        }
        else if (inside == true ) {
            temp += text[i]
        }
    }
    return answers
}

// Extracts the answers from a given text (*Input/Output* will be convertet to answer 'Input')
function extractAnswersModified(text) {
    let inside = false
    let temp = ""
    let answers = []
    let ignore = false;
    for (let i = 0; i < text.length; i++) {

        if (text[i] == "*" && inside == false && ignore == false) {
            inside = true
        }
        else if (text[i] == "*" && inside == true && ignore == false) {
            inside = false
            answers.push(temp)
            temp = ""
        }
        else if (text[i] == "*" && inside == false && ignore == true) {
            ignore = false
            inside = false
        }
        else if (text[i] == "/" && inside == true && ignore == false) {
            inside = false
            answers.push(temp)
            temp = ""
            ignore = true
        }
        else if (inside == true ) {
            temp += text[i]
        }
    }
    return answers
}