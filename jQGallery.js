(function($) {

  /**
    renders a single picasa photo as a thumbnail, surrounds the image with an anchor tag that links to the full photo into
    the element that this function is called for.

    expects the element it is called for to have the following attributes:

    data-albumid        : picasa album id
    data-userid         : picasa user id
    data-photoid        : picasa photo id

    options:
      thumbsize         : picasa thumbsize param, defaults to 220u, see http://code.google.com/apis/picasaweb/docs/2.0/reference.html
      imageMax          : picasa imgmax param, defaults to d, see http://code.google.com/apis/picasaweb/docs/2.0/reference.html
      imageStyleClass   : class attribute of the img element
      linkStyleClass    : class attribute of the a element
      linkRel           : rel attribute of the a element
      callback          : gets called /w the a element as a single parameter

    example:
    <div class="devscreen picasaphoto" data-userid="108363071077152262865" data-albumid="5727446456183152977" data-photoid="5727446457132933906" ></div>

  */
  $.fn.picasaPhoto = function(options) {
    $(this).each(function() {
      scope = $(this);
      $.jQGallery.picasaPhoto(scope, options);
    });
  };

  $.fn.picasaAlbum = function(options) {
    $(this).each(function() {
      scope = $(this);
      $.jQGallery.picasaAlbum(scope, options);
    });
  };

  $.fn.picasaTeaser = function(options) {
    $(this).each(function() {
      scope = $(this);
      $.jQGallery.picasaTeaser(scope, options);
    });
  };

  $.fn.picasaTeaserGallery = function(options) {
    $(this).each(function() {
      scope = $(this);
      var albumID = scope.attr("data-albumid");
      var userID = scope.attr("data-userid");

      if (albumID === undefined || userID === undefined)
        return;

      options = $.jQGallery.makeValidOptionsArray(options, albumID);

      $.jQGallery.foopicasaTeaserGallery(userID, albumID, scope, options);
    });
  };

  $.fn.picasaUserGalleries = function(options) {
    $(this).each(function() {
      scope = $(this);
      var userID = scope.attr("data-userid");
      if (userID === undefined)
        return;
      options = $.jQGallery.makeValidOptionsArray(options, "foo");
      $.jQGallery.picasaUserGalleries(userID, scope, options);
    });
  };

  /** instance function */
  $.jQGallery = { 

    /** 
     * single photo function 
     * 
     * scope: the scope to apply the method to (the element)
     * options: an array filled with all necessary values
     */
    picasaPhoto : function(scope, options) {
        var albumID = scope.attr("data-albumid");
        var userID = scope.attr("data-userid");
        var photoID = scope.attr("data-photoid");

        if (albumID === undefined || userID === undefined || photoID === undefined)
          return;

        options = $.jQGallery.makeValidOptionsArray(options, albumID);

        var dom = $(scope);
        $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userID + "/albumid/" + albumID + "/photoid/" + photoID 
                + "?access=public&alt=jsonc&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize , 'callback=?',
          function(data){

            var photo = data.data;
            var aElement = $.jQGallery.makeAnchorElement(photo, options);
            dom.append(aElement);
            options.callback(aElement);

          }
        );
    },

    /** 
     * album function 
     * 
     * scope: the scope to apply the method to (the element)
     * options: an array filled with all necessary values
     */
    picasaAlbum : function(scope, options) {
        var albumID = scope.attr("data-albumid");
        var userID = scope.attr("data-userid");

        if (albumID === undefined || userID === undefined)
          return;

        options = $.jQGallery.makeValidOptionsArray(options, albumID);

        var dom = $(scope);
        $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userID + "/albumid/" + albumID  
                + "?access=public&alt=jsonc&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize , 'callback=?',
          function(data){
            for (index in data.data.items) {
              var photo = data.data.items[index];
              var aElement = $.jQGallery.makeAnchorElement(photo, options);
              dom.append(aElement);
            }
            options.callback(dom);
          }
        );
    },

    /** 
     * album teaser function 
     * 
     * scope: the scope to apply the method to (the element)
     * options: an array filled with all necessary values
     */
    picasaTeaser : function(scope, options) {
        var albumID = scope.attr("data-albumid");
        var userID = scope.attr("data-userid");

        if (albumID === undefined || userID === undefined)
          return;

        options = $.jQGallery.makeValidOptionsArray(options, albumID);

        var dom = $(scope);
        $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userID + "/albumid/" + albumID  
                + "?access=public&alt=json&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize , 'callback=?',
          function(data){
            var album = data.feed;

            if (!album)
              return;

            // teaser image
            var title = album.title.$t;
            var imgElement = $.jQGallery.makeImage(album.icon.$t, title, options);
            dom.append(imgElement);

            options.callback(dom);
          }
        );
    },

    /** 
     * album teaser gallery function 
     * 
     * scope: the scope to apply the method to (the element)
     * options: an array filled with all necessary values
     */
    picasaTeaserGallery : function(scope, options) {
        var albumID = scope.attr("data-albumid");
        var userID = scope.attr("data-userid");

        if (albumID === undefined || userID === undefined)
          return;

        options = $.jQGallery.makeValidOptionsArray(options, albumID);

        var dom = $(scope);
        $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userID + "/albumid/" + albumID  
                + "?access=public&alt=json&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize , 'callback=?',
          function(data){
            var album = data.feed;

            // teaser image
            var title = album.title.$t;
            var photo = album.entry[0];

            var aElement = $.jQGallery.makeAnchor(photo.content.src, title, title, options);
            var imgElement = $.jQGallery.makeImage(album.icon.$t, title, options);
            aElement.append(imgElement);
            dom.append(aElement);

            // image links
            for (var i=1; i<album.entry.length; i++) {
              photo = album.entry[i];
              var aE = $.jQGallery.makeAnchor(photo.content.src, photo.summary.$t, photo.title.$t, options);
              dom.append(aE);
            }
            options.callback(dom);
          }
        );
    },

    foopicasaTeaserGallery : function(userID, albumID, scope, options) {
      var dom = $(scope);

      $.getJSON($.jQGallery.makePicasaAlbumEntryURL(userID, albumID, options), 'callback=?',
        function(data){
          var album = data.data;
          $.jQGallery.renderTeaserAnchor(album, dom, options);
        }
      );

      $.getJSON($.jQGallery.makePicasaAlbumFeedURL(userID, albumID, options), 'callback=?',
        function(data){
          $.jQGallery.renderAlbumAnchors(data.data, dom, options);
        }
      );
    },

    picasaUserGalleries : function(userID, scope, options) {
      var dom = $(scope);
      $.getJSON($.jQGallery.makePicasaUserFeedURL(userID, options), 'callback=?',
        function(data){
          for (idx in data.data.items) {
            var album = data.data.items[idx];
            $.jQGallery.renderTeaserAnchor(album, dom, options);
          }
        }
      );
    },

    renderAlbumAnchors : function(album, dom, options) {
      for (idx in album.items) {
        var photo = album.items[idx];
        $.jQGallery.renderPhotoAnchor(photo, dom, true, options);
      }
    },

    renderPhotoAnchor : function(photo, dom, hidden, options) {
      var aElement = $.jQGallery.makeAnchor(photo.media.image.url, photo.description, photo.title, options);
      if (!hidden) {
        $.jQGallery.renderPhotoImage(photo, aElement, options);
      }
      dom.append(aElement);
    },

    renderPhotoImage : function(photo, dom, options) {
      var imgElement = $.jQGallery.makeImage(photo.media.thumbnails[0], photo.description, options);
      dom.append(imgElement);
    },

    renderTeaserAnchor : function(album, dom, options) {
      var aElement = $.jQGallery.makeAnchor(album.media.image.url, album.title, album.title, options);
      $.jQGallery.renderTeaserImage(album, aElement, options);
      dom.append(aElement);
    },

    renderTeaserImage : function(album, dom, options) {
      var imgElement = $.jQGallery.makeImage(album.media.thumbnails[0], album.title, options);
      dom.append(imgElement);
    },

    makePicasaAlbumFeedURL : function(userID, albumID, options) {
      return $.jQGallery.makePicasaBaseURL("feed", userID) + "/albumid/" + albumID + $.jQGallery.makePicasaQueryString(options);
    },

    makePicasaAlbumEntryURL : function(userID, albumID, options) {
      return $.jQGallery.makePicasaBaseURL("entry", userID) + "/albumid/" + albumID + $.jQGallery.makePicasaQueryString(options);
    },

    makePicasaUserFeedURL : function(userID, options) {
      return $.jQGallery.makePicasaBaseURL("feed", userID) + $.jQGallery.makePicasaQueryString(options);
    },

    makePicasaBaseURL : function(type, userID) {
      return "https://picasaweb.google.com/data/" + type + "/api/user/" + userID;
    },

    makePicasaQueryString : function(options) {
      return "?access=public&v=1&alt=jsonc&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize;
    },

    makeAnchorElement : function(photo, options) {
        var imgElement = $.jQGallery.makeImage(photo.media.thumbnails[0], photo.title, options);
        var aElement = $.jQGallery.makeAnchor(photo.media.image.url, photo.description, photo.title, options);

        aElement.append(imgElement);

        return aElement; 
    },

    makeAnchor : function(href, title, alt, options) {
        var aElement = $("<a/>");
        aElement.attr("href", href);
        aElement.attr("class", options.linkStyleClass);
        aElement.attr("rel", options.linkRel);
        if (title)
          aElement.attr("title", title);
        if (alt) 
          aElement.attr("alt", alt);
        return aElement;
    },

    makeImage : function(src, title, options) {
        var imgElement = $("<img/>");
        imgElement.attr("src", src);
        imgElement.attr("class", options.imageStyleClass);
        if (title)
          imgElement.attr("alt", title);
        
        return imgElement;
    },

    /**
     * returns a valid options array, filled with values from param "options"
     */
    makeValidOptionsArray : function(options, albumID) {
      if (options == undefined)
        options = {};

      if (options.thumbsize == undefined)
        options.thumbsize = "220u";
      if (options.imageMax == undefined) 
        options.imageMax = "d";
      if (options.linkRel == undefined) 
        options.linkRel = "picasa_"+albumID;
      if (options.callback == undefined) 
        options.callback = function(element) {};

      return options;
    },

  };


}) (jQuery);


