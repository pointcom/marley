(function($) {
  $.fn.tweet = function(o){
    var s = {
      username: ["seaofclouds"],              // [string]   required, unless you want to display our tweets. :) it can be an array, just do ["username1","username2","etc"]
      avatar_size: null,                      // [integer]  height and width of avatar if displayed (48px max)
      count: 1,                               // [integer]  how many tweets to display?
      intro_text: null,                       // [string]   do you want text BEFORE your your tweets?
      outro_text: null,                       // [string]   do you want text AFTER your tweets?
      join_text:  null,                       // [string]   optional text in between date and tweet, try setting to "auto"
      auto_join_text_default: "i said,",      // [string]   auto text for non verb: "i said" bullocks
      auto_join_text_ed: "i",                 // [string]   auto text for past tense: "i" surfed
      auto_join_text_ing: "i am",             // [string]   auto tense for present tense: "i was" surfing
      auto_join_text_reply: "i replied to",   // [string]   auto tense for replies: "i replied to" @someone "with"
      auto_join_text_url: "i was looking at", // [string]   auto tense for urls: "i was looking at" http:...
      loading_text: null                      // [string]   optional loading text, displayed while tweets load
    };
    
    function relative_time(time_value) {
      var parsed_date = Date.parse(time_value);
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
      if(delta < 60) {
      return 'il y a moins d\'une minute';
      } else if(delta < 120) {
      return 'il y a une minute';
      } else if(delta < (45*60)) {
      return 'il y a ' + (parseInt(delta / 60)).toString() + ' minutes';
      } else if(delta < (90*60)) {
      return 'il y a une heure';
      } else if(delta < (24*60*60)) {
      return 'il y a ' + (parseInt(delta / 3600)).toString() + ' heures';
      } else if(delta < (48*60*60)) {
      return 'il y a 1 jour';
      } else {
      return 'il y a ' + (parseInt(delta / 86400)).toString() + ' jours';
      }
    }
    
    if(o) $.extend(s, o);
    return this.each(function(){
      var list = $('<ul class="tweet_list">').appendTo(this);
      var intro = '<p class="tweet_intro">'+s.intro_text+'</p>'
      var outro = '<p class="tweet_outro">'+s.outro_text+'</p>'
      var loading = $('<p class="loading">'+s.loading_text+'</p>');
      if(typeof(s.username) == "string"){
        s.username = [s.username];
      }
      var url = 'http://search.twitter.com/search.json?q=from:'+s.username.join('%20OR%20from:')+'&rpp='+s.count+'&callback=?';
      if (s.loading_text) $(this).append(loading);
      $.getJSON(url,  function(data){
        if (s.loading_text) loading.remove();
        if (s.intro_text) list.before(intro);
        $.each(data.results, function(i,item){
          // audo join text based on verb tense and content
          if (s.join_text == "auto") {
            if (item.text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
              var join_text = s.auto_join_text_reply;
            } else if (item.text.match(/(^\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+) .*/i)) {
              var join_text = s.auto_join_text_url;
            } else if (item.text.match(/^((\w+ed)|just) .*/im)) {
              var join_text = s.auto_join_text_ed;
            } else if (item.text.match(/^(\w*ing) .*/i)) {
              var join_text = s.auto_join_text_ing;
            } else {
              var join_text = s.auto_join_text_default;
            }
          } else {
            var join_text = s.join_text;
          };
          var join = '<span class="tweet_join"> '+join_text+' </span>';

          list.append('<li>'+(s.avatar_size ? '<a class="tweet_avatar" href="http://twitter.com/'+ item.from_user+'"><img src="'+item.profile_image_url+'" height="'+s.avatar_size+'" width="'+s.avatar_size+'" alt="'+item.from_user+'\'s avatar" border="0"/></a>' : '') + ((s.join_text) ? join : ' ') + '<span class="tweet_text">' + item.text.replace(/(\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&#\?\/.=]+)/gi, '<a href="$1">$1</a>').replace(/[\@]+([A-Za-z0-9-_]+)/gi, '<a href="http://twitter.com/$1">@$1</a>').replace(/ [\#]+([A-Za-z0-9-_]+) /gi, ' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all&from='+s.username.join("%2BOR%2B")+'">#$1</a> ').replace(/[&lt;]+[3]/gi, "<tt class='heart'>&#x2665;</tt>") + '</span>'+'<a href="http://twitter.com/'+item.from_user+'/statuses/'+item.id+'" class="tweet_link" title="view tweet on twitter">'+relative_time(item.created_at)+'</a>'+'</li>');
        });
        $('.tweet_list li:odd').addClass('tweet_even');
        $('.tweet_list li:even').addClass('tweet_odd');
        $('.tweet_list li:first').addClass('tweet_first');
        $('.tweet_list li:last').addClass('tweet_last');
        if (s.outro_text) list.after(outro);
      });

      
    });

  };
})(jQuery);