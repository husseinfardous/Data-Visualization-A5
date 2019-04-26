/*** DEFINE CONSTANTS HERE ***/
WIDTH = 1000;
HEIGHT = 550;

T_DURATION = 1000;

var xBar, yBar, xAxisBar, yAxisBar;
var aggData;
var barChart;

const marginBar = {
  bottom: 100,
  left: 100,
  right: 100,
  top: 100
};

const axisLabelPos = {
  yAxis: 40
}

const legend = [{gender: 'Male', color: 'steelblue', y: marginBar.top}, {gender: 'Female', color: 'red', y: marginBar.top + 20}]

// Data files
d3.csv("https://gist.githubusercontent.com/shpach/6413032be4ce6e57c46d84458c21dd38/raw/184af816311e3938f9ebd2c80d8f51d3b9a79cfe/agg-recent-grads.csv",
  function(data) {
    return {
      Major_code: data.Major_code,
      Major: data.Major,
      Major_category: data.Major_category,
      Total: parseInt(data.Total),
      Sample_size: parseInt(data.Sample_size),
      Men: parseInt(data.Men),
      Women: parseInt(data.Women),
      ShareWomen: parseFloat(data.ShareWomen),
      Employed: parseInt(data.Employed),
      Full_time: parseInt(data.Full_time),
      Part_time: parseInt(data.Part_time),
      Full_time_year_round: parseInt(data.Full_time_year_round),
      Unemployed: parseInt(data.Unemployed),
      Unemployment_rate: parseFloat(data.Unemployment_rate),
      Median: parseInt(data.Median),
      College_jobs: parseInt(data.College_jobs),
      Non_college_jobs: parseInt(data.Non_college_jobs),
      Low_wage_jobs: parseInt(data.Low_wage_jobs),
      Percent_college_jobs: parseFloat(data.PercentCollegeJobs) * 100
    }
  }
).then(createChart);

// using d3 for convenience
var main = d3.select('main')
var scrolly = main.select('#scrolly');
var figure = scrolly.select('figure');
var article = scrolly.select('article');
var step = article.selectAll('.step');
let svg = figure.select('p').select('svg');
var CURRENT_STEP = 'Median';

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
  step.style('height', stepH + 'px');

  var figureHeight = window.innerHeight / 2
  var figureMarginTop = (window.innerHeight - figureHeight) / 2  

  figure
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');


  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  // response = { element, direction, index }
  console.log(response);
  CURRENT_STEP = d3.select(response.element).attr('data-step');
  console.log(CURRENT_STEP);

  // add color to current step only
  step.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // update graphic based on step
  let svg = figure.select('p').select('svg').select("circle");
  svg.transition().duration(200).attr('r', response.index * 10);

  barChart.update(CURRENT_STEP);
}

function setupStickyfill() {
  d3.selectAll('.sticky').each(function () {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  //    this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.setup({
    step: '#scrolly article .step',
    offset: 0.5,
    // debug: true,
  })
    .onStepEnter(handleStepEnter)


  // setup resize event
  window.addEventListener('resize', handleResize);
}

/*** GRAPHICAL SETUP ***/

function createChart(data) {
  aggData = data;
  aggData.sort((a, b) => b.Median - a.Median);

  setupAxes();
  setupGraph();
}

