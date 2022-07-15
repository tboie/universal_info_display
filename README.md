# UNIVERSAL INFO DISPLAY (ITEMS)

<img width="430" alt="concept" src="https://user-images.githubusercontent.com/26150152/179231190-2058acd2-1232-4a59-8467-d11a9fe26417.png">
<img width="430" alt="flow diagram" src="https://user-images.githubusercontent.com/26150152/179226458-354bcd17-a83d-41aa-8cfa-7e52709955ec.png">
<img width="268" alt="item ui" src="https://user-images.githubusercontent.com/26150152/179121738-379bb89c-0af4-49c3-9fb7-40ca0486c515.png">
<img width="268" alt="map" src="https://user-images.githubusercontent.com/26150152/179227076-1b0dd3f7-9807-4b37-af56-fee6dcb02ec3.png">

### Version 1 (Mobile)
- Display nearest *x* items less than *x* miles (50 default) from device location

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
- [iPhone Camera recorded video in square 1:1 format](https://jilaxzone.com/2021/11/23/heres-how-to-record-square-video-on-iphone-instead-of-default-169-no-3rd-party-app-installation-required/)
- [3D Printed Phone Stand](https://www.tinkercad.com/things/c7iPako4ej5-phone-stand) [[.stl file]](https://github.com/tboie/universal_info_display/blob/groups/public/3d/phone-stand.stl)
- [Arduino Uno](https://store-usa.arduino.cc/products/arduino-uno-rev3) [[arduino stepper code file]](https://github.com/tboie/universal_info_display/blob/groups/public/arduino/stepper_onerev_28BYJ-48.ino)
- [Stepper Motor 28BYJ-48](https://create.arduino.cc/projecthub/debanshudas23/getting-started-with-stepper-motor-28byj-48-3de8c9)
- [3D Printed Flower Pin Nozzle](https://www.tinkercad.com/things/0bvBJ69fsWk-needle-piece) [[.stl file]](https://github.com/tboie/universal_info_display/blob/groups/public/3d/needle-piece.stl)
- [Flower Pins](https://www.walmart.com/ip/Dritz-Flat-Flower-Pin-100-Pack/51236523)
- [Rubber Bumpers for noise reduction](https://www.walmart.com/ip/Clear-Adhesive-Bumper-Pads-106-PC-Combo-Pack-Round-Spherical-Square-Made-USA-Sound-Dampening-Transparent-Rubber-Feet-Cabinet-Doors-Drawers-Glass-Tops/762207313)
- [ffmpeg](https://ffmpeg.org) video conversion
- [backgroundremover](https://github.com/nadermx/backgroundremover) video background removal

### Camera To Computer
- Item is rotating on stepper motor at [[360 degrees per 30 seconds]](https://github.com/tboie/universal_info_display/blob/groups/public/arduino/stepper_onerev_28BYJ-48.ino)
- Use the phone stand and links above to [record square video](https://jilaxzone.com/2021/11/23/heres-how-to-record-square-video-on-iphone-instead-of-default-169-no-3rd-party-app-installation-required/) and rotate item on above setup
- Transfer from phone to Photos App on OS X then export (File > Export) to drive and there should now be a square .mov file.

### Video Conversion Commands
NOTE: 10 seconds is considered the official slice start time because the camera had to be re-adjusted due to slight movements after rec ording
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
