/* 	Multiple Line Chart with Toggle Function
 	Wang Chun Wei


*/

function makeLineChart(dataset, xAxisName, yAxisNames, axisLabel, annotations) {

	/* Generate Multiple Line Chart
	dataset: 			the timeseries data from csv file 
	xAxisName: 			x axis name
	yAxisNames: 		y axis column names 
	annotations: 		list of chart annotaion details
	*/


	// initialize chart object
	var chart = {};
	chart.data = dataset;
	chart.xName = xAxisName;
	chart.yNames = yAxisNames;

	chart.groupObjs = {};
	chart.objs = {mainDiv: null, 
				chartDiv: null,
				g: null,
				xAxis: null,			
				yAxis: null,
				tooltip: null,
				legend: null};

	// d3 function to update the color of the chart
	var color = d3.scaleOrdinal(d3.schemeCategory10);

	/* update color function here */
    function updateColorFunction(colorOptions) {
        /*
         * Takes either a list of colors, a function or an object with the mapping already in place
         * */
        if (typeof colorOptions == 'function') {
            return colorOptions
        } else if (Array.isArray(colorOptions)) {
            //  If an array is provided, map it to the domain
            var colorMap = {}, cColor = 0;
            for (var cName in chart.groupObjs) {
                colorMap[cName] = colorOptions[cColor];
                cColor = (cColor + 1) % colorOptions.length;
            }
            return function (group) {
                return colorMap[group];
            }
        } else if (typeof colorOptions == 'object') {
            // if an object is provided, assume it maps to  the colors
            return function (group) {
                return colorOptions[group];
            }
        }
    }

	// d3 format functions
	chart.asNumber = d3.format(".0f");
	chart.asCurrency = d3.format("$.2f");
	chart.asFloat = d3.format(".2f");

	/* ? yFormatter?  */


	// return all visible y series
	function getYSeries() {
		var ySeries = [];
		for (var yName in chart.groupObjs) {
			currentGrp = chart.groupObjs[yName];
			if (currentGrp.visible == true) {
				ySeries.push(currentGrp.yFunct);
			}
		}

		return ySeries
	}

	// get the maximum visible y value, so that y axes can be adjusted

	function getYMax() {
		return d3.max(getYSeries().map(function(fn) { console.log(d3.max(chart.data, fn));  return d3.max(chart.data, fn); }))
	}

	// prepare the data
	function prepareData() {
		// pass the x and y data
		chart.xFunct = function(d) {
			return d[xAxisName]
		};
		chart.bisectYear = d3.bisector(chart.xFunct).left; 

		for (var yName in chart.yNames) {
			chart.groupObjs[yName] = {yFunct: null, visible: null, objs: {}};			
		}

		chart.yFuncts = [];
		for (var yName in chart.yNames) {
			console.log(yName);
			chartY = chart.groupObjs[yName];
			chartY.visible = true;
			chartY.yFunct = function (d) { return d[chart.yNames[yName].column]; }  // revisit this!
		}
		
	}
	prepareData();

	// update chart
	chart.update = function () {
		// dimensions
        chart.width = parseInt(chart.objs.chartDiv.style("width"), 10) - (chart.margin.left + chart.margin.right);
        chart.height = parseInt(chart.objs.chartDiv.style("height"), 10) - (chart.margin.top + chart.margin.bottom);

        // create scale with updated dimensions
        chart.xScale = d3.scaleTime()
        	.range([0, chart.width]);
        	//.domain(d3.extent(chart.data, chart.xFunct));
        chart.yScale = d3.scaleLinear()
        	.range([chart.height, 0])
        	.domain([0, getYMax()]);

        if (!chart.objs.g) {return false;}

        // update axes label with the new scale
		//chart.objs.axes.g.select('.x.axis').attr("transform", "translate(0," + chart.height + ")").call(chart.objs.xAxis);
		//chart.objs.axes.g.select('.x.axis .label').attr("x", chart.width / 2);
		//chart.objs.axes.g.select('.y.axis').call(chart.objs.yAxis);
		//chart.objs.axes.g.select('.y.axis .label').attr("x", -chart.height / 2);

		// update chart lines
		for (var yName in chart.groupObjs) {
			chartY = chart.groupObjs[yName];
			if (chartY.visible == true) {
                chartY.objs.line.g.attr("d", chartY.objs.line.series).style("display",null);  // check this!
                chartY.objs.tooltip.style("display",null);
			} else {
				chartY.objs.line.g.style("display","none");
				chartY.objs.tooltip.style("display","none");
			}
		}

			chart.objs.tooltip.select('.line')
				.attr("y2", chart.height);
			chart.objs.chartDiv.select('svg')
				.attr("width", chart.width + (chart.margin.left + chart.margin.right))
				.attr("height", chart.height + (chart.margin.top + chart.margin.bottom));
			chart.objs.g.select(".overlay")
				.attr("width", chart.width)
				.attr("height", chart.height);

			return chart;
	
	}

	// bind to selected item
	chart.bind = function(selected) {
		
		/*
		chart.objs.mainDiv = d3.select(selected);
		chart.selector = selected + " .inner-box"; // check this ?
		chart.margin = {top: 15, right: 60, bottom: 30, left: 50};
		chart.divWidth = 800;  // check these dimensions
        chart.divHeight = 400;
        chart.width = chart.divWidth - chart.margin.left - chart.margin.right;
        chart.height = chart.divHeight - chart.margin.top - chart.margin.bottom;
        */

        function getOptions() {
            if (!selected) throw "Missing Bind Options";

            if (selected.selector) {
                chart.objs.mainDiv = d3.select(selected.selector);
                // Capture the inner div for the chart (where the chart actually is)
                chart.selector = selected.selector + " .inner-box";
            } else {throw "No Selector Provided"}

            if (selected.margin) {
                chart.margin = margin;
            } else {
                chart.margin = {top: 15, right: 50, bottom: 50, left: 80};
            }
            if (selected.chartSize) {
                chart.divWidth = selected.chartSize.width;
                chart.divHeight = selected.chartSize.height;
            } else {
                chart.divWidth = 800;
                chart.divHeight = 400;
            }

            chart.width = chart.divWidth - chart.margin.left - chart.margin.right;
            chart.height = chart.divHeight - chart.margin.top - chart.margin.bottom;
            if (selected.axisLabels) {
                chart.xAxisLabel = selected.axisLabels.xAxis;
                chart.yAxisLabel = selected.axisLabels.yAxis;
            } else {
                chart.xAxisLabel = chart.xName;
                chart.yAxisLabel = chart.yNames[0];
            }
            if (selected.colors) {
                color = updateColorFunction(selected.colors);
            }
        }

        getOptions();


        // x and y scales
        chart.xScale = d3.scaleTime()
        	.range([0, chart.width])
        	.domain(d3.extent(chart.data, chart.xFunct));
        chart.yScale = d3.scaleLinear()
        	.range([chart.height, 0])
        	.domain([0, getYMax()]);

        // create axes     
    	chart.objs.xAxis = d3.axisBottom().scale(chart.xScale)
    	chart.objs.yAxis = d3.axisLeft().scale(chart.yScale).tickFormat(chart.asFloat); 



        // create lines
        for (var yName in yAxisNames) {
        	chartY = chart.groupObjs[yName];
            chartY.objs.line = {g:null, series:null};
            chartY.objs.line.series = d3.line()
                .x(function (d) {return chart.xScale(chart.xFunct(d));})
                .y(function (d) {return chart.yScale(chart.groupObjs[yName].yFunct(d))});
        }

        chart.objs.mainDiv.style("max-width", chart.divWidth + "px");
        chart.objs.mainDiv.append("div")
            .attr("class", "inner-wrapper")
            .style("padding-bottom", (chart.divHeight / chart.divWidth) * 100 + "%")
            .append("div").attr("class", "outer-box")
            .append("div").attr("class", "inner-box");
        chart.objs.chartDiv = d3.select(chart.selector);
        d3.select(window).on('resize.' + chart.selector, chart.update);

        console.log('width ' + chart.width);
        console.log('margin left ' + chart.margin.left);


        // Create the svg
        chart.objs.g = chart.objs.chartDiv.append("svg")
            .attr("class", "chart-area")
            .attr("width", chart.width + (chart.margin.left + chart.margin.right))
            .attr("height", chart.height + (chart.margin.top + chart.margin.bottom))
            .append("g")
            .attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")");

        chart.objs.axes = {};
        chart.objs.axes.g = chart.objs.g.append("g").attr("class", "axis");
       

        // Show axis
        chart.objs.axes.x = chart.objs.axes.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(chart.objs.xAxis)
            .append("text")
                .attr("class", "label")
                .attr("x", chart.width / 2)
                .attr("y", 0)
                .style("text-anchor", "middle")
                .text(chart.xAxisLabel);

        chart.objs.axes.y = chart.objs.axes.g.append("g")
            .attr("class", "y axis")
            .call(chart.objs.yAxis)
            .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("x", -chart.height / 2)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text(chart.yAxisLabel);
      	
      	console.log('y axis lable ' + chart.yAxisLabel);
        console.log('x axis lable' + chart.xAxisLabel);

        return chart;
	}

	// Render the chart
	chart.render = function () {

		chart.objs.legend = chart.objs.mainDiv.append('div').attr("class", "legend");

		function toggleSeries(yName) {
            var chartY = chart.groupObjs[yName];
            chartY.visible = !chartY.visible;
            if (chartY.visible==false) {
            	chartY.objs.legend.div.style("opacity","0.25");
            } else {
            	chartY.objs.legend.div.style("opacity","1");
            }
            chart.update()
        }

        function getToggleFn(series) {
            return function () {
                return toggleSeries(series);
            };
        }

        for (var yName in chart.groupObjs) {
        	chartY = chart.groupObjs[yName];
			chartY.objs.g = chart.objs.g.append("g");
			chartY.objs.line.g = chartY.objs.g.append("path")
				.datum(chart.data)
				.attr("class", "line")
				.attr("d", chartY.objs.line.series)
				.style("stroke", color(yName))  // ------------------------------------change to colorFunct
				.attr("data-series", yName)
				.on("mouseover", function () { tooltip.style("display", null); })
				.on("mouseout", function () { tooltip.transition().delay(700).style("display", "none");})
				.on("mousemove", mouseHover);

            chartY.objs.legend = {};
            chartY.objs.legend.div = chart.objs.legend.append('div').on("click",getToggleFn(yName));
            chartY.objs.legend.icon = chartY.objs.legend.div.append('div')
                .attr("class", "series-marker")
                .style("background-color", color(yName));// ------------------------------------change to colorFunct
            chartY.objs.legend.text = chartY.objs.legend.div.append('p').text(yName);
        }

        // Draw tooltips
        chart.objs.tooltip = chart.objs.g.append("g").attr("class", "tooltip").style("display", "none");
        chart.objs.tooltip.append("text").attr("class", "year").attr("x", 9).attr("y", 7);
        chart.objs.tooltip.append("line").attr("class", "line").attr("y1", 0).attr("y2", chart.height);

        for (yName in chart.groupObjs) {
            chartY = chart.groupObjs[yName];
            //Add tooltip elements
            var tooltip = chart.objs.tooltip.append("g");
            chartY.objs.circle = tooltip.append("circle").attr("r", 5);
            chartY.objs.rect = tooltip.append("rect").attr("x", 8).attr("y","-5").attr("width",22).attr("height",'0.75em');
            chartY.objs.text = tooltip.append("text").attr("x", 9).attr("dy", ".35em").attr("class","value");
            chartY.objs.tooltip = tooltip;
        }



        // Hover
        chart.objs.g.append("rect")
            .attr("class", "overlay")
            .attr("width", chart.width)
            .attr("height", chart.height)
            .on("mouseover", function () {
                chart.objs.tooltip.style("display", null);
            }).on("mouseout", function () {
                chart.objs.tooltip.style("display", "none");
            }).on("mousemove", mouseHover);

        return chart;

        function mouseHover() {
            var x0 = chart.xScale.invert(d3.mouse(this)[0]), i = chart.bisectYear(dataset, x0, 1), d0 = chart.data[i - 1], d1 = chart.data[i];
            try {
                var d = x0 - chart.xFunct(d0) > chart.xFunct(d1) - x0 ? d1 : d0;
            } catch (e) { return;}
            var minY = chart.height;
            var yName, chartY;
            for (yName in chart.groupObjs) {
                chartY = chart.groupObjs[yName];
                if (chartY.visible==false) {continue}
                chartY.objs.tooltip.attr("transform", "translate(" + chart.xScale(chart.xFunct(d)) + "," + chart.yScale(chartY.yFunct(d)) + ")");
                chartY.objs.tooltip.select("text").text(chart.asFloat(chartY.yFunct(d)));
                minY = Math.min(minY, chart.yScale(chartY.yFunct(d)));
            }

            chart.objs.tooltip.select(".tooltip .line").attr("transform", "translate(" + chart.xScale(chart.xFunct(d)) + ")").attr("y1", minY);
            chart.objs.tooltip.select(".tooltip .year").text("Year: " + (chart.xFunct(d)));
        }


	}
	return chart;
}