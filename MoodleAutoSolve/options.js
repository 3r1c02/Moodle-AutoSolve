let settings

chrome.storage.local.get(
  ["moodleAutoSolveSettings"], function(result) {
    console.log(result)
    console.log('Settings are ' + result.moodleAutoSolveSettings)
    settings = result.moodleAutoSolveSettings
    continueCode(settings)
})

function continueCode(settings) {
    if (settings == undefined) {
    console.log("Set settings to default")
    settings = {
      "mod1":  true,
      "debug": false
    }
  }

  let mod1 = document.createElement("input")
  let debug = document.createElement("input")
  mod1.type = "checkbox"
  if (settings["mod1"]) {
    mod1.checked = true
  }
  debug.type = "checkbox"
  if (settings["debug"]) {
    debug.checked = true
  }

  let save_button = document.createElement("button")
  save_button.innerText = "Save"
  save_button.addEventListener("click", function(event, settings){save(settings)})
  document.getElementById("mod1").appendChild(mod1)
  document.getElementById("debug").appendChild(debug)
  document.getElementById("settings").appendChild(save_button)

  function save() {
    settings["mod1"] = mod1.checked
    settings["debug"] = debug.checked
    chrome.storage.local.set({"moodleAutoSolveSettings": settings}, function() {
      console.log(settings);
    })
  }
}