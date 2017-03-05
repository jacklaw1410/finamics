class Dashboard {
  constructor(name, chart_names, tickers, init_ticker_filter, options = {}) {
    this.name = name;
    this.chart_names = chart_names;
    this.tickers = tickers;
    this.init_ticker_filter = init_ticker_filter || tickers.split(',')[0];
    this.options = options;
  }

  get_data() {
    let _this = this;
    return new Promise(function (resolve, reject) {
      d3.json(`api/stockohlc?tickers=${_this.tickers}`, function (error, dataset) {
          _this.dataset = dataset;
          resolve(_this.dataset);
      });
    });
  }

  plot() {
    let _this = this;
    _this.get_data()
      .then(function() {
        _this._plot(_this.dataset);
        dc.renderAll();
      });
		$(`.dashboard-container[dashboard="${this.name}"] > .dashboard-loading`).toggle();
  }

  _plot(dataset) {
    let name = 'price-chart';

    let dom = `.dashboard-container[dashboard="${this.name}"]`, $dom = $(dom);
    let width = $dom.width(), height = $dom.height();

    let ndx = crossfilter(dataset);

		let dateDimension = ndx.dimension(d => new Date(Date.parse(d.date)));
    let stockDimension = ndx.dimension(d => d.stock_id);

    let priceGroup = dateDimension.group().reduceSum(d => d.adj_close);

    let min_date = d3.min(dataset, d => Date.parse(d.date)), max_date = d3.max(dataset, d => Date.parse(d.date));
    let xTime = d3.time.scale().domain([new Date(min_date), new Date(max_date)]);

    stockDimension.filter(this.init_ticker_filter);

    let chart = dc.lineChart('#price-chart')
      .width(width)
      .height(height)
			.margins({ top: 10, right: 50, bottom: 60, left: 40 })

			.x(xTime)
      .xUnits(d3.time.days)
			.xAxisLabel('Date')

			.yAxisLabel('Stock Prices')
      .yAxisPadding('2.5%')

			.brushOn(true)
			.interpolate("basis")
			.tension(0)

			.dimension(dateDimension)

			.group(priceGroup)
        .valueAccessor(function (d) {
          // console.log(d.value)
            return d.value;
        })

      .elasticX(true)
      .elasticY(true)

      .on('renderlet', function (chart) {
        // rotate x-axis labels
        chart.selectAll('g.x text')
          .attr('transform', 'translate(-10,10) rotate(325)');
      })

    chart.xAxis().tickFormat(d => d.toISOString().slice(0,10));

    dc.override(chart, 'yAxisMin', function () {
       var min = d3.min(chart.data(), function (layer) {
         return d3.min(layer.values, function (p) {
           return p.y + p.y0;
         });
       });
       return dc.utils.subtract(min, chart.yAxisPadding());
    });

    $('a:not([data-ticker=""])').each(function () {
      let ticker = $(this).data('ticker');
      $(this).click(function() {
        stockDimension.filter(ticker);
        dc.redrawAll();
      });
    })
  }
}
