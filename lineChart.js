/*
 * Multiple Line Chart using D3
 * 
 **/

function makeLineChart(dataset, xName, yObjs, axisLabel, annotationLabel) {
    

    var chartObj = {};
    chartObj.xAxisLabel = axisLabel.xAxis;
    chartObj.yAxisLabel = axisLabel.yAxis;

    chartObj.data = dataset;
    chartObj.margin = {top: 15, right: 40, bottom: 30, left: 90};
    chartObj.width = 900 - chartObj.margin.left - chartObj.margin.right;
    chartObj.height = 480 - chartObj.margin.top - chartObj.margin.bottom;


// So we can pass the x and y as strings when creating the function
    chartObj.xFunct = function(d) { return d[xName]; };
    function getYFn(column) { return function (d) { return d[column]; }; }
    chartObj.yFuncts = [];
    for (var y  in yObjs) {
        yObjs[y].name = y;
        yObjs[y].yFunct = getYFn(yObjs[y].column); //Need this  list for the ymax function
        chartObj.yFuncts.push(yObjs[y].yFunct);
    }

    var color = d3.scaleOrdinal(d3.schemeCategory10);

//Formatter functions for the axes
    chartObj.formatAsNumber = d3.format(".0f");
    chartObj.formatAsCurrency = d3.format("$.2f");
    chartObj.formatAsFloat = function (d) {
        if (d % 1 !== 0) {
            return d3.format(".2f")(d);
        } else {
            return d3.format(".0f")(d);
        } 
    };
    chartObj.bisectYear = d3.bisector(chartObj.xFunct).left; //< Can be overridden in definition

//Create scale functions (chg scaleLinear to scaleTime)
   chartObj.xScale = d3.scaleTime().range([0, chartObj.width]).domain(d3.extent(chartObj.data, chartObj.xFunct)); //< Can be overridden in definition
   //chartObj.xScale = d3.scaleTime().rangeRound([0, chartObj.width])

// Get the max of every yFunct
    chartObj.max = function (fn) {
        return d3.max(chartObj.data, fn);
    };
    chartObj.yScale = d3.scaleLinear().range([chartObj.height, 0]).domain([0.7, d3.max(chartObj.yFuncts.map(chartObj.max))]);

//Create axis
   // chartObj.xAxis = d3.axisBottom().scale(chartObj.xScale).tickFormat(chartObj.xFormatter); //< Can be overridden in definition (REMOVE THIS)
    chartObj.xAxis = d3.axisBottom().scale(chartObj.xScale)
    chartObj.yAxis = d3.axisLeft().scale(chartObj.yScale).tickFormat(chartObj.formatAsFloat); //< Can be overridden in definition

// Build line building functions
    function getYScaleFn(yObj) {
        return function (d) {
            return chartObj.yScale(yObjs[yObj].yFunct(d));
        };
    }
    for (var yObj in yObjs) {
        yObjs[yObj].line = d3.line().x(function (d) {
            return chartObj.xScale(chartObj.xFunct(d));
        }).y(getYScaleFn(yObj)).curve(d3.curveLinear);
    }
    
    // create svg
   // chartObj.svg;

// Bind the chart
    chartObj.bind = function (selector) {
        chartObj.mainDiv = d3.select(selector);
        // Add all the divs to make it centered and responsive
        chartObj.mainDiv.append("div").attr("class", "inner-wrapper").append("div").attr("class", "outer-box").append("div").attr("class", "inner-box");
        chartSelector = selector + " .inner-box";
        chartObj.chartDiv = d3.select(chartSelector);
        return chartObj;
    };

// Render the chart
    chartObj.render = function () {
        //Create SVG element
        chartObj.svg = chartObj.chartDiv.append("svg").attr("class", "chart-area").attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right)).attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom)).append("g").attr("transform", "translate(" + chartObj.margin.left + "," + chartObj.margin.top + ")");

        // Draw Lines
        for (var y  in yObjs) {
            yObjs[y].path = chartObj.svg.append("path").datum(chartObj.data).attr("class", "line").attr("d", yObjs[y].line).style("stroke", color(y)).attr("data-series", y).on("mouseover", function () {
                focus.style("display", null);

            }).on("mouseout", function () {
                focus.transition().delay(700).style("display", "none");
            }).on("mousemove", mousemove);
        }
        
        // Draw Y and X Axis
        chartObj.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chartObj.height + ")")
            .call(chartObj.xAxis)
        .append("text")//.attr("class", "label")
            .attr("x", chartObj.width )
            .attr("y", 30)
            .attr("fill", "#000")
            .style("text-anchor", "middle")
            .text(chartObj.xAxisLabel);

        chartObj.svg.append("g")
            .attr("class", "y axis")
            .call(chartObj.yAxis)
        .append("text")
            //.attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -chartObj.height / 2)
            .attr("dy", ".1em")
            .attr("fill", "#000")
            .style("text-anchor", "middle")
            .text(chartObj.yAxisLabel);

        //Draw tooltips
        var focus = chartObj.svg.append("g").attr("class", "focus").style("display", "none");
        for (var y  in yObjs) {
            yObjs[y].tooltip = focus.append("g");
            yObjs[y].tooltip.append("circle").attr("r", 5);
            yObjs[y].tooltip.append("rect").attr("x", 8).attr("y","-5").attr("width",40).attr("height",10).attr("border-radius", "2px");
           yObjs[y].tooltip.append("text").attr("x", 9).attr("dy", 5);
        }

        // Year label
        focus.append("text").attr("class", "focus year").attr("x", 9).attr("y", 7);
        // Focus line
        focus.append("line").attr("class", "focus line").attr("y1", 0).attr("y2", chartObj.height);

        // Draw legend
        var legend = chartObj.mainDiv.append('div').attr("class", "legend");
        for (var y  in yObjs) {
            series = legend.append('div');
            series.append('div').attr("class", "series-marker").style("background-color", color(y));
            series.append('p').text(y);
            yObjs[y].legend = series;
        }

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


        // Overlay to capture hover
        chartObj.svg.append("rect").attr("class", "overlay").attr("width", chartObj.width).attr("height", chartObj.height).on("mouseover", function () {
            focus.style("display", null);
        }).on("mouseout", function () {
            focus.style("display", "none");
        }).on("mousemove", mousemove);

        return chartObj;

        function mousemove() {
            var x0 = chartObj.xScale.invert(d3.mouse(this)[0]), i = chartObj.bisectYear(dataset, x0, 1), d0 = chartObj.data[i - 1], d1 = chartObj.data[i];
            try {
                var d = x0 - chartObj.xFunct(d0) > chartObj.xFunct(d1) - x0 ? d1 : d0;
            } catch (e) { return;}
            minY = chartObj.height;
            for (var y  in yObjs) {
                yObjs[y].tooltip.attr("transform", "translate(" + chartObj.xScale(chartObj.xFunct(d)) + "," + chartObj.yScale(yObjs[y].yFunct(d)) + ")");
                yObjs[y].tooltip.select("text").text(chartObj.formatAsFloat(yObjs[y].yFunct(d)));
                minY = Math.min(minY, chartObj.yScale(yObjs[y].yFunct(d)));
            }

            focus.select(".focus.line").attr("transform", "translate(" + chartObj.xScale(chartObj.xFunct(d)) + ")").attr("y1", minY);
           // focus.select(".focus.year").text("Year: " + chartObj.xFormatter(chartObj.xFunct(d)));
           focus.select(".focus.year").text("Date: " + chartObj.xFunct(d));

        }

    };
    return chartObj;
}