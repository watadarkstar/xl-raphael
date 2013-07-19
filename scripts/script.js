var FPS = 48;
var animations = window['animations'];

function init_animations() {
    $('.value').each(function() {
        var $el = $(this);
        var key = $el.attr('id');

        // set up an animation if we have the corresponding data
        if (_.has(animations, key)) {
            $el.data('initialized', true).addClass('replaced');

            var ani = animations[key];

            ani.nFrames = 0;
            _.each(ani.layers, function(layer, i) {
                var $canvas = $('<div></div>').addClass('dynamic-canvas').insertBefore($('.content', $el));
                layer.container = $canvas;
                layer.paper = Raphael($canvas[0], $canvas.width(), $canvas.height());
                ani.nFrames = Math.max(ani.nFrames, layer.frames.length);
            });

            ani.playing = false;
            ani.finished = false;
            ani.lastFrame = 0;
            ani.tick = 0;

            ani.looping = $el.data('loop');
            if (ani.looping)
                $el.addClass('looping');
            else
                $el.addClass('play-once');

            ani.step_once = _.bind(step_once, ani);
            ani.step = _.bind(step, ani);
            ani.play = _.bind(play, ani);

            var self = ani;
            _.each(ani.layers, function(layer, i) {
                layer.paper.setSize(layer.container.width(), layer.container.height());
            });

            ani.step_once();
            $el.data('ani', ani);
        }
    });
}

function step(timestamp) {
    var now = Date.now();
    if ((now - this.lastFrame) > (1000 / FPS)) {
        this.step_once();
    }

    if (this.playing)
        requestAnimationFrame(this.step);
}

function step_once() {
    // only draw a frame if the data exists
    // it's possible that the frame is null, in which case we're just holding the previous frame
    var self = this;

    _.each(this.layers, function(layer, i) {
        if (layer.frames[self.tick]) {
        
            layer.paper.clear();

            _.each(layer.frames[self.tick], function(shape) {
                // adjust colors to match current brand color
                var attrs = _.extend({"stroke-width":"0","stroke":"none"}, shape.attrs);

                layer.paper
                            .path(shape.path)
                            .attr(attrs)
                            .transform("s.70 .70 200 5");
            });
        
        }
    });

    this.tick++;
    if (this.tick > (this.nFrames - 1)) {
        this.tick = 0;
        if (!this.looping) {
            this.playing = false;
            this.finished = true;
        }
    }

    this.lastFrame = Date.now();
}

function play() {
    this.playing = true;
    requestAnimationFrame(this.step);
}

$(function() {
    init_animations();

    var ani = $('#logo').data('ani');
    if (ani) {
        ani.play();
    }
})