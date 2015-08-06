var $jq = jQuery.noConflict()
$jq(document).ready(function () {
    var widget = $jq('#orcid-widget-js').clone(),
        orcids = widget.data(orcids).orcids.split(","),
        profile = null;
    $jq(orcids).each(function (name, value) {
        var profile_promise = get_orcid_profile(value.trim())
            profile_promise.success(function (data) {
            profile = data['orcid-profile']
            widget.append(set_widget_content(profile)) 
        })
    })
    
    $jq('#orcid-widget-js').replaceWith(widget)
    
    function set_widget_content() {
        var profile_div = $jq('<div class="orcid-profile">')
        set_person_works().appendTo(profile_div)
        var orcid_uri = profile['orcid-identifier']['uri']
        var orcid_link = $jq("<a>")
        orcid_link.addClass("orcid-uri")
        orcid_link.attr("href", orcid_uri)
        orcid_link.text("View full profile at ORCID")
        orcid_link = orcid_link.appendTo("<span class='orcid-uri'>")
        orcid_link.appendTo(profile_div)
        return profile_div
    }

    function get_orcid_profile(orcid) {
        var profile_uri = 'http://pub.orcid.org/v1.2/' + orcid + '/orcid-works';
        return $jq.ajax({
            url: profile_uri,
            type: 'GET',
            dataType: 'jsonp',
            accepts: 'application/orcid+json'
        })
    }

    function set_person_works() {
        var data = profile['orcid-activities']
        var span = $jq('<span class="orcid-works">');
        $jq('<h2>Works</h2>').appendTo(span);
        if (data['orcid-works']) {
            var works = data['orcid-works']['orcid-work'];
            span.append(list_person_works(works));
        } else {
            span.text("No works found.");
        }
        return span
    }

	function list_person_works(works) {
		var seendois = [];
		var seentitles = [];
		var ul = $jq('<ul class="orcid-works">');
		var li = $jq('<li class="orcid-work">');
        $jq(works).each(function (index, value) {
            var title = value['work-title']['title'].value;
			//Check for and ignore duplicate works based on title
			if (jQuery.inArray(title, seentitles)==-1){
				seentitles[seentitles.length] = title;
				var divtitle = $jq('<div class="work-title">');
				divtitle.text(title);
				
				var journal = value['journal-title'] != null ? value['journal-title'].value : "";
				var divjournal = $jq('<div class="journal">');
				divjournal.text(journal);
								
				var author = "";
				var divauthors = $jq('<div class="work-authors">');
							
				var contributors = value['work-contributors'] != null ? value['work-contributors']['contributor'] : "";
				$jq(contributors).each(function (index, value) {
					var author_orcid = value['contributor-orcid'] != null ? value['contributor-orcid']['path'] : "";
					//combine the authors' names by span tag with different styles  
					if(author_orcid == orcid_path){
						author = value['credit-name'].value;
						span_author = $jq('<span class="author">');
						span_author.text(author+'; ');
						span_author.addClass("exp1");
						}
					else{
						author = value['credit-name'].value;
						span_author = $jq('<span class="author">');
						span_author.text(author+'; ');
						}
					
					span_author.appendTo(span_author);
					span_author.appendTo(divauthors);
				});
								
				var extids = value['work-external-identifiers'] != null ? value['work-external-identifiers']['work-external-identifier'] : "";
				var doilink = "";
				var handle = "";
				var sep = $jq('<span> | </span>');
				$jq(extids).each(function (index, value) {					
					if (value['work-external-identifier-type'] == "DOI") {
						var doi = "";
						doilink = "http://dx.doi.org/";
						doi = value['work-external-identifier-id'].value.toUpperCase();
						//Check for and ignore duplicate works based on DOI
						if (jQuery.inArray(doi, seendois)==-1){
							divtitle.appendTo(li);
							divauthors.appendTo(li);
							divjournal.appendTo(li);
							seendois[seendois.length] = doi;
							doilink += doi;
							var adoi = $jq('<a class="doi-link">');
							adoi.attr("href", doilink);
							adoi.text("Publisher link");
							adoi.appendTo(li);
						}
					}
					else if (value['work-external-identifier-type'] == "HANDLE") {
						handlelink = "http://hdl.handle.net/";
						handle = value['work-external-identifier-id'].value;
						handlelink += handle;
						var ahandle = $jq('<a class="handle-link">');
						ahandle.attr("href", handlelink);
						ahandle.text("Repository link");
						if (doi !== ""){
							if (jQuery.inArray(doi, seendois)==-1){
								sep.appendTo(li);
								ahandle.appendTo(li);
							}
						}
						else{
							divtitle.appendTo(li);
							ahandle.appendTo(li);
						}	
					}
					else if (value['work-external-identifier-id'].value == "") {
						divtitle.appendTo(li);
					}
					if (jQuery.inArray(doi, seendois)==-1){
						li.appendTo(ul);
					}	
				});
			}	
        });
        return ul
    }
});
