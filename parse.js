var story = [];

function importData(file, onFinished){
  readFile(file, parse, onFinished);
}

function readFile(file, funcOnFileLoaded, funcOnParsed){
  var fr=new FileReader();
  fr.onload=function(){
    funcOnFileLoaded(this.result);
    if (funcOnParsed){
      funcOnParsed();
    }
  }
  fr.readAsText(file);
}

function parse(text){
  story = [];
  lines = trimElements(text.split(/\r?\n/));
  explodeShortHand(lines);
  startIndex = findHeader(lines, 0);
  while (startIndex != -1){
    endIndex = findHeader(lines, startIndex + 3);
    if (endIndex == -1){
      story.push(parsePart(lines.slice(startIndex)));
    }
    else{
      story.push(parsePart(lines.slice(startIndex, endIndex)));
    }
    startIndex = endIndex;
  }
  checkRefs();
  
  story.sort((a, b) => a.level != b.level ? a.level - b.level : (a.name < b.name ? -1 : 1));
}

function trimElements(stringArray){
  for (let i = 0; i < stringArray.length; i++){
    stringArray[i] = stringArray[i].trim();
  }
  return stringArray;
}

function upperElements(stringArray, startindex = 0){
  for (let i = startindex; i < stringArray.length; i++){
    stringArray[i] = stringArray[i].toUpperCase();
  }
  return stringArray;
}

function explodeShortHand(lines){
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(">") && getParser(lines[i].substring(1)) !== null){
      var parts = convertShortHand(lines[i].substring(1));
      lines.splice(i, 1, parts[0], parts[1], parts[2], parts[3], parts[4]);
    }
  }
}

function convertShortHand(str)
{
  var parts = str.split(":", 4);
  if (parts.length == 2){
    return [parts[0] + ": " + parts[1], "=", parts[1].toLowerCase(), "-", ""];
  }
  else if (parts.length == 3){
    return [parts[0] + ": " + parts[1], "=", parts[2], "-", ""];
  }
  else if (parts.length == 4){
    return [parts[0] + ": " + parts[1], "=", parts[2], "-", parts[3]];
  }
}


function findHeader(lines, startIndex){
  for (let i = startIndex + 3; i < lines.length; i++) {
    if (lines[i].startsWith("-") && (lines[i].replace(/-/g, "").trim() === "")){
      if (lines[i-2].startsWith("=") && (lines[i-2].replace(/=/g, "").trim() === "")){
        if (getParser(lines[i-3])){
          return i - 3;
        }
      }
    }
  }
  return -1;
}

function removeHints(headers){
  for (let i = 0; i < headers.length; i++){
    if (headers[i].startsWith("<<") && headers[i].endsWith(">>")){
      headers[i] = null;
    }
  }
  return headers;
}

function parsePart(lines){
  //alert(lines.join("\n"));
  lines[0] = lines[0].toUpperCase();
  name = lines[0].split(":")[1].trim();
  headers = removeHints(upperElements(trimElements(lines[2].split("|")), 1));
  refs = [];
  body = [];
  inRef = false;
  for(let i = 4; i < lines.length; i++){
    line = lines[i].trim();
    if (line.startsWith("[")){
      while (!line.endsWith("]") && i < lines.length - 1){
        i++;
        line += "\n" + lines[i].trim();
      }
      refs.push(parseRef(line));
    }
    else{
      body.push(line);
    }
  }
  while (body.length > 0 && !body[body.length-1].trim()){
    body.pop();
  }
  return getParser(lines[0])({
    "name":name,
    "references": refs,
    "headers": headers,
    "body": body});
}

function parseRef(line){
  parts = line.substring(1, line.length - 1).split(":", 2);
  referencedParts = upperElements(trimElements(parts[0].split(",")));
  return {"refs":referencedParts, "description": (parts[1] ? parts[1].trim() : "")};
}

function getParser(line){
  line = line.toUpperCase();
  if (line.startsWith("L:") || line.startsWith("LOCATIE:")){
    return parseLocatie;
  }
  else if (line.startsWith("T:") || line.startsWith("TIJD:")){
    return parseTijd;
  }
  else if (line.startsWith("E:") || line.startsWith("ELEMENT:")){
    return parseElement;
  }
  else if (line.startsWith("P:") || line.startsWith("PERSONAGE:")){
    return parsePersonage;
  }
  else if (line.startsWith("C:") || line.startsWith("CONCEPT:")){
    return parseConcept;
  }
  else if (line.startsWith("V:") || line.startsWith("VOORVAL:")){
    return parseVoorval;
  }
  else if (line.startsWith("G:") || line.startsWith("GEBEURTENIS:")){
    return parseGebeurtenis;
  }
  else if (line.startsWith("PL:") || line.startsWith("PLOT:")){
    return parsePlot;
  }
  else if (line.startsWith("TR:") || line.startsWith("TRANSFORMATIE:")){
    return parseTransformatie;
  }
  else if (line.startsWith("S:") || line.startsWith("SCENE:")){
    return parseScene;
  }
  else if (line.startsWith("D:") || line.startsWith("DEEL:")){
    return parseDeel;
  }
  else if (line.startsWith("SYN:") || line.startsWith("SYNOPSIS:")){
    return parseSynopsis;
  }
  return null;
}

