
function fillTextarea(text){
  createTextarea();
  document.getElementById('storyText').innerHTML = text;
}

function createTextarea(){
  let parent = document.getElementById('main');
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  let node = document.createElement("textarea");
  node.className = "form-control";
  node.rows = 35;
  node.style = "font-family:monospace;font-size:12pt;line-height:18px;"
  node.id = "storyText";
  parent.appendChild(node);
}



