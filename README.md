# CCEP Project New Repo

![screen_cap](https://github.com/datakind/ccep-new-year/blob/master/assets/screencap.png?raw=true "screen_cap")

# Requirements
1. Address bar that will zoom to location on the map (would be nice to add a point to indicate the location)
2. Have ability to scale the circles (all things should be circles - not squares -- I can change that) to a geographic unit - either .5 miles or 1.5 miles depending on if it is rural/urban. The points are redrawn on any change of zoom level, so the piece that is missing is a translation from zoom level to appropriate circle radis. so like need something that gives `f(zoom_level, .5) = radius.`
3. A bunch of menu edits and stuff - i can iron most of that out but might have quesitons on best practices, etc. 
4. All data files should be available for download - we can just host the data somewhere and supply links - but needs to live somewhere on the site, maybe just a download page. (shouldn't be too hard)
5. Maps avaiable for download - i think a screen shot could be good enough - but something automated would be incredibly helpful. 
6. Indicator Data (the ALAND/AWATER is just placeholder for now - will be a bunch of other stuff) should have some sort of float over description of what this information is. Like if we included ALAND on float over it would say "Land Area in this tract in Square Meteres "

# Somewhere Inbetween 
1. Work on Mobile - right now it looks like it does not work on mobile - the selection menu for some reason doesn't show the points on the choropleth stuff. Honestly i'm just not sure what this all entails. If its a total pain then can revisit with client. My guess is that is is just for someone to reference the map while they are looking for polling locations in the field. 

# Wish List
1. Allow people to plot their own list of addresses - this is a secondary goal. 
2. Accessible for people with disailities (again not sure what this entails but was brought up. Doesn't HTML5 have some stuff related to this - not sure this even makes sense if the primary output is a map. )