function partByName(name, giveAlert = true){
  for(let i = 0; i < story.length; i++){
    if (story[i].name == name){
      return story[i];
    }
  }
  if (giveAlert){
    alert("part " + name + " not found!");
  }
  return null;
}

function checkArrayRef(part, field, levels){
  for (let i=0; i < field.length; i++){
    checkRef(part, field[i], levels);
  }
}

function checkRef(part, field, levels){
  if (field){
    if (!levels.includes(partByName(field).level)){
      alert("Illegal ref " + part.name + ": " + field);
    }
  }
}

function checkRefs(){
  for(let i1 = 0; i1 < story.length; i1++){
    for (let i2 = 0; i2 < story[i1].references.length; i2++){
      for (let i3 = 0; i3 < story[i1].references[i2].refs.length; i3++){
        if (story[i1].level < partByName(story[i1].references[i2].refs[i3]).level){
          alert("Illegal ref: " + story[i1].name + " => "  + story[i1].references[i2].refs[i3]);
        }
      }
    }
    if (story[i1].type == "TRANSFORMATIE" && story[i1].transformatieVan){
      checkRef(story[i1], story[i1].transformatieVan, [3,4,5]);
    }
    else if (story[i1].type == "VOORVAL"){
      if (story[i1].tijd){
        if (partByName(story[i1].tijd, false)){
          checkRef(story[i1], story[i1].tijd, [1]);
        }
      }
      if (story[i1].locatie){
        checkRef(story[i1], story[i1].locatie, [2]);
      }
      if (story[i1].participanten){
        checkArrayRef(story[i1], story[i1].participanten, [3,4,5]);
      }
      if (story[i1].transformaties){
        checkArrayRef(story[i1], story[i1].transformaties, [6]);
      }
    }
    else if (story[i1].type == "GEBEURTENIS" && story[i1].voorvallen){
      checkArrayRef(story[i1], story[i1].voorvallen, [7,8]);
    }
    else if (story[i1].type == "SCENE"){
      if (story[i1].vertellers){
        checkArrayRef(story[i1], story[i1].vertellers, [4]);
      }
      if (story[i1].voorvallen){
        checkArrayRef(story[i1], story[i1].voorvallen, [7,8]);
      }
    }
    else if (story[i1].type == "DEEL" && story[i1].subDelenOfScenes){
      if (story[i1].subDelenOfScenes.length > 0){
        checkRef(story[i1], story[i1].subDelenOfScenes[0], [9, 10]);
        checkArrayRef(story[i1], story[i1].subDelenOfScenes, [partByName(story[i1].subDelenOfScenes[0]).level]);
      }
    }
    else if (story[i1].type == "PLOT" && story[i1].subPlots){
      checkArrayRef(story[i1], story[i1].subPlots, [11]);
    }
    else if (story[i1].type == "SYNOPSIS"){
      if (story[i1].delen){
        checkArrayRef(story[i1], story[i1].delen, [10]);
      }
      if (story[i1].plots){
        checkArrayRef(story[i1], story[i1].plots, [11]);
      }
    }
  }
}

function parseTijd(obj){
  obj.level = 1;
  obj.type = "TIJD";
  if (obj.headers.length == 2){
    obj.headers.splice(2, 0, obj.headers[1]);
  }
  obj.description = obj.headers[0];
  obj.datumTijdVan = obj.headers[1] ? obj.headers[1] : null;
  obj.datumTijdTot = obj.headers[2] ? obj.headers[2] : null;
  return obj;
}

function parseLocatie(obj){
  obj.level = 2;
  obj.type = "LOCATIE";
  obj.description = obj.headers[0];
  return obj;
}

function parseElement(obj){
  obj.level = 3;
  obj.type = "ELEMENT";
  obj.description = obj.headers[0];
  return obj;
}

function parsePersonage(obj){
  obj.level = 4;
  obj.type = "PERSONAGE";
  obj.fullName = obj.headers[0];
  obj.birthDate = obj.headers[1] ? obj.headers[1] : null;
  obj.deathDate = obj.headers[2] ? obj.headers[2] : null;
  return obj;
}

function parseConcept(obj){
  obj.level = 5;
  obj.type = "CONCEPT";
  obj.description = obj.headers[0];
  return obj;
}

function parseTransformatie(obj){
  obj.level = 6;
  obj.type = "TRANSFORMATIE";
  obj.description = obj.headers[0];
  obj.transformatieVan = obj.headers[1] ? obj.headers[1] : null;
  return obj;
}

