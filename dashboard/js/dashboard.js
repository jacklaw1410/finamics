class Dashboard {
  constructor(name, chart_names, tickers, options = {}) {
    this.name = name;
    this.chart_names = chart_names;
    this.tickers = tickers;
    this.options = options;
  }

  get_data() {
    let _this = this;
    return new Promise(function(resolve, reject) {
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
      });

		$(`.dashboard-container[dashboard="${this.name}"] > .dashboard-loading`).toggle();
  }

  _plot(dataset) {
    console.log(this);
    let name = 'price-chart';

    let dom = `.dashboard-container[dashboard="${this.name}"]`, $dom = $(dom);
    let width = $dom.width(), height = $dom.height();
    console.log(dom, width, height);
    let ndx = crossfilter(dataset);

		let dateDimension = ndx.dimension(d => new Date(Date.parse(d.date)));
    let stockDimension = ndx.dimension(d => d.stock_id);

    let priceGroup = dateDimension.group().reduceSum(d => d.adj_close);

    let min_date = d3.min(dataset, d => Date.parse(d.date)), max_date = d3.max(dataset, d => Date.parse(d.date));
    let xTime = d3.time.scale().domain([new Date(min_date), new Date(max_date)]);

    dc.lineChart('#price-chart')
      .width(width)
      .height(height)
			// .margins({ top: 10, right: 50, bottom: 50, left: 50 })
			.x(xTime)
      .xUnits(d3.time.days)
			.xAxisLabel('Date')

			.yAxisLabel('Stock Prices')

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

      .render();
  }
}
