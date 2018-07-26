/*
	Scatterplot using D3

*/

function makeScatterplot(data, axisLabel, annotationLabel) {
    var chartObj = {};

    chartObj.xAxisLabel = axisLabel.xAxis;   
    chartObj.yAxisLabel = axisLabel.yAxis;   

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    chartObj.data = data;
    chartObj.margin = {top: 15, right: 40, bottom: 30, left: 100};
    chartObj.width = 900 - chartObj.margin.left - chartObj.margin.right;
    chartObj.height = 480 - chartObj.margin.top - chartObj.margin.bottom;

    // format functions
	var formatPercent = d3.format('.2%');
	var formatCurrency = d3.format("$,");

    chartObj.xScale = d3.scaleLinear()
    	.range([0, chartObj.width])
    	.domain([0, d3.max(chartObj.data, function(d) { return d.risk} )])  // risk measure can never be negative

    chartObj.yScale = d3.scaleLinear()
    	.range([chartObj.height, 0])
    	.domain([d3.min([0, d3.min(chartObj.data, function(d) { return d.return })]),
    	  	d3.max([0, d3.max(chartObj.data, function(d) { return d.return })]) ])

   // create x and y axes
   chartObj.xAxis = d3.axisBottom().scale(chartObj.xScale)
   chartObj.yAxis = d3.axisLeft().scale(chartObj.yScale)


   // Function for Binding the Chart
   chartObj.bind = function (chart_id) {
        chartObj.mainDiv = d3.select(chart_id);
        chartObj.mainDiv.append("div").attr("class", "inner-wrapper").append("div").attr("class", "outer-box").append("div").attr("class", "inner-box");
        chartSelected = chart_id + " .inner-box";
        chartObj.chartDiv = d3.select(chartSelected);
        return chartObj;
   }

   // Render Chart
   chartObj.render = function () {
   		// create svg
   		chartObj.svg =  chartObj.chartDiv.append("svg")
   			.attr("class", "chart-area")
   			.attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right))
   			.attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom))
   			.append("g").attr("transform", "translate(" + chartObj.margin.left + "," + chartObj.margin.top + ")");

   		// draw circles
   		chartObj.svg.selectAll('circle')
   			.data(data)
   			.enter()
   		.append('circle')
   			.attr('cx', function(d) { return chartObj.xScale(d.risk)})
   			.attr('cy', function(d) { return chartObj.yScale(d.return)})
   			.attr('r', function(d){ return d3.max([1.5, Math.log(d.mktcap / 1e6 ) ]) })
   			.attr('fill',function (d,i) { return color(i) })
			.on('mouseover', function (d, i) {
				d3.select(this)
				  .transition()
				  .duration(500)
				  .attr('r', 50)
				  .attr('stroke-width',3)
				 // .attr('stroke', function (d,i) { return color(i) })
				  .attr('fill-opacity', 0.15);
			})
			.on('mouseout', function () {
				d3.select(this)
				  .transition()
				  .duration(500)
				  .attr('r', function(d){ return d3.max([1.5, Math.log(d.mktcap / 1e6) ]) })
				  .attr('stroke-width',1)
				  .attr('fill-opacity', 1);
			})
			.append('title') // Basic Tooltip
				.attr('fill', 'dodgerblue')
      			.text(function (d) { return d.name + '\nTicker: ' + d.ticker +
                           '\nReturn: ' + formatPercent(d.return) +
                           '\nRisk: ' + formatPercent(d.risk) + 
                       		'\nDaily Traded Volume: ' + formatCurrency(d.volume) + '\nMarket Cap: ' + formatCurrency(d.mktcap) });

      	// draw axis
      	chartObj.svg.append("g")
      		.attr("class", "x axis")
      		.attr("transform", "translate(0," + chartObj.height + ")")
      		.call(chartObj.xAxis)
      	.append("text")
      		.attr("x", chartObj.width * 6/7)
      		.attr("y", 30)
      		.attr("fill", "#000")
      		.style("text-anchor", "left")
      		.text(chartObj.xAxisLabel);

		chartObj.svg.append('g')
			  .attr('class', 'y axis')
			  .call(chartObj.yAxis)
			.append('text')
			  .attr('transform','rotate(-90)')
			  .attr('x',-chartObj.height / 2)
			  .attr('y',-45)
			  .attr("fill", "#000")
			  .style('text-anchor','middle')
			  .text(chartObj.yAxisLabel);

        // Add Annotations
        chartObj.svg.selectAll("text.label")
            .data(annotationLabel)
            .enter()
            .append("text")
            .attr('x', function(d) { return chartObj.xScale(d.x)})
            .attr('y', function(d) { return chartObj.yScale(d.y)})
            .style('text-anchor', function(d) { return d.orient == 'right' ? 'start' : 'end'})
            .text(function(d) { return d.text});

         chartObj.svg.selectAll("text.label")
            .data(annotationLabel)
            .enter()
            .append("line")
            .attr("x1", function(d) {  return chartObj.xScale(d.x)})
            .attr("x2", function(d) {  return chartObj.xScale(d.x)})
            .attr("y1", function(d) {  return chartObj.yScale(d.y)})
            .attr("y2", function(d) {  return chartObj.yScale(d.y0)})
            .style("stroke", "black")
            .style("stroke-dasharray", "1,3");

        chartObj.svg.selectAll("text.label")
            .data(annotationLabel)
            .enter() 
            .append("line")
            .attr("x1", function(d) {  return chartObj.xScale(0.04)})
            .attr("x2", function(d) {  return chartObj.xScale(0.18)})
            .attr("y1", function(d) {  return chartObj.yScale(0.005)})
            .attr("y2", function(d) {  return chartObj.yScale(0.021)})
            .style("stroke", "black")
            .style("stroke-dasharray", "1,3");


        console.log(chartObj.xScale(0.1));

		return chartObj;
   }

   return chartObj;
}


