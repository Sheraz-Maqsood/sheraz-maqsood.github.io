/* Old dossier URLs (project.html?id=<slug>) now live at /projects/<slug>/.
   Keeps every link already shared on LinkedIn, CVs and search results working. */
(function () {
  var m = location.search.match(/[?&]id=([a-z0-9-]+)/i);
  location.replace(m ? "projects/" + m[1].toLowerCase() + "/" + location.hash : "./#projects");
})();
