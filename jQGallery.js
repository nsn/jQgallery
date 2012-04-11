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
(function($) {
  $.fn.picasaPhoto = function(options) {

    this.each(function() {
      var $this = $(this);

      var albumID = $this.attr("data-albumid");
      var userID = $this.attr("data-userid");
      var photoID = $this.attr("data-photoid");

      if (albumID === undefined || userID === undefined || photoID === undefined)
        return;


      var dom = $($this);

      /** default options */
      var thumbsize = "220u";
      var imageMax = "d";
      var imageStyleClass = undefined;
      var linkStyleClass = undefined;
      var linkRel = undefined;
      var callback = function(element) {};
      if (options !== undefined) {
        if (options.thumbsize !== undefined) 
          thumbsize = options.thumbsize;
        if (options.imageMax !== undefined) 
          imageMax = options.imageMax;
        if (options.imageStyleClass !== undefined)
          imageStyleClass = options.imageStyleClass;
        if (options.linkStyleClass !== undefined)
          linkStyleClass = options.linkStyleClass
        if (options.linkRel !== undefined)
          linkRel = options.linkRel;
        if (options.callback !== undefined)
          callback = options.callback;
      }

      $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userID + "/albumid/" + albumID + "/photoid/" + photoID +"?access=public&alt=jsonc&imgmax=" + imageMax + "&thumbsize=" + thumbsize , 'callback=?',
        function(data){

          var photo = data.data;

          var imgElement = $("<img/>");
          imgElement.attr("alt", photo.title);
          imgElement.attr("src", photo.media.thumbnails[0]);
          if (imageStyleClass !== undefined)
            imgElement.attr("class", options.imageStyleClass);


          var aElement = $("<a/>");
          aElement.attr("href", photo.media.image.url);
          aElement.attr("alt", photo.title);
          aElement.attr("title", photo.description);
          if (linkStyleClass !== undefined)
            aElement.attr("class", options.linkStyleClass);
          if (linkRel !== undefined)
            aElement.attr("rel", options.linkRel);
          aElement.append(imgElement);

          dom.append(aElement);

          options.callback(aElement);
        });
    });
  };

}) (jQuery);



