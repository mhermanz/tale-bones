
function showOverzichtAfkortingen(title = "AFKORTINGEN", filter = null, parentNode = null){
  let [h, b] = createTable(title, parentNode);
  addOverzichtRow(["TYPE", "AFKORTING", "KORTE OMSCHRIJVING"], h, true);
  let vv = story;
  if (filter !== null){
    vv = vv.filter(filter);
  }
  vv.sort((v1, v2) => srtName(v1, v2));
  vv.forEach(v => {
    addOverzichtRow([v.type, partLink(v.name, true, true, "#" + v.name), v.headers[0]], b);
  });
}

function showOverzichtVoorvallen(title = "VOORVALLEN", filter = null, parentNode = null){
  let [h, b] = createTable(title, parentNode);
  addOverzichtRow(["TIJD", "LOCATIE", "VOORVAL", "PERSONAGES", "ELEMENTEN", "CONCEPTEN", "TRANSFORMATIES"], h, true);
  let vv = story.filter(p => p.type == "VOORVAL");
  if (filter !== null){
    vv = vv.filter(filter);
  }
  vv.sort((v1, v2) => srtVoorval(v1, v2));
  vv.forEach(v => {
    let tijd = v.tijd ? tijdLink(v.tijd, true) : "";
    let locatie = v.locatie ? partLink(v.locatie, true) : "";
    let personages = v.participanten ? v.participanten.filter(p => partByName(p).type == "PERSONAGE").map(p => partLink(p, true)).join(", ") : "";
    let elementen = v.participanten ? v.participanten.filter(p => partByName(p).type == "ELEMENT").map(p => partLink(p, true)).join(", ") : "";
    let concepten = v.participanten ? v.participanten.filter(p => partByName(p).type == "CONCEPT").map(p => partLink(p, true)).join(", ") : "";
    let transformaties = v.transformaties ? v.transformaties.map(p => partLink(p, true)).join(", ") : "";
    addOverzichtRow([tijd, locatie, partLink(v.name, true), personages, elementen, concepten, transformaties], b);
  });
}

function showOverzichtTransformaties(title = "TRANSFORMATIES", filter = null, parentNode = null){
  let [h, b] = createTable(title, parentNode);
  addOverzichtRow(["TIJD", "LOCATIE", "TRANSFORMATIE", "VOORVAL"], h, true);
  let vv = story.filter(p => p.type == "VOORVAL");
  vv.sort((v1, v2) => srtVoorval(v1, v2));
  let tf = story.filter(p => p.type == "TRANSFORMATIE");
  if (filter !== null){
    tf = tf.filter(filter);
  }
  tf.sort((t1, t2) => srtTransformatie(t1, t2, vv));
  tf.forEach(t => {
    let v = t.vv;
    if (v){
      let tijd = v.tijd;
      if (tijd){
        tijd = partByName(tijd);
        tijd = tijd.datumTijdVan ? tijd.datumTijdVan + " (" + partLink(tijd.name) + ")" : tijd.name;
      }
      let locatie = v.locatie ? partLink(v.locatie, true) : "";
      addOverzichtRow([tijd, locatie, partLink(t.name, true), partLink(v.name, true)], b);
    }
    else{
      addOverzichtRow(["", "", partLink(t.name, true), ""], b);
    }
  });
}


function showOverzichtPlot(title = "PLOT", parentNode = null){
  let vv = story.filter(p => p.type == "SYNOPSIS");
  if (vv.length !== 1){
    alert("Een verhaal heeft exact 1 synopsis nodig. " + vv.length + "gevonden!");
    return;
  }
  let l = createList(title, parentNode);
  l = addListItem(l, partLink(vv[0].name, true));
  function addPlot(parent, pl){
    parent = addListItem(parent, partLink(pl, true));
    pl = partByName(pl);
    if (pl && pl.subPlots){
      pl.subPlots.forEach(p => addPlot(parent, p));
    }
  }
  if (vv[0].plots){
    vv[0].plots.forEach(pl => addPlot(l, pl));
  }
}

function showOverzichtScenes(title = "SCÈNES", parentNode = null){
  let vv = story.filter(p => p.type == "SYNOPSIS");
  if (vv.length !== 1){
    alert("Een verhaal heeft exact 1 synopsis nodig. " + vv.length + "gevonden!");
    return;
  }
  let l = createList(title, parentNode);
  l = addListItem(l, partLink(vv[0].name, true));
  function addDeel(parent, dl){
    parent = addListItem(parent, partLink(dl, true));
    dl = partByName(dl);
    if (dl && dl.subDelenOfScenes && dl.subDelenOfScenes.length > 0){
      if (partByName(dl.subDelenOfScenes[0]).type == "DEEL"){
        dl.subDelenOfScenes.forEach(d => addDeel(parent, d));
      }
      else{
        dl.subDelenOfScenes.forEach(sc => addListItem(parent, partLink(sc, true)));
      }
    }
  }
  if (vv[0].delen){
    vv[0].delen.forEach(d => addDeel(l, d));
  }
}

