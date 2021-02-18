var urlToGetAllOpenBugs = "https://api.github.com/search/issues?q=label:hackergarten+state:open&sort=updated";

$(document).ready(function () {
    $.getJSON(urlToGetAllOpenBugs, function (allIssues) {
        $.each(allIssues.items, function (i, issue) {
            var repoName = issue.html_url;
            repoName = repoName.replace("https://github.com/", "");
            repoName = repoName.replace(/\/issues\/\d+/, "");

            var title = issue.title;
            title = sanitizeText(title);

            $("#githubissues")
                .append("<a href='" + issue.html_url + "'>" + title + "</a> <small>(" + repoName + ")</small><br/>")
        });
    });
    function sanitizeText(chars) {
        return filterXSS(chars, {
            whiteList: []
        });
    }
});
