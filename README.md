# UNIVERSAL INFO DISPLAY (ITEMS)

<img width="420" alt="concept" src="https://user-images.githubusercontent.com/26150152/153199853-4c7d251f-da39-42b1-a879-6e4f9e588c1d.png">
<img width="278" alt="item ui" src="https://user-images.githubusercontent.com/26150152/179121738-379bb89c-0af4-49c3-9fb7-40ca0486c515.png">
<img width="306" alt="map" src="https://user-images.githubusercontent.com/26150152/179119627-45414340-532c-419d-8015-b4b1e0a748cf.png">


### Version 1 (Mobile)
- Display nearest x items less than x miles (50 default) from device location

### Goals
- Experiment navigating a simplified horizontally-scrolled content system
- Experiment enhanced content media presentation with rotating 3D effect items 
- Experiment using a real industry-level dataset (100k+ items, 2500+ stores)
- Experiment map integration for items with [openstreetmap](https://openstreetmap.org)

### Install/Run
(view using mobile in browser dev tools)
```
npm i
npm start
```

### Performance
- Pages are proximity-rendered from currently viewed/selected page

### Industry Dataset
- Tools were custom created for harvesting and reverse lookup

### Media Equipment/Software
- iPhone camera
- 3D printed stand for phone
- Arduino uno with stepper motor
- 3D printed nozzle for stepper motor to hold flower pin
- [ffmpeg](https://ffmpeg.org) for video conversion
- [backgroundremover](https://github.com/nadermx/backgroundremover) for item background removal

### Camera To Computer
- Item is rotating on stepper motor at 360 degrees per 30 seconds
- Recorded with iphone video as a square on phone stand
- Download to photos app on imac then export to hard drive
- 10 seconds is considered the official slice start time because the camera had to be re-adjusted due to slight movements after rec ording

### Video Conversion Commands
1. Slice 30 seconds (1 rotation) and create new keyframes from video starting at 10 seconds
```
ffmpeg -i orig.mov -ss 00:00:10 -t 00:00:05 -r 10 -async 1 out-test.mov
```

2. Remove background of mov and export gif
```
backgroundremover -i "out.mov" -tg -o "out2.gif"
```

3. Scale gif and retain transparency
```
ffmpeg -i out2.gif -filter_complex "[0:v] scale=200:200:flags=lanczos,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse" -loop 0 final.gif
```

### Media Optimization Opportunity (secret sauce?)
Have the item "float" by displaying a slice of a full rotation.
- Use CSS sprite animations
- Play in forwards then reverse

### TODO/THINK/(RE)DESIGN
- Loader Page
- Selected Item Template Page
- Allow more filters and scroll 
- Search
- Themes
- Extend map features?
- Online shopping?