function showOverzichtTijden(title = "TIJDEN", parentNode = null, tijdContext = null){
  function isWithIn(t1, t2){
    if (t1.tot){
      return (t1.van <= t2.van) && (t1.tot >= (t2.tot ? t2.tot : t2.van));
    }
    if ((t2.tot) && ((t1.van.length >= t2.tot.length) || (!t2.tot.startsWith(t1.van)))){
      return false;
    }
    return t1.van.length < t2.van.length && t2.van.startsWith(t1.van);
  }
  function add2TijdList(tijd, txt, list){
    if (!tijd){
      return;
    }
    let t = partByName(tijd, false);
    if (t === null || t.type !== "TIJD" || !t.datumTijdVan){
      list.push({van:tijd,tot:null,txt:txt,sub:[]});
    }
    else
    {
      list.push({van:t.datumTijdVan,tot:t.datumTijdTot,txt:txt,sub:[]});
    }
  }
  function treeify(list, l){
    let i=0;
    while (i<list.length){
      while (i<list.length-1 && isWithIn(list[i], list[i+1])){
        list[i].sub.push(list[i+1]);
        list.splice(i+1, 1);
      }
      treeify(list[i].sub, addListItem(l, list[i] == tijdContext ? "<b>" + list[i].txt + "</b>" : list[i].txt));
      i++;
    }
  }
  let list = [];
  story.forEach(p => {
    if (p.type == "PERSONAGE"){
      add2TijdList(p.birthDate, p.birthDate + " " + partLink(p.name, true, true, "Geboorte: " + p.fullName), list);
      add2TijdList(p.deathDate, p.deathDate + " " + partLink(p.name, true, true, "Sterfdag: " + p.fullName), list);
    }
    else if (p.type == "TIJD"){
      let t = p.datumTijdVan + (p.datumTijdTot ? " / " + p.datumTijdTot : "");
      add2TijdList(p.name, t + " " + partLink(p.name, true, true, "Tijd: " + p.description), list);
    }
    else if (p.type == "VOORVAL" && !partByName(p.tijd, false)){
      add2TijdList(p.tijd, p.tijd + " " + partLink(p.name, true, true, "Voorval: " + p.description), list);
    }
  });
  list.sort((t1,t2) => t1.van < t2.van ? -1 : 1);
  if (tijdContext){
    tijdContext = list.find(it => it.van == tijdContext && it.tot === null);
    list = list.filter(it => it == tijdContext || isWithIn(it,tijdContext) || isWithIn(tijdContext, it));
  }
  let l = createList(title, parentNode);
  treeify(list, l);
}

function prepParent(title, parent){
  if (parent === null){
    parent = document.getElementById('main');
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    let node = document.createElement("div");
    node.className ="container px-4 py-5";
    parent.appendChild(node);
    parent = node;
  }
  let header = document.createElement("h3");
  header.className = "pb-1 border-bottom";
  header.innerHTML = title;
  parent.appendChild(header);
  return parent;
}

function createList(title, parent){
  parent = prepParent(title, parent);
  let list = document.createElement("ul");
  parent.appendChild(list);
  return list;
}

function addListItem(ul, innerHtml){
  let li = document.createElement("li");
  li.innerHTML = innerHtml;
  ul.appendChild(li);
  ul = document.createElement("ul");
  li.appendChild(ul);
  return ul;
}

function createTable(title, parent){
  parent = prepParent(title, parent);
  let table = document.createElement("table");
  table.className = "table table-striped w-auto";
  parent.appendChild(table);
  return [
    table.appendChild(document.createElement("thead")),
    table.appendChild(document.createElement("tbody"))];
}

function addOverzichtRow(cols, table, header = false){
  let row = document.createElement("tr");
  table.append(row);
  cols.forEach(col => {
    td = document.createElement(header ? "th" : "td");
    td.innerHTML = col;
    row.append(td);
  });
}

function srtName(v1, v2){
  return (v1.name > v2.name) ? 1 : -1;
}

function srtTransformatie(t1, t2, sortedVoorvallen){
  function getEersteVoorval(t){
    return sortedVoorvallen.find(v => v.transformaties.includes(t));
  }
  if (t1 == t2){
    return 0;
  }
  if (t1.v === undefined){
    t1.vv = getEersteVoorval(t1);
  }
  if (t2.v === undefined){
    t2.vv = getEersteVoorval(t2);
  }
  if (t1.v === null && t2.v !== null){
    return -1;
  }
  if (t2.v === null && t1.v !== null){
    return 1;
  }
  if (t1.v == t2.v) {
    return t1.name < t2.name ? -1 : 1;
  }
  return sortedVoorvallen.indexOf(t1.vv) < sortedVoorvallen.indexOf(t2.v) ? -1 : 1;
}

function srtVoorval(v1, v2){
  function getTijd(t){
    let tijd = partByName(t, false);
    if (tijd === null || tijd.type !== "TIJD"){
      return t;
    }
    return tijd.datumTijdVan ? tijd.datumTijdVan : tijd.name;
  }
  if (v1 == v2){
    return 0;
  }
  if (v1.tijd == v2.tijd) {
    return v1.name < v2.name ? -1 : 1;
  }
  let t1 = getTijd(v1.tijd);
  let t2 = getTijd(v2.tijd);
  if (t1 === null && t2 !== null){
    return -1;
  }
  if (t2 === null && t1 !== null){
    return 1;
  }
  return t1 < t2 ? -1 : 1;
}

function srtTijd(t1, t2){
  if (t1 == t2) {
    return 0;
  }
  if (t1.datumTijdVan === null && t2.datumTijdVan !== null){
    return -1;
  }
  if (t2.datumTijdVan === null && t1.datumTijdVan !== null){
    return 1;
  }
  if (t1.datumTijdVan == t2.datumTijdVan){
    return t1.name < t2.name ? -1 : 1;
  }
  return t1.datumTijdVan < t2.datumTijdVan ? -1 : 1;
}
