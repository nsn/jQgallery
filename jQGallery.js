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
        var elements = [];
        $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userID + "/albumid/" + albumID  
                + "?access=public&alt=jsonc&imgmax=" + options.imageMax + "&thumbsize=" + options.thumbsize , 'callback=?',
          function(data){
            for (index in data.data.items) {
              var photo = data.data.items[index];
              var aElement = $.jQGallery.makeAnchorElement(photo, options);
              dom.append(aElement);
              elements.push(aElement);
            }
            options.callback(elements);
          }
        );
    },

    makeAnchorElement : function(photo, options) {

        var imgElement = $("<img/>");
        imgElement.attr("src", photo.media.thumbnails[0]);
        imgElement.attr("class", options.imageStyleClass);

        var aElement = $("<a/>");
        aElement.attr("href", photo.media.image.url);
        aElement.attr("class", options.linkStyleClass);
        aElement.attr("rel", options.linkRel);

        aElement.append(imgElement);

        if (photo.description)
          aElement.attr("title", photo.description);
        if (photo.title) {
          aElement.attr("alt", photo.title);
          imgElement.attr("alt", photo.title);
        }

        return aElement; 
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


