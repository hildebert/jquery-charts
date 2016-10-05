;(function ($) {
    'use strict';

    var pluginName = 'chart';
    var key = 'plugin_' + pluginName;
    var defaults = {
        items: [],
        gradientTop: 'rgba(188, 213, 255, 0.7)',
        gradientBottom: 'rgba(255, 255, 255, 0)',
        lineTension: 0,
        borderWidth: 1.5,
        borderColor: '#3b73f9',
        pointBackgroundColor: '#3b73f9',
        pointRadius: 2.5
    };

    function Plugin(element, options) {
        this.element = $(element);
        this.options = $.extend({}, defaults, options);

        if (this.options.lineTension === false) {
            this.options.lineTension = undefined;
        }

        this.canvas = $('<canvas width="' + this.element.width() + '" height="' + this.element.height() + '" style="pointer-events: none"></canvas>');
        this.ctx = this.canvas.get(0).getContext('2d');
        this.element.append(this.canvas);

        this.gradient = this.ctx.createLinearGradient(0, 0, 0, 400);
        this.gradient.addColorStop(0, this.options.gradientTop);
        this.gradient.addColorStop(0.5, this.options.gradientBottom);

        this.update(this.options.items);

        var self = this;

        this.element.on('resize', function () {
            self.update(self.options.items);
        });
    }

    $.extend(Plugin.prototype, {
        update: function (items) {
            items.forEach(checkFormat);
            var self = this;

            setTimeout(function () {
                self.chart = new Chart(self.canvas.get(0), {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: '',
                            lineTension: self.options.lineTension,
                            borderWidth: self.options.borderWidth,
                            borderColor: self.options.borderColor,
                            pointBackgroundColor: self.options.pointBackgroundColor,
                            pointRadius: self.options.pointRadius,
                            backgroundColor: self.gradient,
                            data: items.map(function (item, index) {
                                return { x: index + 1, y: item.value };
                            })
                        }]
                    },
                    options: {
                        tooltips: { enabled: false },
                        legend: { display: false },
                        scales: {
                            xAxes: [{
                                display: false,
                                type: 'linear',
                                position: 'bottom',
                                ticks: { stepSize: 1 }
                            }],
                            yAxes: [{
                                display: false,
                                ticks: {
                                    max: getMax(items) * 1.3,
                                    min: 0,
                                    stepSize: 1
                                }
                            }]
                        },
                        maintainAspectRatio: false,
                        responsive: true,
                        animation: { duration: 0 }
                    }
                });
            }, 0)
        },
        push: function (items) {
            if (checkFormat(items, false)) {
                this.options.items.push(items);
            } else {
                items.forEach(checkFormat);
                this.options.items = this.options.items.concat(items);
            }

            this.update(this.options.items);
        },
        destroy: function () {
            this.chart.destroy();
            $.data(this.element.get(0), key, false);
            this.element.unbind('resize');
            this.canvas.remove();
        }
    });

    $.fn[pluginName] = function (options) {
        var args = [].slice.call(arguments);
        return this.each(function () {
            if (typeof options === 'string') {
                var plugin = $.data(this, key);
                return plugin[options].apply(plugin, [].slice.call(args, 1));
            }

            if (!$.data(this, key)) {
                $.data(this, key, new Plugin(this, options));
            }
        });
    };

    function _throw(item) {
        throw new Error('Bad input format', item);
    }

    function checkFormat(item, _throwError) {
        if (typeof _throwError === 'undefined') _throwError = true;
        var retval = true;

        if (typeof item !== 'object') retval = false;
        if (!item.date) retval = false;
        if (!item.value) retval = false;

        if (!retval && _throwError) _throw(item);
        else return retval
    }

    function getMax(items) {
        return items.reduce(function (carry, item) {
            return item.value > carry ? item.value : carry;
        }, -Infinity)
    }
})(jQuery);
