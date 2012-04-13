/**
  jQGallery v0.1
  nsn@nightspawn.com - http://nightspawn.com/tinkerings/jQGallery/

  jQuery plugin to access picasa photos and photo feeds in a convenient fashion.

  functions:
    picasaPhoto()         - renders the picasa photo's thumbnail linking to the full sized image
    picasaAlbum()         - renders a picasaPhoto() for each photo in that album
    picasaTeaser()        - renders the album's icon/teaser image
    picasaTeaserGallery() - same as above, but additionally renders empty anchor tags for each photo in the album
    picasaUserGalleries() - same as above, just for each of the user's albums

  functions expect the element they are called for to have the certain attributes:
    data-albumid        : picasa album id
    data-userid         : picasa user id
    data-photoid        : picasa photo id

  each function also takes an optional "options" hash, valid options are:
    thumbsize         : picasa thumbsize param, defaults to 220u, see http://code.google.com/apis/picasaweb/docs/2.0/reference.html
    imageMax          : picasa imgmax param, defaults to d, see http://code.google.com/apis/picasaweb/docs/2.0/reference.html
    imageStyleClass   : class attribute of the img element
    linkStyleClass    : class attribute of the a element
    linkRel           : rel attribute of the a element
    callback          : gets called /w the a element as a single parameter

*/
(function($) {

  $.fn.picasaPhoto = function(options) {
    $(this).each(function() {
      $.jQGallery.call($.jQGallery.picasaPhoto, $(this), options);
    });
  };

  $.fn.picasaAlbum = function(options) {
    $(this).each(function() {
      $.jQGallery.call($.jQGallery.picasaAlbum, $(this), options);
    });
  };

  $.fn.picasaTeaser = function(options) {
    $(this).each(function() {
      $.jQGallery.call($.jQGallery.picasaTeaser, $(this), options);
    });
  };

  $.fn.picasaTeaserGallery = function(options) {
    $(this).each(function() {
      $.jQGallery.call($.jQGallery.picasaTeaserGallery, $(this), options);
    });
  };

  $.fn.picasaUserGalleries = function(options) {
    $(this).each(function() {
      $.jQGallery.call($.jQGallery.picasaUserGalleries, $(this), options);
    });
  };

  /** instance function */
  $.jQGallery = { 
    
    call : function(func, scope, options) {
      var params = {};
      params.albumID = scope.attr("data-albumid");
      params.userID = scope.attr("data-userid");
      params.photoID = scope.attr("data-photoid");

      options = $.jQGallery.makeValidOptionsArray(options, params.albumID);
      func(params, scope, options);
    },

    picasaPhoto : function(params, scope, options) {
      var dom = $(scope);
      $.getJSON($.jQGallery.makePicasaPhotoEntryURL(params.userID, params.albumID, params.photoID, options), 'callback=?',
        function(data) {
          var anchor = $.jQGallery.renderPhotoAnchor(data.data, dom, false, options);
          options.callback(anchor);
        }
      );
    },

    picasaAlbum : function(params, scope, options) {
      var dom = $(scope);
      $.getJSON($.jQGallery.makePicasaAlbumFeedURL(params.userID, params.albumID, options), 'callback=?',
        function(data){
          $.jQGallery.renderAlbumAnchors(data.data, dom, false, options);
        }
      );
      options.callback(dom);
    }, 

    picasaTeaser : function(params, scope, options) {
      var dom = $(scope);
      $.getJSON($.jQGallery.makePicasaAlbumEntryURL(params.userID, params.albumID, options), 'callback=?',
        function(data){
          $.jQGallery.renderTeaserImage(data.data, dom, options);
        }
      );
    },

    picasaTeaserGallery : function(params, scope, options) {
      var dom = $(scope);
      $.getJSON($.jQGallery.makePicasaAlbumEntryURL(params.userID, params.albumID, options), 'callback=?',
        function(data){
          $.jQGallery.renderTeaserAnchor(data.data, dom, options);
        }
      );
      $.getJSON($.jQGallery.makePicasaAlbumFeedURL(params.userID, params.albumID, options), 'callback=?',
        function(data){
          $.jQGallery.renderAlbumAnchors(data.data, dom, true, options);
        }
      );
      options.callback(dom);
    },

    picasaUserGalleries : function(params, scope, options) {
      var dom = $(scope);
      $.getJSON($.jQGallery.makePicasaUserFeedURL(params.userID, options), 'callback=?',
        function(data){
          for (idx in data.data.items) {
            var album = data.data.items[idx];
            $.jQGallery.renderTeaserAnchor(album, dom, options);

            $.getJSON($.jQGallery.makePicasaAlbumFeedURL(params.userID, album.id, options), 'callback=?',
              function(data){
                $.jQGallery.renderAlbumAnchors(data.data, dom, true, options);
              }
            );

          }
          options.callback(dom);
        }
      );

    },

    renderAlbumAnchors : function(album, dom, hidden, options) {
      for (idx in album.items) {
        var photo = album.items[idx];
        $.jQGallery.renderPhotoAnchor(photo, dom, hidden, options);
      }
    },

    renderPhotoAnchor : function(photo, dom, hidden, options) {
      var aElement = $.jQGallery.makeAnchor(photo.media.image.url, photo.description, photo.title, options);
      if (!hidden) {
        $.jQGallery.renderPhotoImage(photo, aElement, options);
      }
      dom.append(aElement);
      return aElement;
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

    makePicasaPhotoFeedURL : function(userID, albumID, photoID, options) {
      return $.jQGallery.makePicasaBaseURL("feed", userID) + "/albumid/" + albumID + "/photoid/" + photoID + $.jQGallery.makePicasaQueryString(options);
    },

    makePicasaPhotoEntryURL : function(userID, albumID, photoID, options) {
      return $.jQGallery.makePicasaBaseURL("entry", userID) + "/albumid/" + albumID + "/photoid/" + photoID + $.jQGallery.makePicasaQueryString(options);
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
      return "?access=public&v=2&alt=jsonc&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize;
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


