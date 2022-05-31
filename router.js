function route(hash){
  if (hash == "#tekst" || hash == "#" || hash == "" || hash == null)
    fillTextarea(storyAsText());
  else if (hash == "#tijdstippen")
    fillGrid(1, "1. Tijdstippen");
  else if (hash == "#locaties")
    fillGrid(2, "2. Locaties");
  else if (hash == "#elementen")
    fillGrid(3, "3. Elementen");
  else if (hash == "#personages")
    fillGrid(4, "4. Personages");
  else if (hash == "#concepten")
    fillGrid(5, "5. Concepten");
  else if (hash == "#transformaties")
    fillGrid(6, "6. Transformaties");
  else if (hash == "#voorvallen")
    fillGrid(7, "7. Voorvallen");
  else if (hash == "#gebeurtenissen")
    fillGrid(8, "8. Gebeurtenissen");
  else if (hash == "#scenes")
    fillGrid(9, "9. Scene's");
  else if (hash == "#delen")
    fillGrid(10, "10. Delen");
  else if (hash == "#plots")
    fillGrid(11, "11. Plots");
  else if (hash == "#synopsis")
    fillGrid(12, "12. Synopsis");
  else if (hash == "#overzicht/voorvallen")
    showOverzichtVoorvallen();
  else if (hash == "#overzicht/codelijst")
    showOverzichtAfkortingen();
  else if (hash == "#overzicht/scenes")
    showOverzichtScenes();
  else if (hash == "#overzicht/transformaties")
    showOverzichtTransformaties();
  else if (hash == "#overzicht/plot")
    showOverzichtPlot();
  else if (hash == "#overzicht/tijd")
    showOverzichtTijden();
  else if (hash.startsWith("#part/"))
    showPart(hash.replace("#part/", ""));
  else if (hash.startsWith("#tijdlist/"))
    showOverzichtTijden("Tijdstip: " + decodeURI(hash.replace("#tijdlist/", "")), null, decodeURI(hash.replace("#tijdlist/", "")));
  else
    importFile();
}
