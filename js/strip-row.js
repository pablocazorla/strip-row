// StripRow
(function($, win) {
  "use strict";

  var striprow = function(options) {
    return this.init(options);
  };

  striprow.prototype = {
    init: function(options) {
      this.config = $.extend({
        target: '',
        enabledPagination: true,
        touch: true,
        autoplay:4000
      }, options);

      this.$target = $(this.config.target);
      var frames = this.$target.html();
      this.$target.html('');
      this.$wrap = $('<div class="strip-wrap"></div>').appendTo(this.$target);
      this.$slider = $('<div class="strip-slider"></div>').html(frames).appendTo(this.$wrap);
      this.$frame = this.$slider.find('.frame');
      this.length = this.$frame.length;
      this.moving = false;

      if (this.config.enabledPagination) {
        this.$pagination = $('<div class="pagination-strip-row"></div>').appendTo(this.$target);
      }

      var self = this,
        timer = null;
      $(window).resize(function() {
        if(timer !== null){
          clearTimeout(timer);
        }
        timer = setTimeout(function(){
          self.reset();
        },150);        
      });

      if (this.config.touch && typeof Hammer !== 'undefined') {
        this.setTouchEvents(this);
      }
      if (this.config.autoplay > 0) {
        this.autoplayTimer = setInterval(function(){
          self.next();
        },this.config.autoplay);
      }

      return this.reset();
    },
    reset: function() {

      var self = this;
      this.widthFrame = this.$frame.outerWidth();
      this.step = Math.floor(this.$target.width() / this.widthFrame);
      this.$wrap.width(this.widthFrame * this.step);
      this.current = 0;
      this.$slider.css('left', '0');
      if (this.config.enabledPagination) {
        this.$pagination.html('');
        this.$pags = $('');
        var addBullet = function(j) {
          var $p = $('<span></span>').appendTo(self.$pagination)
            .click(function() {
              self.goto(j);
              if (self.config.autoplay > 0) {
                if(self.autoplayTimer !== null){
                  clearInterval(self.autoplayTimer);
                  self.autoplayTimer = null;
                }
              }
            });
          self.$pags = self.$pags.add($p);
        }
        var j = 0;
        for (var i = 0; i < this.length; i += this.step) {
          addBullet(j);
          j++;
        }
        self.$pags.eq(0).addClass('active');
      }
      if (this.config.touch && typeof Hammer !== 'undefined') {
        this.setTouchEvents(this);
      }
      return this;
    },
    prev: function() {
      this.goto(this.current - 1);
      return this;
    },
    next: function() {
      this.goto(this.current + 1);
      return this;
    },
    goto: function(num) {
      if (!this.moving && num !== this.current) {
        this.moving = true;
        var self = this,
          next = (num < 0) ? this.$pags.length - 1 : ((num >= this.$pags.length) ? 0 : num),
          pos = next * this.step * this.widthFrame,
          limit = (this.length - this.step) * this.widthFrame;
        pos = (pos > limit) ? limit : pos;
        this.$slider.css('left', -1 * pos + 'px');
        if (this.config.enabledPagination) {
          this.$pags.removeClass('active').eq(next).addClass('active');
        }
        this.current = next;
        setTimeout(function() {
          self.moving = false;
        }, 750);
      }
    },
    setTouchEvents: function(self) {
      var touchHandler = new Hammer(self.$target[0]),
        startedPan = false,
        dx = 0;
      self.$target.on('mousedown', function() {
        return false;
      });
      touchHandler.on("panstart", function(ev) {
        if (!self.moving && Math.abs(ev.deltaX) < 20) {
          startedPan = true;
        }
      });
      touchHandler.on("panend", function(ev) {
        if (!self.moving && Math.abs(ev.deltaX) > 20 && startedPan) {
          var dir = Math.abs(ev.deltaX) / ev.deltaX;
          if (dir > 0) {
            self.prev();
          } else {
            self.next();
          }
          startedPan = false;
          dx = 0;
        }
      });
      return this;
    }
  };

  win.StripRow = function(options) {
    return new striprow(options);
  };
})(jQuery, window);