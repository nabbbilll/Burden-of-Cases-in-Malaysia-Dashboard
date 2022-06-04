// overall each state death data object (for map visualization)
const state_death_data = {
    data: [],
    selectedYear: '2013' //default value
  };
    
  // cause of hospitalization data object
  const cause_data = {
    oldData: [], // to store previous selected data for animation purpose
    data: [],
    selectedYear: '2013' //default value
  };
    
  // store Malaysia geojson
  let malaysia_geojson = {};
    
  // Map Projection
  let projection = d3.geoEquirectangular()
    // .scale(200)
    // .translate([200, 150]);
    
  let geoGenerator = d3.geoPath()
    .projection(projection);    
    
  // Define the tooltip for map
  var map_tooltip = d3.select("body .left-content #map-viz").append("div")	
    .style("opacity", 0)
    .attr("class", "map-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
    
    
  // mouse over function (Map Visualization)
  function handleMouseOver(e, d){
    map_tooltip
      .style('opacity', 1)
  }
    
  // mouse out of hover function (Map Visualization)
  function handleMouseOut(e, d){
    map_tooltip
      .style("opacity", 0);
  }
    
  // mouse move function (Map Visualization)
  function handleMouseMove(e, d){
    map_tooltip
      .html("State: " + d.properties.name + "<br/>"  + "Number of Deaths: " + d.properties.num_of_death)
      .style("left", (e.pageX + 10) + "px")		
      .style("top", (e.pageY - 28) + "px");
  }
    
  //mouse click function
  function handleMouseClick(e, d){
    // update the data object to the selected state and year
    selected_death_data.selectedState = d.properties.name;
    selected_death_data.selectedYear = d.properties.year;
  
    diseases_data.selectedState = d.properties.name;
    diseases_data.selectedYear = d.properties.year;
  
    // function to update visualization
    update_numDeathBar();
    update_diseaseBarChart();
  }
  
  // to get the map element width and height
  var mapElement = d3.select('.left-content #map-viz').node();
    
  // function to assign value to malaysia_geojson data object
  function mergeData(filter_data){
    for (i in filter_data){
      for (j in malaysia_geojson.features){
        if (filter_data[i]['State'] == malaysia_geojson.features[j]['properties']['name']){
            malaysia_geojson.features[j]['properties']['num_of_death'] = filter_data[i]['Number_Of_Death'];
            malaysia_geojson.features[j]['properties']['year'] = filter_data[i]['Year'];
        }
      }
    }       
  }
  
  // create svg for map visualization
  var map_svg = d3.select(".left-content #map-viz") 
    .append("svg")
    .attr("width", mapElement.getBoundingClientRect().width)
    .attr("height", mapElement.getBoundingClientRect().height)
    .append('g')
    .attr('class','map')
  
  // map colour range
  var mapColourRange = d3.scaleLinear().domain([0,27500])
    .range(["white", "red"]);
  
  // function to draw the colour scale legend
  continuousScale("#colourScaleLegend", mapColourRange);
    
  // Update Map when change Year
  function updateMap() {
    const filtered = map_filter_data();
  
    mergeData(filtered);
  
    projection.fitExtent([[0, 0], [ mapElement.getBoundingClientRect().width - 20,  mapElement.getBoundingClientRect().height - 20]], malaysia_geojson);
  
    var mapColour = d3.scaleLinear().domain([0,27500])
      .range(["white", "red"]);
  
    map_svg.selectAll('map_path')
      .data(malaysia_geojson.features)
      .join('path')
      .attr('d', geoGenerator)
      .attr('stroke','#aaa')
      .attr('fill', 'white')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('mousemove', handleMouseMove)
      .on('click', handleMouseClick);
  
    // map animation
    map_svg.selectAll('path')
      .transition()
      .duration(2000)
      .delay(500)
      .attr('fill', function(d){
        return mapColour(d['properties']['num_of_death']);
      })
  }
  
  // create continuous color legend
  function continuousScale(selector_id, colorscale) {
    var legendheight = 300,
        legendwidth = 80,
        margin = {top: 10, right: 65, bottom: 10, left: 2};
  
    var canvas = d3.select(selector_id)
      .style("height", legendheight + "px")
      .style("width", legendwidth + "px")
      .style("left", mapElement.getBoundingClientRect().width/2 + "px")
      .style('top', '360px')
      .style("position", "absolute")
      .append("canvas")
      .attr("height", legendheight - margin.top - margin.bottom)
      .attr("width", 1)
      .style("height", (legendheight - margin.top - margin.bottom) + "px")
      .style("width", (legendwidth - margin.left - margin.right) + "px")
      .style("border", "1px solid #000")
      .style("position", "absolute")
      .style("top", (margin.top) + "px")
      .style("left", (margin.left) + "px")
      .node();
  
    var ctx = canvas.getContext("2d");
  
    var legendscale = d3.scaleLinear()
      .range([1, legendheight - margin.top - margin.bottom])
      .domain(colorscale.domain());
  
    var image = ctx.createImageData(1, legendheight);
    d3.range(legendheight).forEach(function(i) {
      var c = d3.rgb(colorscale(legendscale.invert(i)));
      image.data[4*i] = c.r;
      image.data[4*i + 1] = c.g;
      image.data[4*i + 2] = c.b;
      image.data[4*i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);
  
    var legendaxis = d3.axisRight()
      .scale(legendscale)
      .tickSize(6)
      .ticks(8);
  
    var svg = d3.select(selector_id)
      .append("svg")
      .attr("height", (legendheight) + "px")
      .attr("width", (legendwidth) + "px")
      .style("position", "absolute")
      .style("left", "0px")
      .style("top", "0px")
  
    var axisGroup = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
      .call(legendaxis);
  
    axisGroup.selectAll("text")
      .attr("transform", "translate(15,-20)rotate(90)")
  
    axisGroup.append("text")
      .text("Number of Death Cases")
      .attr("transform", "translate(0,0)rotate(90)")
      .style("fill", "black")
      .attr("y", -25)
      .attr("dx", 170)
      .style("text-anchor", "end");
  };
    
  // LOAD Malaysia map geojson file
  d3.json('dataset/malaysia_map.geojson')
      .then(function(json) {
        malaysia_geojson = json;
  })
    
  // filter the data from based on the selected year from the dropdown menu
  function map_filter_data(){
      return state_death_data.data.filter((d) => {
          if(state_death_data.selectedYear !== d.Year){
            return false;
          }
        return true;
      })  
  }
    
  // Load the number of deaths for each state
  d3.csv('dataset/number_deaths_malaysia.csv').then((parsed) => {
      state_death_data.data = parsed.map((row) => {
        row.Number_Of_Death = parseInt(row.Number_Of_Death);
        return row;
      });
      updateMap();
  });
    
  //interactivity when using dropdown menu
  d3.select('#dropdown-year').on('change', function () {
      const selected = d3.select(this).property('value');
  
      // update the year for other data objects
      state_death_data.selectedYear = selected;
      cause_data.selectedYear = selected;
    
      const map_canvas = d3.select('#left-content #map-viz g.map')
      map_canvas.selectAll("*").remove();
      updateMap();
    
      update_causeBarChart();
    
      selected_death_data.selectedYear = selected;
    
      diseases_data.selectedYear = selected;
    
      update_numDeathBar();
      update_diseaseBarChart();
  });
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Define the tooltip for cause of hospitalization visualization
  var cause_tooltip = d3.select("body .left-content #cause-viz").append("div")	
    .style("opacity", 0)
    .attr("class", "cause-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
  
  // mouse over function for cause of hospitalization visualization
  function handleMouseOver_cause(e, d){
    cause_tooltip
      .style('opacity', 1)
  
    // change the bar colour when hover
    d3.select(this)
      .attr('fill','#356773')
  }
  
  // mouse out of hover function for cause of hospitalization visualization
  function handleMouseOut_cause(e, d){
    cause_tooltip
      .style("opacity", 0);
  
    d3.select(this)
      .attr('fill','#69b3a2')
  }
  
  // mouse move function for cause of hospitalization visualization
  function handleMouseMove_cause(e, d){
    cause_tooltip
      .html("Causes: " + d.Causes + "<br>" + "Rate of Cases: " + d.Value + "%")
      .style("left", (e.pageX + 10) + "px")		
      .style("top", (e.pageY - 28) + "px");
  }
  
  // set the dimensions and margins of the graph
  var causeElement = d3.select('.left-content #cause-viz').node();
  const causeBar_margin = {top: 20, right: 30, bottom: 100, left: 250},
  causeBar_width = causeElement.getBoundingClientRect().width - causeBar_margin.left - causeBar_margin.right,
  causeBar_height = causeElement.getBoundingClientRect().height - causeBar_margin.top - causeBar_margin.bottom;
  
  // append the svg object to the body of the page for cause of hospitalization visualization
  const causeBar_canvas = d3.select(".left-content #cause-viz")
    .append('svg')
    .attr("width", causeBar_width + causeBar_margin.left + causeBar_margin.right)
    .attr("height", causeBar_height + causeBar_margin.top + causeBar_margin.bottom)
    .append("g")
    .attr("transform", `translate(${causeBar_margin.left}, ${causeBar_margin.top})`);
  
  // function to initialize the drawing of the cause of hospitalization viz
  function draw_causeBarChart(){
    const filtered = filter_causeData();
    // update the oldData in the cause data object
    cause_data.oldData = filtered;
  
    // sort descending
    filtered.sort(function(a, b) {
      return b.Value - a.Value;
    });
  
    //X-axis
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([ 0, causeBar_width]);
  
    var xAxisGroup = causeBar_canvas.append("g")
      .attr("transform", `translate(0, ${causeBar_height})`)
      .call(d3.axisBottom(x))
      
    xAxisGroup.selectAll("text")
      .attr("transform", "translate(5,0)")
      .style("text-anchor", "end");
  
    xAxisGroup.append('text')
      .text('Rate of Cases (%)')
      .style("fill", "black")
      .attr("y", 33)
      .attr("dx", causeBar_width/2)
  
    // Y axis
    const y = d3.scaleBand()
      .range([ 0, causeBar_height ])
      .domain(filtered.map(d => d.Causes))
      .padding(.1);
  
    var yAxisGroup = causeBar_canvas.append("g")
      .attr('id','y-axis')
      .call(d3.axisLeft(y));
  
    yAxisGroup.append('text')
      .text('Causes of Hospitalization')
      .style("fill", "black")
      .attr("y", -10)
      .attr("dx", -10)
      .style("text-anchor", "end");
  
    // bars
    causeBar_canvas.selectAll("myRect")
      .data(filtered)
      .join("rect")
      .attr("x", x(0) )
      .attr("y", d => y(d.Causes))
      .attr("width", 0) //always equal to 0
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2")
      .on('mouseover', handleMouseOver_cause)
      .on('mouseout', handleMouseOut_cause)
      .on('mousemove', handleMouseMove_cause)
  
  
    // animation
    causeBar_canvas.selectAll("rect")
      .transition()
      .duration(2000)
      .attr("y", d => y(d.Causes))
      .attr("width", d => x(d.Value))
      .delay((d,i) => {return i*100})
  }
  
  // add old data to the new/selected data
  function transition_causeData(data){
    for (i in cause_data.oldData){
      for (j in data){
        if(data[j]['Causes'] == cause_data.oldData[i]['Causes']){
          data[j]['prev_value'] = cause_data.oldData[i]['Value']
        }
      }
    }
    return data
  }
  
  // function to update the viz after selection of another year
  function update_causeBarChart(){
    const filtered = filter_causeData();
    causeData_transition = transition_causeData(filtered);
  
    // update old data
    cause_data.oldData = filtered;
  
    // sort descending
    filtered.sort(function(a, b) {
      return b.Value - a.Value;
    });
  
    //X-axis
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([ 0, causeBar_width]);
  
    // Y axis
    const y = d3.scaleBand()
      .range([ 0, causeBar_height ])
      .domain(filtered.map(d => d.Causes))
      .padding(.1);
  
    causeBar_canvas.select("#cause-viz svg g #y-axis")
      .transition()
      .duration(2000)
      .call(d3.axisLeft(y));
  
    // bars (transition to rearrange the bars to new position)
    causeBar_canvas.selectAll("rect")
      .transition()
      .duration(2000)
      .attr("y", d => y(d.Causes))
      .on("end", function(){
        causeBar_canvas.selectAll('rect').remove()
        // bars (transition to adjust the width of the bar to the new value)
        causeBar_canvas.selectAll("myRect")
          .data(causeData_transition)
          .join("rect")
          .attr("x", x(0) )
          .attr("y", d => y(d.Causes))
          .attr("width", d => x(d.prev_value))
          .attr("height", y.bandwidth())
          .attr("fill", "#69b3a2")
          .on('mouseover', handleMouseOver_cause)
          .on('mouseout', handleMouseOut_cause)
          .on('mousemove', handleMouseMove_cause)
  
  
        // animation
        causeBar_canvas.selectAll("rect")
          .transition()
          .duration(2000)
          .attr("y", d => y(d.Causes))
          .attr("width", d => x(d.Value))
      })
  }
  
  // filter cause data containing selected year
  function filter_causeData(){
  return cause_data.data.filter((d) => {
    if(cause_data.selectedYear !== d.Year){
        return false;
    }
    return true;
  })
  }
  
  // load csv data
  d3.csv('dataset/cause_of_hospitalization.csv').then((parsed) => {
    cause_data.data = parsed.map((row) => {
      row.Value = parseFloat(row.Value);
      return row;
    });
    draw_causeBarChart();
  });
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Define the tooltip for state death for each gender
  var death_tooltip = d3.select("body .right-content").append("div")	
    .style("opacity", 0)
    .attr("class", "death-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
  
  // mouse over function for state death bar viz
  function handleMouseOver_death(e, d){
    death_tooltip
      .style('opacity', 1)
  
    d3.select(this)
      .attr('fill','#356773')
  }
  
  // mouse out of hover function for state death bar viz
  function handleMouseOut_death(e, d){
    death_tooltip
      .style("opacity", 0);
  
    if (d.sex == "Male"){
      d3.select(this)
        .attr('fill','#8caad2')
    }
    else{
      d3.select(this)
        .attr('fill','#e27c7c')
    }
  }
  
  // mouse move function for state death bar viz
  function handleMouseMove_death(e, d){
    death_tooltip
      .html("Age Group: " + d.age_group + "<br>" + "Number of Death: " + d.number_of_death)
      .style("left", (e.pageX + 10) + "px")		
      .style("top", (e.pageY - 28) + "px");
  }
  
  // for state death data (data for bar chart)
  const selected_death_data = {
    oldData: [],
    data: [],
    selectedYear: '2013', //default value for year
    selectedState: 'Melaka' //default value for state
  };
  
  // load number of death cases file
  d3.csv('dataset/number_deaths_by_state_age_group.csv').then((parsed) => {
    selected_death_data.data = parsed.map((row) => {
      row.number_of_death = parseInt(row.number_of_death);
      return row;
    });
    draw_numDeathBar();
  });
  
  // set the dimensions and margins of the graph 
  var deathElement = d3.select('.right-content #male-death-viz').node();
  var deathBar_margin = {top: 10, right: 30, bottom: 110, left: 40}, 
  deathBar_width = deathElement.getBoundingClientRect().width - deathBar_margin.left - deathBar_margin.right, 
  deathBar_height = deathElement.getBoundingClientRect().height - deathBar_margin.top - deathBar_margin.bottom; 
  
  var male_death_svg = d3.select(".right-content #male-death-viz") 
    .append("svg") 
    .attr("width", deathBar_width + deathBar_margin.left + deathBar_margin.right) 
    .attr("height", deathBar_height + deathBar_margin.top + deathBar_margin.bottom) 
    .append("g") 
    .attr("transform", "translate(" + deathBar_margin.left + "," + deathBar_margin.top + ")");
  
  var female_death_svg = d3.select(".right-content #female-death-viz") 
    .append("svg") 
    .attr("width", deathBar_width + deathBar_margin.left + deathBar_margin.right) 
    .attr("height", deathBar_height + deathBar_margin.top + deathBar_margin.bottom) 
    .append("g") 
    .attr("transform", "translate(" + deathBar_margin.left + "," + deathBar_margin.top + ")");
  
  // function to initialize the drawing by seperating the data into two gender
  function draw_numDeathBar(){
    // create a variable for the filter data (based on selected state and year)
    filter_death_state = filter_death_data();
    selected_death_data.oldData = filter_death_state;
  
    male_data = filter_gender(filter_death_state, "Male");
    female_data = filter_gender(filter_death_state, "Female");
  
    //return max value for Y-axis range
    var max_val = d3.max(filter_death_state, function(d){ return d.number_of_death; })
  
    // if-else condition for max_val equals to 0
    if (max_val == 0){
      max_val = 100;
    }
  
    draw_numDeathBarGender(male_data, "#8caad2", max_val);
    draw_numDeathBarGender(female_data, "#e27c7c", max_val);  
  }
  
  // function to initialize the drawing of the bar chart for each gender
  function draw_numDeathBarGender(data, bar_colour, max_val){
    // select to append to svg based on the correct gender
    if (bar_colour == "#8caad2"){
      death_svg = male_death_svg
    } else{
      death_svg = female_death_svg
    }
  
    // add X axis
    const x = d3.scaleBand() 
      .range([ 0, deathBar_width ]) 
      .domain(data.map(d => d.age_group)) 
      .padding(0.2); 
      
    var xAxisGroup = death_svg.append("g") 
      .attr('id','x-axis')
      .attr("transform", `translate(0,${deathBar_height})`) 
      .call(d3.axisBottom(x)) 
    
    xAxisGroup.selectAll("text") 
      .attr("transform", "translate(-10,0)rotate(-45)") 
      .style("text-anchor", "end"); 
  
    xAxisGroup.append("text")
      .text("Age Group")
      .style("fill", "black")
      .attr("y", 50)
      .attr("dx", 200)
      .style("text-anchor", "end");
      
    // Add Y axis 
    const y = d3.scaleLinear()
      .domain([0, max_val]) 
      .range([deathBar_height, 0]); 
      
    var yAxisGroup = death_svg.append("g") 
      .attr('id','y-axis')
      .call(d3.axisLeft(y)); 
  
    yAxisGroup.append("text")
      .text("Number of Death Cases")
      .style("fill", "black")
      .attr("transform", "translate(0,15)rotate(-90)")
      .attr("y", 10)
      .attr("dx", 20)
      .style("text-anchor", "end");
  
    // Bars 
    death_svg.selectAll("mybar") 
      .data(data) 
      .join("rect") 
      .attr("x", d => x(d.age_group)) 
      .attr("width", x.bandwidth()) 
      .attr("fill", bar_colour) 
      // no bar at the beginning thus: 
      .attr("height", d => deathBar_height - y(0)) // always equal to 0 
      .attr("y", d => y(0)) 
      .on('mouseover', handleMouseOver_death)
      .on('mouseout', handleMouseOut_death)
      .on('mousemove', handleMouseMove_death)
                    
    // Animation 
    death_svg.selectAll("rect") 
      .transition() 
      .duration(2000) 
      .attr("y", d => y(d.number_of_death)) 
      .attr("height", d => deathBar_height - y(d.number_of_death))
  }
  
  // Append old data to the new data selected (for animation)
  function transition_deathState(data){
    for (i in selected_death_data.oldData){
      for (j in data){
        if((data[j]['age_group'] == selected_death_data.oldData[i]['age_group'])
        && data[j]['sex'] == selected_death_data.oldData[i]['sex']){
          data[j]['prev_value'] = selected_death_data.oldData[i]['number_of_death']
        }
      }
    }
    return data
  }
  
  // function to update the drawing by seperating the new data into two gender
  function update_numDeathBar(){
    filter_death_state = filter_death_data();
    deathState_transition = transition_deathState(filter_death_state);
    
    //update old data
    selected_death_data.oldData = filter_death_state;
  
    male_data = filter_gender(deathState_transition, "Male");
    female_data = filter_gender(deathState_transition, "Female");
  
    var max_val = d3.max(filter_death_state, function(d){ return d.number_of_death; })
  
    // if-else condition for max_val equals to 0
    if (max_val == 0){
      max_val = 100;
    }
  
    // ISSUE: CANNOT USE SAME FUNCTION TO UPDATE 
    update_numDeathBarMale(male_data, "#8caad2", max_val);
    update_numDeathBarFemale(female_data, "#e27c7c", max_val);  
  }
  
  // function to update the drawing of the bar for male
  function update_numDeathBarMale(data, bar_colour, max_val){
    // Add X axis
    const x = d3.scaleBand() 
      .range([ 0, deathBar_width ]) 
      .domain(data.map(d => d.age_group)) 
      .padding(0.2); 
      
    // Add Y axis 
    const y = d3.scaleLinear()
      .domain([0, max_val]) 
      .range([deathBar_height, 0]); 
      
    male_death_svg.select("#male-death-viz svg g #y-axis") 
      .transition()
      .duration(2000)
      .call(d3.axisLeft(y)); 
  
    // Bars 
    male_death_svg.selectAll("rect") 
      .transition()
      .duration(2000)
      .attr("x", d => x(d.age_group)) 
      .attr("y", d => y(d.number_of_death)) 
      .attr("height", d => deathBar_height - y(d.number_of_death)) 
      .on('end',function(){
        male_death_svg.selectAll('rect').remove()
        // bars
        male_death_svg.selectAll("mybar") 
          .data(data) 
          .join("rect") 
          .attr("x", d => x(d.age_group)) 
          .attr("width", x.bandwidth()) 
          .attr("fill", bar_colour)
          .attr("height", d => deathBar_height - y(d.prev_value))
          .attr("y", d => y(d.prev_value)) 
          .on('mouseover', handleMouseOver_death)
          .on('mouseout', handleMouseOut_death)
          .on('mousemove', handleMouseMove_death)
                      
        // Animation 
        male_death_svg.selectAll("rect") 
          .transition() 
          .duration(2000) 
          .attr("y", d => y(d.number_of_death)) 
          .attr("height", d => deathBar_height - y(d.number_of_death)) 
      })
  }
  
  // function to update the drawing of the bar for female
  function update_numDeathBarFemale(data, bar_colour, max_val){
    // Add X axis
    const x = d3.scaleBand() 
      .range([ 0, deathBar_width ]) 
      .domain(data.map(d => d.age_group)) 
      .padding(0.2); 
      
    // Add Y axis 
    const y = d3.scaleLinear()
      .domain([0, max_val]) 
      .range([deathBar_height, 0]); 
      
    female_death_svg.select("#female-death-viz svg g #y-axis") 
      .transition()
      .duration(2000)
      .call(d3.axisLeft(y)); 
  
    // bars 
    female_death_svg.selectAll("rect") 
      .transition()
      .duration(2000)
      .attr("x", d => x(d.age_group)) 
      .attr("y", d => y(d.number_of_death)) 
      .attr("height", d => deathBar_height - y(d.number_of_death)) 
      .on('end',function(){
        female_death_svg.selectAll('rect').remove()
        // update the bars to new value
        female_death_svg.selectAll("mybar") 
          .data(data) 
          .join("rect") 
          .attr("x", d => x(d.age_group)) 
          .attr("width", x.bandwidth()) 
          .attr("fill", bar_colour)
          .attr("height", d => deathBar_height - y(d.prev_value))
          .attr("y", d => y(d.prev_value)) 
          .on('mouseover', handleMouseOver_death)
          .on('mouseout', handleMouseOut_death)
          .on('mousemove', handleMouseMove_death)
                      
        // Animation 
        female_death_svg.selectAll("rect") 
          .transition() 
          .duration(2000) 
          .attr("y", d => y(d.number_of_death)) 
          .attr("height", d => deathBar_height - y(d.number_of_death)) 
      })
  }
  
  // filter death data based on the state and year selected
  function filter_death_data(){
    return selected_death_data.data.filter((d) => {
      if(selected_death_data.selectedState == d.state && selected_death_data.selectedYear == d.year){
        return true;
      }
      return false;
    })
  }
  
  // to filter the state death data into each gender
  function filter_gender(data, gender){
    var temp_data = [];
  
    for (i in data){
      if (data[i]['sex'] == gender){
        temp_data.push(data[i])
      }
    }
    return temp_data
  }
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // for disease data object
  const diseases_data = {
    oldData: [],
    data: [],
    selectedYear: '2013', //default value for year
    selectedState: 'Melaka' //default value for state
  };
  
  // Define the tooltip for diseases viz
  var disease_tooltip = d3.select("body .right-content #disease-viz").append("div")	
    .style("opacity", 0)
    .attr("class", "disease-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
  
  
  // mouse over function for diseases viz
  function handleMouseOver_disease(e, d){
    disease_tooltip
      .style('opacity', 1)
  
    d3.select(this)
      .attr('fill','#356773')
  }
  
  // mouse out of hover function for diseases viz
  function handleMouseOut_disease(e, d){
    disease_tooltip
      .style("opacity", 0);
  
    d3.select(this)
      .attr('fill','#69b3a2')
  }
  
  // mouse move function for diseases viz
  function handleMouseMove_disease(e, d){
    disease_tooltip
      .html("Disease: " + d.Communicable_Diseases + "<br>" + "Number of Cases: " + d.Value)
      .style("left", (e.pageX + 10) + "px")		
      .style("top", (e.pageY - 28) + "px");
  }
  
  // load disease data 
  d3.csv('dataset/type_of_diseases.csv').then((parsed) => {
    diseases_data.data = parsed.map((row) => {
      row.Value = parseInt(row.Value);
      row.Rate = parseFloat(row.Rate);
      return row;
    });
    draw_diseaseBarChart();
  });
  
  // set the dimensions and margins of the graph
  var diseaseElement = d3.select('.right-content #disease-viz').node();
  const diseaseBar_margin = {top: 20, right: 60, bottom: 120, left: 150},
  diseaseBar_width = diseaseElement.getBoundingClientRect().width - diseaseBar_margin.left - diseaseBar_margin.right,
  diseaseBar_height = diseaseElement.getBoundingClientRect().height - diseaseBar_margin.top - diseaseBar_margin.bottom;
  
  // append the svg object to the body of the page
  const diseaseBar_canvas = d3.select(".right-content #disease-viz")
    .append('svg')
    .attr("width", diseaseBar_width + diseaseBar_margin.left + diseaseBar_margin.right)
    .attr("height", diseaseBar_height + diseaseBar_margin.top + diseaseBar_margin.bottom)
    .append("g")
    .attr("transform", `translate(${diseaseBar_margin.left}, ${diseaseBar_margin.top})`);  
  
  // function to initialize the drawing for diseases viz
  function draw_diseaseBarChart(){
    filter_disease = filter_disease_data();
  
    // sort descending and get Top 10
    topData = filter_disease.sort(function(a, b) {
      return b.Value - a.Value;
    }).slice(0,10);
  
    diseases_data.oldData = topData;
  
    // get the state selected name
    state_name = topData[0]['State']
  
    d3.select('.left-content #map-viz p')
      .text("State Selected: " + state_name)
    
    //X-axis
    const x = d3.scaleLinear()
      .domain([0, d3.max(topData, function(d){ return d.Value; })])
      .range([ 0, diseaseBar_width]);
    
    var xAxisGroup = diseaseBar_canvas.append("g")
      .attr('id','x-axis')
      .attr("transform", `translate(0, ${diseaseBar_height})`)
      .call(d3.axisBottom(x))
      
    xAxisGroup.selectAll("text")
      .attr("transform", "translate(5,0)")
      .style("text-anchor", "end");
  
    xAxisGroup.append("text")
      .text("Number of Cases")
      .style("fill", "black")
      .attr("y", 30)
      .attr("dx", 350)
      .style("text-anchor", "end");
    
    // Y axis
    const y = d3.scaleBand()
      .range([ 0, diseaseBar_height ])
      .domain(topData.map(d => d.Communicable_Diseases))
      .padding(.1);
    
    var yAxisGroup = diseaseBar_canvas.append("g")
      .attr('id','y-axis')
      .call(d3.axisLeft(y));
  
    yAxisGroup.append("text")
      .text("Type of Diseases")
      .style("fill", "black")
      .attr("y", -5)
      .attr("dx", 0)
      .style("text-anchor", "end");
    
    // bars
    diseaseBar_canvas.selectAll("myRect")
      .data(topData)
      .join("rect")
      .attr("x", x(0) )
      .attr("y", d => y(d.Communicable_Diseases))
      .attr("width", 0) //always equal to 0
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2")
      .on('mouseover', handleMouseOver_disease)
      .on('mouseout', handleMouseOut_disease)
      .on('mousemove', handleMouseMove_disease)
    
    // animation
    diseaseBar_canvas.selectAll("rect")
      .transition()
      .duration(2000)
      .attr("y", d => y(d.Communicable_Diseases))
      .attr("width", d => x(d.Value))
      .delay((d,i) => {return i*100})
  }
  
  // add old data to the new data selected
  function transition_diseaseData(data){
    for (i in diseases_data.oldData){
      for (j in data){
        if(data[j]['Communicable_Diseases'] == diseases_data.oldData[i]['Communicable_Diseases']){
          data[j]['prev_value'] = diseases_data.oldData[i]['Value']
        }
      }
    }
    return data
  }
  
  // function to update the diseases viz based on new state/year selected
  function update_diseaseBarChart(){
    filter_disease = filter_disease_data();
  
    // sort descending and get Top 10
    topData = filter_disease.sort(function(a, b) {
      return b.Value - a.Value;
    }).slice(0,10);
  
    diseasesData_transition = transition_diseaseData(topData);
  
    // update old data
    diseases_data.oldData = topData;
  
    // get the selected state name
    state_name = topData[0]['State']
  
    d3.select('.left-content #map-viz p')
      .text("State Selected: " + state_name)
    
    //X-axis
    const x = d3.scaleLinear()
      .domain([0, d3.max(topData, function(d){ return d.Value; })])
      .range([ 0, diseaseBar_width]);
  
    diseaseBar_canvas.select('#disease-viz svg g #x-axis')
      .transition()
      .duration(2000)
      .call(d3.axisBottom(x))
    
    // Y axis
    const y = d3.scaleBand()
      .range([ 0, diseaseBar_height ])
      .domain(topData.map(d => d.Communicable_Diseases))
      .padding(.1);
    
    diseaseBar_canvas.select("#disease-viz svg g #y-axis")
      .transition()
      .duration(2000)
      .call(d3.axisLeft(y));
    
    // bars (transition to rearrange the bars to the new position)
    diseaseBar_canvas.selectAll("rect")
      .transition()
      .duration(2000)
      .attr("y", d => y(d.Communicable_Diseases))
      .attr("width", d => x(d.Value))
      .on("end", function(){
        diseaseBar_canvas.selectAll('rect').remove()
        // bars (transition to update the bar width to the new value)
        diseaseBar_canvas.selectAll("myRect")
          .data(diseasesData_transition)
          .join("rect")
          .attr("x", x(0) )
          .attr("y", d => y(d.Communicable_Diseases))
          .attr("width", d => x(d.prev_value))
          .attr("height", y.bandwidth())
          .attr("fill", "#69b3a2")
          .on('mouseover', handleMouseOver_disease)
          .on('mouseout', handleMouseOut_disease)
          .on('mousemove', handleMouseMove_disease)
  
  
        // animation to new bar width
        diseaseBar_canvas.selectAll("rect")
          .transition()
          .duration(2000)
          .attr("y", d => y(d.Communicable_Diseases))
          .attr("width", d => x(d.Value))
      })
  }
      
  // filter disease data based on the state and year selected
  function filter_disease_data(){
    return diseases_data.data.filter((d) => {
      if(diseases_data.selectedState == d.State && diseases_data.selectedYear == d.Year){
        return true;
      }
      return false;
    })
  }