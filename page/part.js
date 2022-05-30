
function showPart(name, replace = true){
  part = partByName(name);
  let parent = document.getElementById('main');
  if (replace){
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
  let node = document.createElement("div");
  node.className ="container px-4 py-5";
  parent.appendChild(node);
  parent = node;
  node = document.createElement("h3");
  node.className = "pb-1 border-bottom";
  node.innerHTML = part.type + ": " + replaceHashes(part.headers[0]);
  parent.appendChild(node);
  addHeader(part, parent);
  node = document.createElement("br");
  parent.appendChild(node);
  if (part.type == "LOCATIE"){
    showOverzichtVoorvallen("OVERZICHT", v => v.locatie === name, parent);
  }
  else if (part.type == "TIJD"){
    showOverzichtVoorvallen("OVERZICHT", v => v.tijd === name, parent);
  }
  else if (part.type == "ELEMENT" || part.type == "PERSONAGE" || part.type == "CONCEPT"){
    showOverzichtVoorvallen("OVERZICHT", v => v.participanten ? v.participanten.includes(name) : false, parent);
  }
  else if (part.type == "SCENE"){
    part.voorvallen.forEach(vv => showPart(vv, false));
  }
}

function tijdLink(tijdName, withDescription = false, descriptionAsLink = true){
  if (partByName(tijdName, false)){
    return partLink(tijdName, withDescription, descriptionAsLink);
  }
  else{
    return "<a href='#tijdlist/" + tijdName + "' class='text-decoration-none'>" + tijdName + "</a>";
  }
}

function partLink(partName, withDescription = false, descriptionAsLink = true, customDescription = false){
  if (!partName){
    return "";
  }
  else if (withDescription && descriptionAsLink){
    if (customDescription){
      return "<a href='#part/" + partName + "' class='text-decoration-none'>" + customDescription + "</a>";
    }
    let part = partByName(partName);
    if (part.type == "TIJD" && part.headers[1]){
      return "<a href='#part/" + partName + "' class='text-decoration-none'>" + part.headers[1] + "</a>";
    }
    else{
      return "<a href='#part/" + partName + "' class='text-decoration-none'>" + replaceHashes(part.headers[0]) + "</a>";
    }
  }
  else if (withDescription){
    return partByName(partName).headers[0] + " (<a href='#part/" + partName + "'>" + partName + "</a>)";
  }
  return "<a href='#part/" + partName + "'>" + partName + "</a>";
}


function addHeader(part, parent){
  function addRow(col1, col2, table){
    let row = document.createElement("tr");
    table.append(row);
    let col = document.createElement("th");
    col.setAttribute("scope", "row");
    col.innerHTML = col1;
    row.append(col);
    col = document.createElement("td");
    col.innerHTML = replaceHashes(col2);
    row.append(col);
  }
  
  let node = document.createElement("table");
  node.className = "table table-striped w-auto";
  parent.appendChild(node);
  parent = node;
  node = document.createElement("tbody");
  parent.appendChild(node);
  parent = node;
  addRow("Code", part.name, parent);
  if (part.type == "TIJD"){
    addRow("Korte beschrijving", part.description, parent);
    addRow("Van", part.datumTijdVan, parent);
    addRow("Tot", part.datumTijdTot, parent);
  }
  else if (part.type == "LOCATIE"){
    addRow("Korte beschrijving", part.description, parent);
  }
  else if (part.type == "ELEMENT"){
    addRow("Korte beschrijving", part.description, parent);
  }
  else if (part.type == "PERSONAGE"){
    addRow("Naam", part.fullName, parent);
    addRow("Geboortedatum", part.birthDate, parent);
    addRow("Overlijdensdatum", part.deathDate, parent);
  }
  else if (part.type == "CONCEPT"){
    addRow("Korte beschrijving", part.description, parent);
  }
  else if (part.type == "TRANSFORMATIE"){
    addRow("Korte beschrijving", part.description, parent);
    if (part.transformatieVan){
      addRow("Element/personage/concept", partLink(part.transformatieVan, true), parent);
    }
    else{
      addRow("Element/personage/concept", "", parent);
    }
  }
  else if (part.type == "VOORVAL"){
    addRow("Korte beschrijving", part.description, parent);
    addRow("Tijd", tijdLink(part.tijd, true), parent);
    addRow("Locatie", partLink(part.locatie, true), parent);
    addRow("Elementen", part.participanten ? part.participanten.filter(p => partByName(p).type == "ELEMENT").map(p => partLink(p, true)).join(", ") : "", parent);
    addRow("Personages", part.participanten ? part.participanten.filter(p => partByName(p).type == "PERSONAGE").map(p => partLink(p, true)).join(", ") : "", parent);
    addRow("Concepten", part.participanten ? part.participanten.filter(p => partByName(p).type == "CONCEPT").map(p => partLink(p, true)).join(", ") : "", parent);
    addRow("Transformaties", part.transformaties ? part.transformaties.map(p => partLink(p, true)).join(", ") : "", parent);
  }
  else if (part.type == "GEBEURTENIS"){
    addRow("Korte beschrijving", part.description, parent);
    addRow("Voorvallen, gebeurtenissen", part.voorvallen.map(p => partLink(p, true)).join(", "), parent);
  }
  else if (part.type == "SCENE"){
    addRow("Korte beschrijving", part.description, parent);
    addRow("Verteller(s)", part.vertellers.map(p => partLink(p, true)).join(", "), parent);
    addRow("Voorvallen, gebeurtenissen", part.voorvallen.map(p => partLink(p, true)).join(", "), parent);
  }
  else if (part.type == "DEEL"){
    addRow("Subdelen/scenes", part.subDelenOfScenes.map(p => partLink(p, true)).join(", "), parent);
  }
  else if (part.type == "PLOT"){
    addRow("Korte beschrijving", part.description, parent);
    addRow("Subplots", part.subPlots.map(p => partLink(p, true)).join(", "), parent);
  }
  else if (part.type == "SYNOPSIS"){
    addRow("Korte beschrijving", part.titel, parent);
    addRow("Plots", part.plots.map(p => partLink(p, true)).join(", "), parent);
    addRow("Delen", part.delen.map(p => partLink(p, true)).join(", "), parent);
  }
  let referenties = [];
  part.references.forEach(
    r => referenties.push(r.refs.map(ref => partLink(ref)).join(", ") + (r.description ? " " + r.description + " " : "")));
  addRow("Verwijst naar", referenties.join("<br/>"), parent);
  
  let refsvan = [];
  story.forEach(
    p => p.references.forEach(
      r => {
        if (r.refs.includes(part.name)){
          refsvan.push(partLink(p.name, true) + " => " + r.refs.map(ref => partLink(ref)).join(", ") + (r.description ? " " + r.description + " " : ""));
        }
      }
    )
  );
  addRow("Verwijzingen van", refsvan.join("<br/>"), parent);
  addRow("Tekst", part.body ? part.body.join("<br/>") : "", parent);
}

function replaceHashes(txt){
  if (typeof txt !== 'string') {
    return txt;
  }
  return txt.replace(/(\(|^|\s)#[a-zA-Z0-9_]+/g, function (m) {
    let s = m.split("#");
    return s[0] + partByName(s[1]).headers[0];
  });
}


