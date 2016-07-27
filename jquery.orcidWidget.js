var $jq = jQuery.noConflict()
$jq(document).ready(function () {
    var widget = $jq('#orcid-widget-js').clone(),
        orcids = widget.data(orcids).orcids.split(","),
		profile = null;
		person_orcid = null;
        
    $jq(orcids).each(function (name, value) {
		var profile_promise = get_orcid_profile(value.trim())
			person_orcid = value.trim()
            profile_promise.success(function (data) {
            profile = data['works'];
			widget.append(set_widget_content(profile)) 		
        })
    })
    
    $jq('#orcid-widget-js').replaceWith(widget)
    
    function set_widget_content() {
        var profile_div = $jq('<div class="orcid-profile">')
        set_person_works().appendTo(profile_div)
		var orcid_uri = 'http://orcid.org/' + person_orcid
        var orcid_link = $jq("<a>")
        orcid_link.addClass("orcid-uri")
        orcid_link.attr("href", orcid_uri)
        orcid_link.text("View full profile at ORCID")
        orcid_link = orcid_link.appendTo("<span class='orcid-works'>")
        orcid_link.appendTo(profile_div)
        return profile_div
    }

    function get_orcid_profile(orcid) {
        var profile_uri = 'https://pub.orcid.org/v2.0_rc2/' + orcid + '/activities';
        return $jq.	ajax({
            url: profile_uri,
            type: 'GET',
            dataType: 'jsonp',
            accepts: 'application/json'
        })
    }

    function set_person_works() {
		orcid_path = person_orcid
        var data = profile['group']
        var span = $jq('<span class="orcid-works">');
        $jq('<h2>Works</h2>').appendTo(span);
        if (data) {
            var groups = data;
            span.append(list_person_works(groups));
        } else {
            span.text("No works found.");
        }
        return span
    }
	
	function get_works_profile(orcid, putcode) {
        var profile_uri = 'https://pub.orcid.org/v2.0_rc2/' + orcid + '/work/'+ putcode;
        return $jq.ajax({
            url: profile_uri,
            type: 'GET',
            dataType: 'jsonp',
            accepts: 'application/json'
        })
    }

	function list_person_works(groups) {
		var ul = $jq('<ul class="orcid-works">');
		var i = 1;
		$jq(groups).each(function (index, value) {
			var works= value['work-summary'];
			var ib = i%2;
			if (ib== 0){
				var li = $jq('<li class="orcid-work_even">');
			}
			else{
				var li = $jq('<li class="orcid-work_odd">');
			}
			i=i+1
			$jq(works).each(function (index, value) {
				var title = value['source']['source-name']['value'] == "KAUST Repository" ? value['title']['title']['value'] : "";
				var putcode = value['put-code'];
				var divtitle = $jq('<div class="work-title">');	
				divtitle.text(title);
						
			/* var journal = work['journal-title'] != null ? work['journal-title'] : "";
			var divjournal = $jq('<div class="journal">');
			divjournal.text(journal); */
							
			/*var author = "";
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
			}); */
			
			/* var journal = value['journal-title'] != null ? value['journal-title'].value : "";
			var year = value['publication-date'] != null ? value['publication-date']['year'] : ""; 
			var type = value['work-type'] != null ? value['work-type'] : ""; 
			var bibtex = value['work-citation']['work-citation-type'] === 'bibtex' ? value['work-citation']['citation'] : "";
			var description = value['short-description'] != null ? value['short-description'] : ""; */
			
			var extids = value['source']['source-name']['value'] == "KAUST Repository" ? value['external-ids']['external-id'] : "";
			var doilink = null;
			var handle = null;
			var sep = $jq('<span> | </span>');
			
			$jq(extids).each(function (index, value) {	
			
			
				if (value['external-id-type'] == "doi") {
					var doi = null;
					doilink = "http://dx.doi.org/";
					doi = value['external-id-value'].toUpperCase();
					divtitle.appendTo(li);
					/*divauthors.appendTo(li);*/
					/* divjournal.appendTo(li);  */
					doilink += doi;
					var adoi = $jq('<a class="doi-link">');
					adoi.attr("href", doilink);
					adoi.text("Publisher link");
					adoi.appendTo(li);
				}
				else if (value['external-id-type'] == "handle") {
					handlelink = "http://hdl.handle.net/";
					handle = value['external-id-value'];
					handlelink += handle;
					var ahandle = $jq('<a class="handle-link">');
					ahandle.attr("href", handlelink);
					ahandle.text("Repository link");
					if (doi !== ""){
						sep.appendTo(li);
						ahandle.appendTo(li);
					}
					else{
						divtitle.appendTo(li);
						ahandle.appendTo(li);
					}	
				}
				else if (value['external-id-type'] == "") {
						divtitle.appendTo(li);
					}
				else if (value['external-id-value'] == "") {
					divtitle.appendTo(li);
				}
				li.appendTo(ul);	
			});	
			
			});
        });
        return ul
    }
});
