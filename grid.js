
function fillGrid(level, title){
  createGrid(title);
  for(let i=0; i < story.length; i++){
    if (story[i].level == level){
      addGridItem(story[i].name, story[i].headers[0]);
    }
  }
}
    
function createGrid(title){
  let parent = document.getElementById('main');
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  let node = document.createElement("div");
  node.className ="container px-4 py-5";
  parent.appendChild(node);
  parent = node;
  node = document.createElement("h2");
  node.className = "pb-1 border-bottom";
  node.innerHTML = title;
  parent.appendChild(node);
  node = document.createElement("div");
  node.className = "row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 py-5";
  node.id = "grid";
  parent.appendChild(node);
}

function addGridItem(title, description){
  let parent = document.getElementById("grid");
  let node = document.createElement("div");
  node.className = "col d-flex align-items-start";
  parent.appendChild(node);
  parent = node;
  node = document.createElement("div");
  parent.appendChild(node);
  parent = node;
  node = document.createElement("h4");
  node.className = "fw-bold mb-0";
  node.innerHTML = title;
  parent.appendChild(node);
  node = document.createElement("p");
  node.innerHTML = replaceHashes(description);
  parent.appendChild(node);
  node = document.createElement("a");
  node.href = "#part/" + title;
  node.onclick= function() {showPart(title);};
  node.innerHTML = "Bekijk";
  parent.appendChild(node);
}