function setupGraph() {
  
  const LEGEND_X = 800;
  const LEGEND_SIZE = 10;

  const titles = {  "Median" : "Median Yearly Income",
                    "Total" : "# of Students",
                    "women" : "# of Students",
                    "Percent_college_jobs" : "% of Graduates in Jobs Requiring College Degree"}
    
  xBar.domain(aggData.map(d => d.Major_category));
  
  // Different bar graphs (explicitly set womenBar for the ShareWomen stacked bar chart)
  const bar = svg.append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(aggData, d => d.Major_category)
      .join("rect")
      .style("mix-blend-mode", "multiply")
      .attr("x", -xBar.bandwidth())
      .attr("y", 0)
      .attr("transform", d => rotate(xBar(d.Major_category), yBar(0), 180))
      .attr("width", xBar.bandwidth());

  // Need special logic for Share of Women bar since it is overlayed for the stacked bar chart
  const womenBar = svg.append("g")
      .attr("fill", "red")
      .selectAll("rect")
      .data(aggData, d => d.Major_category)
      .join("rect")
      .style("mix-blend-mode", "multiply")
      .attr("x", -xBar.bandwidth())
      .attr("y", 0)
      .attr("transform", d => rotate(xBar(d.Major_category), yBar(0), 180))
      .attr("width", xBar.bandwidth())
      .style("opacity", 0);
  
  
  // Legend
  var barLegends = svg.selectAll(".groups")
    .data(legend)
    .enter()
    .append("g")
    .attr("class", "barLegend")
    .style("opacity", 0);
  
  barLegends.append('rect')
    .attr('x', LEGEND_X)
    .attr('y', d => d.y)
    .attr('width', LEGEND_SIZE)
    .attr('height', LEGEND_SIZE)
    .attr('fill', d => d.color);

  barLegends.append('text')
    .text(d => d.gender)
   .attr('x', LEGEND_X + 2 * LEGEND_SIZE)
   .attr('y', d => d.y + LEGEND_SIZE)
   .style("font-size", "13px");

  svg.node().update = (o) => {

    if(CURRENT_STEP === 'women'){

      yBar = d3.scaleLinear()
        .domain([0, d3.max(aggData, d => d['Total'])]).nice()
        .range([HEIGHT - marginBar.bottom, marginBar.top]);

      womenBar
        .attr("height", d => yBar(0) - yBar(d['ShareWomen'] * d['Total']))
        .transition()
        .duration(T_DURATION)
        .style("opacity", 1);
      
      barLegends.transition()
        .duration(T_DURATION)
        .style("opacity", 1);
      
      bar.data(aggData, d => d.Major_category)
        .transition()
        .duration(T_DURATION)
        .attr("height", d => yBar(0) - yBar(d['Total']))
        // .attr("y", d => yBar(0));
      
      // bar.data(aggData, d => d.Major_category)
      //   .transition()
      //   .duration(T_DURATION)
      //   .attr("height", d => yBar(0) - yBar(d['Total'] * (1 - d['ShareWomen'])))
      //   .attr("y", d => yBar(0) - yBar(d['ShareWomen'] * d['Total']));

      
    }
    
    else{
      yBar = d3.scaleLinear()
        .domain([0, d3.max(aggData, d => d[CURRENT_STEP])]).nice()
        .range([HEIGHT - marginBar.bottom, marginBar.top]);

      barLegends.transition()
        .duration(T_DURATION)
        .style("opacity", 0);

      bar.data(aggData, d => d.Major_category)
      .transition()
      .duration(T_DURATION)
      .attr("height", d => yBar(0) - yBar(d[o])); 
      
      womenBar.transition()
        .duration(T_DURATION)
        .style("opacity", 0);
    }

    yAxisBar = g => g
      .attr("transform", `translate(${marginBar.left},0)`)
      .call(d3.axisLeft(yBar))
      .call(g => g.select(".domain").remove());

    // Animate y-axis on rescale between different graphs
    svg.select(".y-axes")
      .transition()
      .call(yAxisBar);

    svg.select(".y-label")
      .transition()
      .text(titles[CURRENT_STEP]);
    
  };

  barChart = svg.node();
}

function setupAxes() {
  xBar = d3.scaleBand()
    .domain(aggData.map(d => d.Major_category))
    .range([marginBar.left, WIDTH - marginBar.right])
    .padding(0.1);

  yBar = d3.scaleLinear()
    .domain([0, d3.max(aggData, d => d[CURRENT_STEP])]).nice()
    .range([HEIGHT - marginBar.bottom, marginBar.top])

  xAxisBar = g => g
    .attr("transform", `translate(0,${HEIGHT - marginBar.bottom})`)
    .call(d3.axisBottom(xBar).tickSizeOuter(0))

  yAxisBar = g => g
    .attr("transform", `translate(${marginBar.left},0)`)
    .call(d3.axisLeft(yBar))
    .call(g => g.select(".domain").remove())

  gx = svg.append("g")
      .call(xAxisBar)
      .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-30)");

  gy = svg.append("g")
      .attr("class", "y-axes")
      .call(yAxisBar);

  yLabel = svg.append("text")
    .attr("class", "y-label")
    .attr("transform", rotate(axisLabelPos.yAxis, HEIGHT/2, -90))
    .style("text-anchor", "middle")
    .attr("font-size", "11px")
    .text("Median");
}

function rotate(x, y, r) {
  return `translate(${x},${y}) rotate(${r})`;
}


init();