function makeScatterplot2(data, axisLabel, annotationLabel) {
    var chartObj = {};

    chartObj.xAxisLabel = axisLabel.xAxis;   
    chartObj.yAxisLabel = axisLabel.yAxis;   

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    chartObj.data = data;
    chartObj.margin = {top: 15, right: 40, bottom: 30, left: 100};
    chartObj.width = 900 - chartObj.margin.left - chartObj.margin.right;
    chartObj.height = 480 - chartObj.margin.top - chartObj.margin.bottom;

    // format functions
	var formatPercent = d3.format('.2%');
	var formatCurrency = d3.format("$,");

    chartObj.xScale = d3.scaleLinear()
    	.range([0, chartObj.width])
    	.domain([0, d3.max(chartObj.data, function(d) { return d.risk} )])  // risk measure can never be negative

    chartObj.yScale = d3.scaleLinear()
    	.range([chartObj.height, 0])
    	.domain([d3.min([0, d3.min(chartObj.data, function(d) { return Math.log(d.volume) })]),
    	  	d3.max([0, d3.max(chartObj.data, function(d) { return Math.log(d.volume) })]) ])

   // create x and y axes
   chartObj.xAxis = d3.axisBottom().scale(chartObj.xScale)
   chartObj.yAxis = d3.axisLeft().scale(chartObj.yScale)


   // Function for Binding the Chart
   chartObj.bind = function (chart_id) {
        chartObj.mainDiv = d3.select(chart_id);
        chartObj.mainDiv.append("div").attr("class", "inner-wrapper").append("div").attr("class", "outer-box").append("div").attr("class", "inner-box");
        chartSelected = chart_id + " .inner-box";
        chartObj.chartDiv = d3.select(chartSelected);
        return chartObj;
   }

   // Render Chart
   chartObj.render = function () {
   		// create svg
   		chartObj.svg =  chartObj.chartDiv.append("svg")
   			.attr("class", "chart-area")
   			.attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right))
   			.attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom))
   			.append("g").attr("transform", "translate(" + chartObj.margin.left + "," + chartObj.margin.top + ")");

   		// draw circles
   		chartObj.svg.selectAll('circle')
   			.data(data)
   			.enter()
   		.append('circle')
   			.attr('cx', function(d) { return chartObj.xScale(d.risk)})
   			.attr('cy', function(d) { return chartObj.yScale( Math.log( d.volume))})
   			.attr('r', function(d){ return d3.max([1.5, Math.log(d.mktcap / 1e6 ) ]) })
   			.attr('fill',function (d,i) { return color(i) })
			.on('mouseover', function (d, i) {
				d3.select(this)
				  .transition()
				  .duration(500)
				  .attr('r', 50)
				  .attr('stroke-width',3)
				 // .attr('stroke', function (d,i) { return color(i) })
				  .attr('fill-opacity', 0.15);
			})
			.on('mouseout', function () {
				d3.select(this)
				  .transition()
				  .duration(500)
				  .attr('r', function(d){ return d3.max([1.5, Math.log(d.mktcap / 1e6) ]) })
				  .attr('stroke-width',1)
				  .attr('fill-opacity', 1);
			})
			.append('title') // Basic Tooltip
				.attr('fill', 'dodgerblue')
      			.text(function (d) { return d.name + '\nTicker: ' + d.ticker +
                           '\nReturn: ' + formatPercent(d.return) +
                           '\nRisk: ' + formatPercent(d.risk) + 
                       		'\nDaily Traded Volume: ' + formatCurrency(d.volume) + '\nMarket Cap: ' + formatCurrency(d.mktcap) });

      	// draw axis
      	chartObj.svg.append("g")
      		.attr("class", "x axis")
      		.attr("transform", "translate(0," + chartObj.height + ")")
      		.call(chartObj.xAxis)
      	.append("text")
      		.attr("x", chartObj.width * 6/7)
      		.attr("y", 30)
      		.attr("fill", "#000")
      		.style("text-anchor", "left")
      		.text(chartObj.xAxisLabel);

		chartObj.svg.append('g')
			  .attr('class', 'y axis')
			  .call(chartObj.yAxis)
			.append('text')
			  .attr('transform','rotate(-90)')
			  .attr('x',-chartObj.height / 2)
			  .attr('y',-45)
			  .attr("fill", "#000")
			  .style('text-anchor','middle')
			  .text(chartObj.yAxisLabel);

        // Add Annotations
        chartObj.svg.selectAll("text.label")
            .data(annotationLabel)
            .enter()
            .append("text")
            .attr('x', function(d) { return chartObj.xScale(d.x)})
            .attr('y', function(d) { return chartObj.yScale(d.y)})
            .style('text-anchor', function(d) { return d.orient == 'right' ? 'start' : 'end'})
            .text(function(d) { return d.text});

         chartObj.svg.selectAll("text.label")
            .data(annotationLabel)
            .enter()
            .append("line")
            .attr("x1", function(d) {  return chartObj.xScale(d.x)})
            .attr("x2", function(d) {  return chartObj.xScale(d.x)})
            .attr("y1", function(d) {  return chartObj.yScale(d.y)})
            .attr("y2", function(d) {  return chartObj.yScale(d.y0)})
            .style("stroke", "black")
            .style("stroke-dasharray", "1,3");

        chartObj.svg.selectAll("text.label")
            .data(annotationLabel)
            .enter() 
            .append("line")
            .attr("x1", function(d) {  return chartObj.xScale(0.05)})
            .attr("x2", function(d) {  return chartObj.xScale(0.24)})
            .attr("y1", function(d) {  return chartObj.yScale(20)})
            .attr("y2", function(d) {  return chartObj.yScale(6)})
            .style("stroke", "black")
            .style("stroke-dasharray", "1,3");


        console.log(chartObj.xScale(0.1));

		return chartObj;
   }

   return chartObj;
}