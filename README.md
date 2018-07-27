# CS498 Data Visualization 

D3 application using cryptocurrency data.

##   About

	This visualization tells the story of cryptocurrency appreciation in 2017. Firstly we examine the performance of traditional investments in 2017, and then compare and contrast with Bitcoin.  We follow up by summarizing the risk-return and risk-liquidity relationships of 250+ cryptocurrencies. 

	This visualization is tested to work on Safari, Chrome and Microsoft Edge. Let me know if there's any compatability issues (I've had issues with Firefox)

##	  Hybrid Structure   
                
                The visualization employs an interactive slideshow< structure. Through 5 slides we tell a linear / sequential story whilst allowing some user interactions per scene. 
                On the sides of each chart, I have added  'next'  and  'previous'  buttons allowing users to guide forwards and backwards through the slides. 
                Furthermore, at the bottom of the chart frame, I have added   'dot / bullet indicators' . This lets users know their progress through the interactive slideshow. 
                At the top of the chart frame, I have also included a  'page number' . 
                By clicking through the charts, the user triggers parameter changes, and the bullet indicators and page numbers are updated to the new scene.
			

##	  Scene Utilization   
                
                We utilize slides (chart frames) to create scenes. The scenes have a consistent layout so as to avoid disorientating the user. <br /> When the user hovers over the navigation buttons and dots, it triggers a change in color/shade providing visual cue (affordance).

                Two types of charts have been used in the scenes. 
       
                * Line charts are used depict changes in asset prices over time. Multiple line charts are used to compare one asset with another. The users to toggle to add and delete lines on the chart. 
                * Scatterplots are used to describe the interaction between two numeric variables. The radius of each dot represents the log market cap (gylph).
            

    

##     Annotations   
                    
                     Each slide contains text annotating the scene with insights from the data.     
                     For linecharts that depict changes through time, we annotate key events directly on the chart via text labels. Readers can directly see the impact of news events on cryptocurrency prices. (slide 2)    
                     In Scene 2, annotations relating to Bitcoin events are cleared when the user removes Bitcoin from the chart.     
                     For Scatterplots, text label annotations and dotted-lines highlight key trends in the data.     
                     [Technically not an annotation] For Scatterplots, tooltips are used that pop-up through 'mouseovers' providing users with more data on demand. These are cleared by 'mouseout'.    


## Parameters    
			        
				     On/off visibility parameters control each line in the interactive line charts. Users can switch the lines on and off from the legend below the chart.      
				     The slide number parameter controls which chart to be displayed in this interactive slideshow. The user is able to change the slide number parameter by clicking on the back / forth arrows or progress dots and the bottom of the chart.     
				      Mouse coordinate parameters controls the tooltips, showing the date/time value and the prices associated with the date/time value.    
	

## Triggers    
			        
			 	      Mouse click  events (on arrows and progress dots) act as triggers to allow navigation between charts.     
				      Mouse over   events in line charts triggers the tooltip to refresh with price values and associated date / time in upper left hand corner. (Scenes 1 to 3)     
				      Mouse over   events in scatterplot triggers a tooltip allowing users to view additional information on the selected cryptocurrency. (Scenes 4 to 5)     
				      Mouse click  events on the legend of the line chart triggers whether a line is displayed or not. The axes, and the annotations are also updated. (Scenes 1 to 3)     


