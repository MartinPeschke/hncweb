
+function ($) { "use strict";

  // PORTFOLIO CLASS DEFINITION
  // =========================

  var Portfolio = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.portfolio-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.$active     =
    this.$items      = null
  }

  Portfolio.DEFAULTS = {
    pause: 'hover'
  , wrap: true
  }

  Portfolio.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.portfolio.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Portfolio.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos == activeIndex || pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Portfolio.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
    }

    return this
  }

  Portfolio.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Portfolio.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Portfolio.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.portfolio.item.active')
    var $next     = next || $active[type]()
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.portfolio.item')[fallback]()
    }

    this.sliding = true

    var e = $.Event('slide.bs.portfolio', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    return this
  }


  // PORTFOLIO PLUGIN DEFINITION
  // ==========================

  var old = $.fn.portfolio

  $.fn.portfolio = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.portfolio')
      var options = $.extend({}, Portfolio.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.portfolioSlide

      if (!data) $this.data('bs.portfolio', (data = new Portfolio(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
    })
  }

  $.fn.portfolio.Constructor = Portfolio


  // PORTFOLIO DATA-API
  // =================

  $(document).on('click.bs.portfolio.data-api', '[data-portfolio-slide], [data-slide-portfolio-to]', function (e) {
    var $this   = $(this), href, slideIndex;
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())

    $target.portfolio(options)

    if (slideIndex = $this.attr('data-slide-portfolio-to')) {
      $(e.currentTarget).one("afterScroll", function(){
            setTimeout(function(){$target.data('bs.portfolio').to(slideIndex)}, 100)
      });
    }

    e.preventDefault()
  })

  $('a').smoothScroll({offset: -100,easing: 'swing', speed: 200
        , afterScroll: function(){
            $(this).trigger("afterScroll", this);
      }
  });
}(window.jQuery);