function parseVoorval(obj){
  obj.level = 7;
  obj.type = "VOORVAL";
  obj.description = obj.headers[0];
  obj.tijd = obj.headers[1] ? obj.headers[1] : null;
  obj.locatie = obj.headers[2] ? obj.headers[2] : null;
  obj.participanten = obj.headers[3] ? trimElements(obj.headers[3].split(",")) : null;
  obj.transformaties = obj.headers[4] ? trimElements(obj.headers[4].split(",")) : null;
  return obj;
}

function parseGebeurtenis(obj){
  obj.level = 8;
  obj.type = "GEBEURTENIS";
  obj.description = obj.headers[0];
  obj.voorvallen = obj.headers[1] ? trimElements(obj.headers[1].split(",")) : null;
  return obj;
}

function parseScene(obj){
  obj.level = 9;
  obj.type = "SCENE";
  obj.description = obj.headers[0];
  obj.vertellers = obj.headers[1] ? trimElements(obj.headers[1].split(",")) : null;
  obj.voorvallen = obj.headers[2] ? trimElements(obj.headers[2].split(",")) : null;
  return obj;
}

function parseDeel(obj){
  obj.level = 10;
  obj.type = "DEEL";
  obj.description = obj.headers[0];
  obj.subDelenOfScenes = obj.headers[1] ? trimElements(obj.headers[1].split(",")) : null;
  return obj;
}

function parsePlot(obj){
  obj.level = 11;
  obj.type = "PLOT";
  obj.description = obj.headers[0];
  obj.subPlots = obj.headers[1] ? trimElements(obj.headers[1].split(",")) : null;
  return obj;
}

function parseSynopsis(obj){
  obj.level = 12;
  obj.type = "SYNOPSIS";
  obj.titel = obj.headers[0];
  obj.plots = obj.headers[1] ? trimElements(obj.headers[1].split(",")) : null;
  obj.delen = obj.headers[2] ? trimElements(obj.headers[2].split(",")) : null;
  return obj;
}


function storyAsText(){
  let txt = [];
  for(let i=0; i < story.length; i++){
    let p = story[i];
    txt.push(p.type + ": " + p.name);
    txt.push("=".padEnd(txt[txt.length-1].length ,"="));
    addHeaderHints(p.type, p.headers);
    txt.push(p.headers.join(" | "));
    txt.push("-".padEnd(txt[txt.length-1].length ,"-"));
    for (let j=0; j < p.references.length; j++){
      txt.push("[" + p.references[j].refs.join(", ") + (p.references[j].description ? ": " + p.references[j].description: "") + "]");
    }
    p.body.forEach(line => txt.push(line));
    txt.push("");
    txt.push("");
  }
  let text = txt.join("\n");
  return text;
}

function setHeaderLength(header, length){
  while (header.length < length){
    header.push(null);
  }
  while (header.length > length){
    header.pop();
  }
}

function setHeaderHints(header, hints){
  setHeaderLength(header, hints.length);
  for (let i = 0; i < header.length; i++){
    if (header[i] == "" || header[i] == null){
      header[i] = "<<" + hints[i] + ">>";
    }
  }
}

function addHeaderHints(type, header){
 if (type == "TIJD"){
   setHeaderHints(header, ["korte beschrijving", "van", "tot"]);
 }
 else if (type == "LOCATIE"){
   setHeaderHints(header, ["korte beschrijving"]);
 }
 else if (type == "ELEMENT"){
   setHeaderHints(header, ["korte beschrijving"]);
 }
 else if (type == "PERSONAGE"){
   setHeaderHints(header, ["naam", "geboortedatum", "overlijdensdatum"]);
 }
 else if (type == "CONCEPT"){
   setHeaderHints(header, ["korte beschrijving"]);
 }
 else if (type == "TRANSFORMATIE"){
   setHeaderHints(header, ["korte beschrijving", "ELEMENT/PERSONAGE/CONCEPT"]);
 }
 else if (type == "VOORVAL"){
   setHeaderHints(header, ["korte beschrijving", "TIJD", "LOCATIE", "ELEMENTEN,PERSONAGES,CONCEPTEN", "TRANSFORMATIES"]);
 }
 else if (type == "GEBEURTENIS"){
   setHeaderHints(header, ["korte beschrijving", "VOORVALLEN,GEBEURTENISSEN"]);
 }
 else if (type == "SCENE"){
   setHeaderHints(header, ["korte beschrijving", "VERTELLERS", "VOORVALLEN,GEBEURTENISSEN"]);
 }
 else if (type == "DEEL"){
   setHeaderHints(header, ["korte beschrijving", "SUBDELEN/SCENES"]);
 }
 else if (type == "PLOT"){
   setHeaderHints(header, ["korte beschrijving", "SUBPLOTS"]);
 }
 else if (type == "SYNOPSIS"){
   setHeaderHints(header, ["korte beschrijving", "PLOTS", "DELEN"]);
 }
}

